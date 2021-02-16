import mongoose from 'mongoose';
import WebSocket = require('ws');

import { ITransaction, Transaction } from '../models/Transaction';
import { Block } from '../models/Block';

console.log('OP');

export class WebSocketService {
    
    private static instance: WebSocketService;

    private ws: WebSocket;

    private constructor() {
        this.init();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }

        return WebSocketService.instance;
    }

    public connectWebSocket(): void {
        this.ws.on('open', () => {
            console.log('WebSocket is open...');
            this.ws.send(`{"id":"1", "method":"subscribeNewBlock", "params":""}`);
            this.ws.send(`{"id":"2","method":"subscribeAddresses","params":{"addresses":["tb1qcyy0nrtcx7luzuz2qxza88kmt4vczmx9t4m57d"]}}`);
        });
    
        this.ws.on('message', (message: string) => {
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
                            this.updateConfirmations();
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
    
        this.ws.on('close', (code, reason) => {
            console.log(code);
            this.init()
            this.connectWebSocket();
        });
    }

    private init(): void {
        this.ws = new WebSocket("wss://tbtc1.trezor.io/websocket");
    }

    private updateConfirmations(): void{
        Transaction.find({ confirmations: { $lte: 6}})
            .then((data: ITransaction[]) => {
                data.forEach(transaction => {
                    this.getTransaction(transaction.txid); 
                    console.log("request getTransaction() is send");
                });
            })
            .catch((err) => console.log(err));
    }

    private getTransaction(txid: string): void {
        this.ws.send(`{"id":"3","method":"getTransaction","params":{"txid":"${txid}"}}`);
    }

}