import { GoogleGenAI } from '@google/genai';
import http from 'http';

// Substitua pelo processo seguro de env ou insira sua chave temporariamente aqui
const apiKey = process.env.GEMINI_API_KEY || "SUA_CHAVE_GEMINI_AQUI";
const ai = new GoogleGenAI({ apiKey: apiKey });

const server = http.createServer(async (req, res) => {
    // Habilita o CORS para o front-end conseguir acessar a API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/gerar-slides') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { tema } = JSON.parse(body);

                // Prompt engenheirado para retornar a estrutura exata do slide
                const prompt = `Crie uma apresentação de aula detalhada sobre o tema: "${tema}". 
                Retorne a resposta estritamente em formato JSON, sem marcações de markdown (como \`\`\`json).
                O formato deve ser exatamente uma lista de objetos com "titulo" e "conteudo" (em tópicos estruturados).
                Exemplo de formato:
                [
                  {"titulo": "Introdução", "conteudo": ["Tópico 1", "Tópico 2"]},
                  {"titulo": "Conceito Chave", "conteudo": ["Explicação A", "Explicação B"]}
                ]`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                let jsonResponse = response.text.trim();
                // Limpeza de segurança caso a IA insira blocos de código markdown
                if (jsonResponse.startsWith('```')) {
                    jsonResponse = jsonResponse.replace(/```json|```/g, '').trim();
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(jsonResponse);

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Erro ao gerar os slides: " + error.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
