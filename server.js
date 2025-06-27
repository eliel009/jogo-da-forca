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

io.on('connection',socket=>{

    console.log('conectado');

    socket.on('jogoIniciado',data=>{

        console.log(data);

        io.emit('jogorecebido',data);

    })

    socket.on('temLetra',data=>{

        console.log(data);
        io.emit('verificadoLetra',data);

    })
})

server.listen(3000);

