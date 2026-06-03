let slidesData = [];
let currentSlideIndex = 0;

async function gerarApresentacao() {
    const tema = document.getElementById('temaInput').value;
    const loading = document.getElementById('loading');
    const controles = document.getElementById('controles');
    
    if (!tema) {
        alert("Por favor, insira um tema para a aula!");
        return;
    }

    loading.style.display = "block";
    
    try {
        const response = await fetch('http://localhost:3000/gerar-slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });

        if (!response.ok) throw new Error("Erro na requisição ao servidor.");

        slidesData = await response.json();
        currentSlideIndex = 0;
        
        if(slidesData.length > 0) {
            exibirSlide(currentSlideIndex);
            controles.style.display = "flex";
        }

    } catch (error) {
        alert("Ocorreu um erro ao gerar a aula. Verifique o console do servidor.");
        console.error(error);
    } finally {
        loading.style.display = "none";
    }
}

function exibirSlide(index) {
    const titulo = document.getElementById('tituloSlide');
    const conteudo = document.getElementById('conteudoSlide');
    const contador = document.getElementById('contadorSlide');
    
    const slide = slidesData[index];
    titulo.innerText = slide.titulo;
    
    // Converte a resposta em tópicos HTML se for uma lista
    if (Array.isArray(slide.conteudo)) {
        let htmlList = "<ul>";
        slide.conteudo.forEach(item => {
            htmlList += `<li>${item}</li>`;
        });
        htmlList += "</ul>";
        conteudo.innerHTML = htmlList;
    } else {
        conteudo.innerText = slide.conteudo;
    }
    
    contador.innerText = `${index + 1} / ${slidesData.length}`;
}

function proximoSlide() {
    if (currentSlideIndex < slidesData.length - 1) {
        currentSlideIndex++;
        exibirSlide(currentSlideIndex);
    }
}

function slideAnterior() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        exibirSlide(currentSlideIndex);
    }
}
