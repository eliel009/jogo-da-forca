const express = require("express");
const path = require('path');
let app = express();
let server = require('http').createServer(app);

let io = require('socket.io')(server);

app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'public'));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

app.use('/',(req,res)=>{

    res.render('index.html');
    
})

let palavraAtual = "";
let letrasCorretas = [];
let jogadores = {};

io.on('connection', socket => {
    socket.on('infojogador', data => {
        jogadores[data.nomeJogador] = { pontos: data.pontos || 0 };
        io.emit('inforecebido', data);
    });

    socket.on('jogoIniciado', data => {
        palavraAtual = data.palavra.toUpperCase();
        letrasCorretas = [];
        io.emit('jogorecebido', data);
    });

    socket.on('temLetra', data => {
        const letra = data.letra;
        const nome = data.nomeJogador;

        const palavraArray = palavraAtual.split('');

        if (!letra || letra.length !== 1 || letra === ' ') return;

        io.emit('verificadoLetra', { letra }); // Atualiza a letra para todos

        // Verifica se a letra está na palavra e adiciona
        if (palavraArray.includes(letra) && !letrasCorretas.includes(letra)) {
            letrasCorretas.push(letra);
        }

        // Verifica se todas as letras foram adivinhadas
        const letrasUniques = [...new Set(palavraArray.filter(l => l !== ' '))];
        const todasAdivinhadas = letrasUniques.every(l => letrasCorretas.includes(l));

        if (todasAdivinhadas) {
            // Soma os pontos do jogador
            jogadores[nome].pontos += 10;

            io.emit('placarrecebido', {
                nomeJogador: nome,
                pontos: jogadores[nome].pontos
            });
        }
    });
});


server.listen(3000);