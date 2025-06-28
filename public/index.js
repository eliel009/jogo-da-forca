const btnNovoJogo = document.querySelector('.novo-jogo');
const FormTemLetra = document.querySelector('.form-tem-letra');
const BtnTemLetra = document.querySelector('.tem-letra');
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

// Recebe informações do jogador (nome e pontos iniciais)
socket.on('inforecebido', data => {
    const jogadorExistente = document.querySelector(`[data-set-jogador="${data.nomeJogador}"]`);

    if (!jogadorExistente) {
        placar.innerHTML += `
            <div class='info-jogador' data-set-jogador="${data.nomeJogador}">
                <strong class='title-jogador'>${data.nomeJogador}</strong>: <span class='pontos'>${data.pontos}</span> Pontos
            </div>`;
    }
});

// Recebe nova rodada do jogo
socket.on('jogorecebido', data => {
    resetJogo();
    dicaText.textContent = retornaUpperCase(`Dica: ${data.dica}`);
    BtnTemLetra.disabled = false;
    letra.disabled = false;
    renderizaLetras(data.palavra);
    letra.focus();
});

// Recebe letra digitada para mostrar nos campos da palavra
socket.on('verificadoLetra', data => {
    if (data.letra && data.letra.length == 1 && data.letra !== ' ') {
        verificaLetra(data.letra);
    } else {
        alert("Digite uma letra!");
    }

    letraEscolhidaText.textContent = retornaUpperCase(letrasEscolhidas.join(','));
    letra.value = '';
});

// Atualiza o placar quando alguém ganha
socket.on('placarrecebido', data => {
    const infoJogadorEl = document.querySelector(`[data-set-jogador="${data.nomeJogador}"]`);

    if (infoJogadorEl) {
        infoJogadorEl.querySelector('.pontos').textContent = data.pontos;
    } else {
        placar.innerHTML += `
            <div class='info-jogador' data-set-jogador="${data.nomeJogador}">
                <strong class='title-jogador'>${data.nomeJogador}</strong>: <span class='pontos'>${data.pontos}</span> Pontos
            </div>`;
    }

    alert(`${data.nomeJogador} completou a palavra e ganhou 10 pontos!`);
});

// Cadastro do jogador
formNomeJogador.addEventListener('submit', event => {
    event.preventDefault();
    nomeJogador = nomeJogadorEl.value.trim() || "Jogador Desconhecido";
    socket.emit('infojogador', { nomeJogador, pontos: 0 });
});

// Início de uma nova rodada
btnNovoJogo.addEventListener('click', () => {
    let dica = retornaUpperCase(prompt("Digite a dica:"));
    let palavra = retornaUpperCase(prompt("Digite a palavra:"));

    if (!dica || !palavra) return;

    socket.emit('jogoIniciado', { dica, palavra });
});

// Jogada: envia a letra
FormTemLetra.addEventListener('submit', event => {
    event.preventDefault();
    socket.emit('temLetra', {
        letra: retornaUpperCase(letra.value),
        nomeJogador
    });
});

// Funções auxiliares

function renderizaLetras(palavra) {
    palavra = retornaUpperCase(palavra).replace(' ','');
    palavraArray = palavra.split('');
    let spanColecao = "";

    for (let letra of palavraArray) {
        spanColecao += `<div class='letra-container'><span class='letra'>${letra}</span></div>`;
    }

    painel.innerHTML = spanColecao;
}

function verificaLetra(letra) {
    const letrasPalavra = [...document.querySelectorAll('.letra')];
    const letrasDiv = letrasPalavra.filter(div => div.textContent === letra);

    if (!letrasDiv.length && !letrasEscolhidas.includes(letra)) {
        naoTemLetra(letra);
    }

    for (let div of letrasDiv) {
        div.classList.add('letra-visible');
    }

    verificaSeGanhou(); // Apenas visual
}

function naoTemLetra(letra) {
    letrasEscolhidas.push(retornaUpperCase(letra));
    tentativas--;

    alert("Não tem essa letra!");

    exibeImagem();

    if (tentativas <= 0) {
        perdeuJogo();
    }
}

function perdeuJogo() {
    BtnTemLetra.disabled = true;
    letra.disabled = true;
    alert('Você perdeu!');
}

function verificaSeGanhou() {
    const letrasElement = [...document.querySelectorAll('.letra')].filter(letraEl => letraEl.textContent !== ' ');
    const ganhou = letrasElement.every(letraEl => letraEl.classList.contains('letra-visible'));

    if (ganhou) {
        BtnTemLetra.disabled = true;
        letra.disabled = true;
        // O servidor se encarrega de somar os pontos
    }
}

function resetJogo() {
    letraEscolhidaText.textContent = "";
    letrasEscolhidas = [];
    tentativas = 6;

    const containerDesenho = document.querySelector('.desenho');
    [...containerDesenho.querySelectorAll('img')].forEach(img => {
        img.classList.remove('img-visible');
    });
}

function exibeImagem() {
    const imagem = document.querySelector(`.${imagens[tentativas]}`);
    if (imagem) {
        imagem.classList.add('img-visible');
    }
}

function retornaUpperCase(text) {
    return text.toUpperCase();
}
