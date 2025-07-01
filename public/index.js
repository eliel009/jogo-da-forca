const btnNovoJogo = document.querySelector('.novo-jogo');
const FormTemLetra = document.querySelector('.form-tem-letra');
const BtnTemLetra = document.querySelector('.tem-letra');
const BtnJogador = document.querySelector('#btn-novo-jogador');
const letraEscolhidaText = document.querySelector('.letras-escolhidas');
const letra = document.querySelector('.letra-digitada');
const nomeJogadorEl = document.querySelector('.nome-jogador');
const dicaText = document.querySelector('.dica');
const painel = document.querySelector('.painel-palavra');
const placar = document.querySelector('.placar');
const formNomeJogador = document.querySelector('.form-nome-jogador');

const imagens = ['perna_1','perna_2','braco_2','braco_1','corpo','cabeca'];

let palavraArray;
let letrasEscolhidas = [];
let tentativas = 6;
let nomeJogador;

let socket = io();

socket.on('inforecebido',data=>{
    console.log(data.jogador);
    placar.innerHTML +=
    `<div class='info-jogador' data-set-jogador=${data.jogador}>
        <strong class='title-jogador'>${data.jogador}</strong>: <span class='pontos'>${data.pontos}</span> Pontos
    </div>`
})

socket.on('jogorecebido',data=>{

    resetJogo();

    dicaText.textContent = retornaUpperCase(`Dica: ${data.dica}`);

    BtnTemLetra.disabled = false;
    letra.disabled = false;

    renderizaLetras(data.palavra);

    letra.focus();

})

socket.on('verificadoLetra',infoletra=>{

    verificaLetra(infoletra);

})

socket.on('ganhou',data=>{
    ganhou(data);
})

socket.on('naotemletra',data=>{

    naoTemLetra(data.letra);

})

formNomeJogador.addEventListener('submit',event=>{

    event.preventDefault();

    nomeJogador = nomeJogadorEl.value || "Jogador Desconhecido";

    BtnJogador.disabled = true;

    socket.emit('infojogador',{nomeJogador});

})

btnNovoJogo.addEventListener('click',event=>{

    let dica = retornaUpperCase(prompt("Digite a dica!"));
    let palavra = retornaUpperCase(prompt("Digite a palavra!"));

    if(!dica || !palavra) return;

    let data = {dica,palavra};

    socket.emit('jogoIniciado',data);

})

FormTemLetra.addEventListener('submit',event=>{

    event.preventDefault();

    socket.emit('temLetra',{letra:retornaUpperCase(letra.value),nomeJogador});

    FormTemLetra.reset();

})

function renderizaLetras(palavra){

    let spanColecao = "";

    palavra = retornaUpperCase(palavra)

    palavraArray = palavra.split('');

    for(let letra of palavraArray){

        spanColecao+=`<div class='letra-container'><span class='letra'>${letra}</span></div>`;

    }

    painel.innerHTML = spanColecao;

}

function verificaLetra(infoLetra){

    let letrasPalavra = [...document.querySelectorAll('.letra')];

    letrasPalavra.forEach((letraDiv,posicaoDiv,div)=>{

        div[infoLetra.posicoes[posicaoDiv]].classList.add('letra-visible');

    })

}

function naoTemLetra(letra){

    letrasEscolhidas.push(retornaUpperCase(letra));

    tentativas-=1;

    alert("não tem");

    exibeImagem();
        
    if(tentativas<=0){

        perdeuJogo();

    }

}

function perdeuJogo(){

    BtnTemLetra.disabled = true;
    letra.disabled = true;

    alert('perdeu');

}

function ganhou(infoPartida){

    alert(`ganhador ${infoPartida.jogador}`);

    atulizaPlacar(infoPartida.jogadores);

}

function atulizaPlacar(jogadores){

    let divsJogadores = [...document.querySelectorAll('.info-jogador')];

    divsJogadores.forEach(divJogador=>{

        if(jogadores[divJogador.dataset.setJogador]){

            let pontosEl = divJogador.querySelector('.pontos');

            pontosEl.textContent = jogadores[divJogador.dataset.setJogador];

        }

    })

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

function retornaUpperCase(text){

    return text.toUpperCase();

}