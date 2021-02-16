/*//import { CronJob } from 'cron';
import { Transaction, ITransaction } from '../models/Transaction';

import {WebSocketService} from './webSocketService';
console.log('data');

console.log(WebSocketService);

const webSocketService = WebSocketService.getInstance();

export function updateConfirmations(): void{
        Transaction.find({ confirmations: { $lte: 6}})
            .then((data: ITransaction[]) => {
                data.forEach(transaction => {
                    webSocketService.getTransaction(transaction.txid); 
                    console.log("request getTransaction() is send");
                });
            })
            .catch((err) => console.log(err));
    }

    WebSocketService.customFunc(updateConfirmations)

    customFunc(callback: any) {
        callback()
    }
*/