const btnNovoJogo = document.querySelector('.novo-jogo');
const FormTemLetra = document.querySelector('.form-tem-letra');
const BtnTemLetra = document.querySelector('.tem-letra');
const letraEscolhidaText = document.querySelector('.letras-escolhidas');
const letra = document.querySelector('.letra-digitada');
const dicaText = document.querySelector('.dica');
const painel = document.querySelector('.painel-palavra');

const imagens = ['perna_1','perna_2','braco_2','braco_1','corpo','cabeca'];

let palavraArray;
let letrasEscolhidas = [];
let tentativas = 6;

let socket = io();

socket.on('jogorecebido',data=>{

    resetJogo();

    dicaText.textContent = `Dica: ${data.dica}`;

    BtnTemLetra.disabled = false;
    letra.disabled = false;

    renderizaLetras(data.palavra);

    letra.focus();

})

socket.on('verificadoLetra',data=>{

    if(data.letra && data.letra.length==1 && data.letra != ' '){

        verificaLetra(data.letra);

    }
    else{

        alert("Digite uma letra!");

        letra.focus();

    }

    letraEscolhidaText.textContent = letrasEscolhidas.join(',');
    letra.value = '';
    letra.focus();

})

btnNovoJogo.addEventListener('click',event=>{

    let dica = prompt("Digite a dica!");
    let palavra = prompt("Digite a palavra!");

    if(!dica || !palavra) return;

    let data = {dica,palavra};

    socket.emit('jogoIniciado',data);

})


FormTemLetra.addEventListener('submit',event=>{

    event.preventDefault();

    socket.emit('temLetra',{letra:letra.value});

})

function renderizaLetras(palavra){

    let spanColecao = "";

    palavraArray = palavra.split('');

    for(let letra of palavraArray){

        spanColecao+=`<div class='letra-container'><span class='letra'>${letra}</span></div>`;

    }

    painel.innerHTML = spanColecao;

}

function verificaLetra(letra){

    let letrasPalavra = [...document.querySelectorAll('.letra')];

    let letrasDiv = letrasPalavra.filter(letraDiv=>letraDiv.textContent == letra);

    if(!letrasDiv.length && !letrasEscolhidas.includes(letra)){

        naoTemLetra(letra);
        
    }

    for(let letraDiv of letrasDiv){

        letraDiv.classList.add('letra-visible');

    }

    verificaSeGanhou();

}

function naoTemLetra(letra){

    letrasEscolhidas.push(letra);

    tentativas-=1;

    alert("não tem");

    exibeImagem();
        
    if(tentativas<=0){

        perdeuJogo();

    }

}

function perdeuJogo(){

    BtnTemLetra.disabled = true;
    letra.disabled = true

}

function verificaSeGanhou(){

    let letrasElement = [...document.querySelectorAll('.letra')].filter(letraElement=>{

        return letraElement.textContent != ' ';

    });


    let ganhou = letrasElement.every(letraElement=>{

        return letraElement.classList.contains('letra-visible');

    })

    if(ganhou){

        alert('ganhou');

    }

}

function resetJogo(){

    letraEscolhidaText.textContent = "";

    letrasEscolhidas = [];

    tentativas = 6;

    const containerDesenho = document.querySelector('.desenho');

    [...containerDesenho.querySelectorAll('img')].forEach(img=>{

        img.classList.remove('img-visible');

    })

}

function exibeImagem(){

    let imagem = document.querySelector(`.${imagens[tentativas]}`);

    imagem.classList.add('img-visible');

}