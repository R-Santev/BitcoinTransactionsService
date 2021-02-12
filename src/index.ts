import express from 'express';
import mongoose from 'mongoose';

import ws from './services/webSocketService'
import { transactionService } from './services/transactionsService';

import { Block } from './models/Block';
import {Transaction} from './models/Transaction';

const PORT = 8000;
const app = express();

app.use(express.urlencoded({ extended: true }));
    
mongoose.connect('mongodb://localhost/cubicle', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.on('open', () => {
  console.log('DB connected!');
});

ws.on('open', () => {
  console.log('WebSocket is open...');
  ws.send(`{"id":"1", "method":"subscribeNewBlock", "params":""}`);
  ws.send(`{"id":"2","method":"subscribeAddresses","params":{"addresses":["tb1qcyy0nrtcx7luzuz2qxza88kmt4vczmx9t4m57d"]}}`);
});

ws.on('message', (message) => {
  const obj = JSON.parse(message as string);

  if (obj.data.subscribed) {
    console.log(message);
  
    return;
  }
  
  if (obj.id == '1') {
    const newBlock = new Block(obj.data);
  
    newBlock.save()
      .then(() => {
        console.log(`New block was saved: ${obj.data.hash}`);
        transactionService.updateConfirmations();
      })
      .catch((err) => console.log(err));
  } else if(obj.id == '2') {
    const newTransaction = new Transaction(obj.data.tx);

    newTransaction.save()
      .then(() => {
        console.log('New transaction was created!');
      })
      .catch((err) => console.log(err));
  } else if(obj.id == '3'){
    let txid = obj.data.txid;
    let confirmations = obj.data.confirmations;

    Transaction.findOneAndUpdate({ txid }, { confirmations }, { useFindAndModify: false}, (err, doc) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Transaction ${txid} was successfully updated!`);
    });
  } else {
    console.log(message);
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
