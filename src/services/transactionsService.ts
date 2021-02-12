//import { CronJob } from 'cron';
import { Transaction, ITransaction } from '../models/Transaction';
import ws from './webSocketService';

export const transactionService = {
    updateConfirmations(){
        Transaction.find({ confirmations: { $lte: 6}})
            .then((data: ITransaction[]) => {
                data.forEach(transaction => {
                ws.send(`{"id":"3","method":"getTransaction","params":{"txid":"${transaction.txid}"}}`);
                console.log("request getTransaction() is send");
            });
        });
    }
}
