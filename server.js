const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require("path")
const fs = require('fs');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const http = require('http');
const app = express();
const socket = require('socket.io');
const server = http.createServer(app)
const io = socket(server);
const { getWords } = require('./middleware/helperFunctions')


//MODELS
const GamesModel = require('./models/Games')

if (process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
  }
// app.use(express.static(path.join(__dirname,"src")));
  
//connect to DB
mongoose.connect(process.env.dbConnectCloud, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(()=>console.log('Connected to DB'))
.catch(err=>console.log(err))


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/games', require('./routes/games'));
app.get('/', (req, res)=>{
  res.json({'status':true})
  // res.sendFile('/')
})

// ################## WEB SOCKET CONNECTION  #########################
//start socket connection 
io.on('connection',socket=>{
  console.log(`${socket.id} is connected`);

  //when a user is to create a new game
  socket.on('create-game', async ({gameCode, playerId})=>{
    console.log('creating game')
    //save new game
    try{
      console.log('here first')
      const newGame = new GamesModel({
        gameCode,
        players: [{
          playerId,
          socketid:socket.id,
          role:1,
          isReady:false,
        }]
      })
      await newGame.save();
    }catch(err){
      console.log(err)
    }
    console.log('got here')
    //join game
    socket.join(gameCode);
    console.log('got here 2')
    io.to(gameCode).emit('game-created',{gameCode})
    // io.to(gameCode).emit('start-game',{gameCode})
  })

  //when a user is to join an existing game
  socket.on('join-game',async ({gameCode, playerId})=>{
    try{
      //look for game with gamecode
      const game = await GamesModel.findOne({gameCode});
      if(!game){
        socket.emit("game-not-found"); return;
      }
      // update game with payer details and game words
      const words = getWords();
      const update = await GamesModel.updateOne({gameCode}, {
        words,
        players: [
          ...game.players,
          {
            playerId,
            socketid:socket.id,
            role:2,
            isReady:false,
          }
        ],
      })
      if(update.n > 0){
        //join room
        socket.join(gameCode);
        //emit game joined
        io.to(gameCode).emit('start-game',{gameCode})
      }

      }catch(err){
        console.log(err)
      }
  })

  //When a player is typing
  socket.on('is-typing', ({gameCode})=>{
    console.log('is typing', gameCode)
    socket.broadcast.to(gameCode).emit('is-typing')
  })

  socket.on('disconnect', ()=>{
    console.log(`${socket.id} is disconnected`);
  })
})

// ###########################################
//handle every other request
app.get('/*', (req, res)=> {
    // res.json([{"error":"invalid request"}])
    res.json({
      errors: [{ msg: "invalid token" }]
    });
  })

server.listen(process.env.PORT || 5000, ()=>{ console.log(`Server started on port ${process.env.PORT || 5000}`)})