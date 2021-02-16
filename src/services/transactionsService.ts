//import { CronJob } from 'cron';
import { Transaction, ITransaction } from '../models/Transaction';

import * as ws from './webSocketService';

export function updateConfirmations(): void{
        Transaction.find({ confirmations: { $lte: 6}})
            .then((data: ITransaction[]) => {
                data.forEach(transaction => {
                    ws.getTransaction(transaction.txid); 
                    console.log("request getTransaction() is send");
                });
            })
            .catch((err) => console.log(err));
    }
