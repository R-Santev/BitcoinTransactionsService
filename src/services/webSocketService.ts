import WebSocket = require('ws');
import mongoose from 'mongoose';

import * as transactionService from './transactionsService';

import { Block } from '../models/Block';
import { ITransaction, Transaction } from '../models/Transaction';

let ws: WebSocket = new WebSocket("wss://tbtc1.trezor.io/websocket");

export function getTransaction(txid: string): void {
    ws.send(`{"id":"3","method":"getTransaction","params":{"txid":"${txid}"}}`);
}

export function connectWebSocket(): void {
    ws.on('open', () => {
        console.log('WebSocket is open...');
        ws.send(`{"id":"1", "method":"subscribeNewBlock", "params":""}`);
        ws.send(`{"id":"2","method":"subscribeAddresses","params":{"addresses":["tb1qcyy0nrtcx7luzuz2qxza88kmt4vczmx9t4m57d"]}}`);
    });

    ws.on('message', (message: string) => {
        //How to make the obj strict
        const obj = JSON.parse(message);

        if (obj.data.subscribed) {
            console.log(message);

            return;
        }

        switch (obj.id) {
            case '1':
                const newBlock: mongoose.Document = new Block(obj.data);

                newBlock.save()
                    .then(() => {
                        console.log(`New block was saved: ${obj.data.hash}`);
                        transactionService.updateConfirmations();
                    })
                    .catch((err) => console.log(err));
                break;

            case '2':
                const newTransaction: ITransaction = new Transaction(obj.data.tx);

                newTransaction.save()
                    .then(() => {
                        console.log('New transaction was created!');
                    })
                    .catch((err) => console.log(err));
                break;

            case '3':
                let txid: string = obj.data.txid;
                let confirmations = obj.data.confirmations;

                Transaction.findOneAndUpdate({ txid }, { confirmations }, { useFindAndModify: false }, (err, doc) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(`Transaction ${txid} was successfully updated!`);
                });
                break;

            default:
                console.log(message);
                break;
        }
    });

    ws.on('close', function (code, reason) {
        console.log(code);
        ws = new WebSocket("wss://tbtc1.trezor.io/websocket");
        connectWebSocket();
    });
}
