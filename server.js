const express = require("express");
const path = require('path');
let app = express();
let server = require('http').createServer(app);

let io = require('socket.io')(server);

app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'public'));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

let jogadores = {};
let palavraArray;
let letrasAcertadas = [];
let letrasJogo = [];

app.use('/',(req,res)=>{

    res.render('index.html');
    
})

io.on('connection',socket=>{

    socket.on('infojogador',data=>{

        let pontos = 0;
        let jogador = data.nomeJogador;

        jogadores[jogador]=pontos;

        io.emit('inforecebido',{jogador,pontos});

    })

    socket.on('jogoIniciado',data=>{

        palavraArray = data.palavra.split('');
        letrasAcertadas = [];
        letrasJogo = [];

        io.emit('jogorecebido',data);

    })

    // socket.on('perdeujogo',(jogador)=>{

    //     console.log(jogador);

    // })

    socket.on('temLetra',data=>{

        let jogador = data.nomeJogador;

        let jaTemLetra = letrasJogo.includes(data.letra);

        if(!jaTemLetra){

            letrasJogo.push(data.letra);

        }
        else{

            return;

        }

        if(palavraArray.includes(data.letra)){

            letrasAcertadas.push(data.letra);

            let letra = data.letra;
            let posicoes = [];

            palavraArray.forEach((letraArray,posicao)=>{

                if(letraArray==letra)  posicoes.push(posicao);

            })

            io.emit('verificadoLetra',{letra,posicoes});

                let novaPalavra = palavraArray.join('').replaceAll(' ','').split('');

                let ganhou = novaPalavra.every(letraPalavra=>{

                    return letrasAcertadas.includes(letraPalavra);

                })

                if(ganhou){

                    jogadores[jogador]+=10;

                    io.emit('ganhou',{jogadores,jogador});

                }

        }
        else{

            io.emit('naotemletra',data);

        }

        io.emit('atualizaletrasjogo',{letrasJogo});

    })

    socket.on('atualizaplacar',data=>{

        jogadores[data.nomeJogador]+=10;

    })
})

server.listen(3000);

