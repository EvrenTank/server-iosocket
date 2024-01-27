const {shuffleArray,imgDirectories} = require('./images');
const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET", "POST"],
    },
});
var myValue = null;
var shuffledArray = [];
if(myValue === null){
     myValue = Math.floor(Math.random()*155); 
}
if(shuffledArray.length == 0){
    shuffledArray = shuffleArray(imgDirectories,"fruits",3);
    //console.log("shuffledArray",shuffledArray);
}

io.on("connection",(socket)=>{
    //console.log(`${socket.id}`)
    var currentPlayer;
    socket.on("joinRoom",(data)=>{
        var clientsInRoom = io.sockets.adapter.rooms.get(data.room);
        //console.log("clientsInRoom",clientsInRoom.size);
        if( !clientsInRoom || clientsInRoom.size < 2){
            socket.join(data.room);
            clientsInRoom = io.sockets.adapter.rooms.get(data.room);
            currentPlayer = [...clientsInRoom][0];
            console.log("clientsInRoom",clientsInRoom);
            console.log("joinRoom içinde currentplayer",[...clientsInRoom][0]);
            //console.log(`User joined room ${data.room}`);
            socket.emit("getIn",{message:"Room is available"});
        }
        else if(!(clientsInRoom.size < 2)){
            socket.emit("getIn",{message:"Room is full!"});
        }

    });
    socket.on("setTurn",(data)=>{

        const clientsInRoom = io.sockets.adapter.rooms.get(data.room);  
        if( clientsInRoom && clientsInRoom.size == 2){
            const player1 = [...clientsInRoom][0];
            console.log("player1",player1);
            const player2 = [...clientsInRoom][1];
            console.log("player2",player2);
            currentPlayer = currentPlayer == player1 ? player2 : player1;
            console.log("setTurn içinde currentPlayer",currentPlayer);
        }
            if(clientsInRoom){console.log("clientsInRoom",clientsInRoom)};
            console.log("currentPlayer",currentPlayer);
        io.to(data.room).emit("turn",{currentPlayer: currentPlayer});
    })
    socket.on("leaveRoom",(data)=>{
        socket.leave(data.room);
        console.log(`User leaved room ${data.room}`);
    });
    socket.on("send_message",(data)=>{
        socket.broadcast.emit("receive_message",data);
       //console.log(data); 
    })
    //io.to(socket.id).emit("initialImageLocations",shuffledArray);
    socket.emit("initialImageLocations",shuffledArray);
    
    // resimleri resetliyoruz.
    socket.on("resetImages",(data)=>{
        console.log("resetImages calisiyor data.room",data.room);
        
         shuffledArray =  shuffleArray(imgDirectories,data.imagetypes.type,data.neededImagesNumber);
         //socket.emit("getImages",shuffledArray);
         //socket.broadcast.emit("getImages",shuffledArray);
         io.to(data.room).emit("getImages",shuffledArray);
    })
    
    socket.on('sendIndex',(data)=>{
        //console.log("here is the data",data);
        //socket.broadcast.emit('getIndex',data)
        //socket.emit('getIndex',data)
        io.to(data.room).emit('getIndex',data);
    })
    socket.on('isMatched',(data)=>{
        //socket.broadcast.emit('setMatched',data);
        //socket.emit('setMatched',data);
        io.to(data.room).emit('setMatched',data);
    })
    socket.on("setScore",(data)=>{
        //data:{score,playerturn}
        //console.log("burası calisiyor",data);
        //socket.broadcast.emit('newScore',data);
        //socket.emit('newScore',data);
        io.to(data.room).emit('newScore',data);
    })
    socket.on("setplayerTurn",(data)=>{
        //data:{playerturn}
        //console.log("playerturn",data.playerturn);
       // socket.broadcast.emit("playerturn",data);
        //socket.emit("playerturn",data);
        io.to(data.room).emit("playerturn",data);
    })
    socket.on("setchoosentwo",(data)=>{
        //data:{choosentwo}
        //console.log("data of choosentwo:",data);
        //socket.broadcast.emit("choosen",data);
        //socket.emit("choosen",data);
        io.to(data.room).emit("choosen",data);
    })
    socket.on("choosesizes",(data)=>{
        //socket.broadcast.emit("sizes",data);
        //socket.emit("sizes",data);
        io.to(data.room).emit("sizes",data);
    })
    socket.on("setimagetypes",(data)=>{
        console.log("data",data);
        //socket.broadcast.emit("imagetypes",data);//islem yapilan haricindeki herkese gonderir.
        //socket.emit("imagetypes",data);// sadece islem yapılan yere gonderir.
        io.to(data.room).emit("imagetypes",data);// sadece islem yapılan yere gonderir.
    })
    socket.on("setdisabled",(data)=>{
        //console.log("setdisabled calisiyor")
        //socket.emit("disabled",data,()=>{console.log("disabledlength calisiyor")});//tum clientlara gonderir.
        //socket.broadcast.emit("disabled",data,()=>{console.log("disabledlength calisiyor")});//tum clientlara gonderir.
        io.to(data.room).emit("disabled",data,()=>{console.log("disabledlength calisiyor")});//tum clientlara gonderir.
    })
    
})
server.listen(3001,()=>{
    console.log("SERVER IS RUNNING");
})