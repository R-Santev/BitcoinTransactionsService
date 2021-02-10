import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import WebSocket = require('ws');
import handlebars from 'express-handlebars';
import {Block} from './models/Block';
const PORT = 8000;

const app = express();

app.engine('hbs', handlebars({
  extname: 'hbs',
  defaultLayout: 'main', 
  layoutsDir:'src/views/layouts',
  partialsDir:'src/views/partials'
}))
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname + '/views'));

app.use(express.urlencoded({extended: true}));


    
mongoose.connect('mongodb://localhost/cubicle', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.on('open', () => console.log('DB connected!'));


const ws = new WebSocket("wss://tbtc1.trezor.io/websocket");
ws.on('open', () => {
  console.log('yes');
  //ws.send(`{"id":"1", "method":"getInfo", "params":""}`)
  ws.send(`{"id":"1", "method":"subscribeNewBlock", "params":""}`);
});
ws.on('message', (message: WebSocket.Data ) => {  

  let obj = JSON.parse(message as string);
  if (!obj.data.hash) {
    console.log(message);
    return;
  }

  console.log(obj.data.hash);
  let newBlock = new Block(obj.data);
  newBlock.save()
    .then(() => console.log('succeed'))
    .catch((err) => console.log(err));
    
});

app.get('/', async (req,res) => {
  let blocks = await Block.find().lean();

  res.render('home', {title: 'Home', blocks});
});


app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});