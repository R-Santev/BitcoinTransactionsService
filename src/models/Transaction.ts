import { model, Schema, Model, Document } from 'mongoose';

export interface ITransaction extends Document {
    txid: string,
    value: number,
    confirmation: number
}
const schema: Schema = new Schema({
    
    txid: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    confirmations: {
        type: Number,
        required: true,
    }
})

export const Transaction: Model<ITransaction> =  model('Transaction', schema);