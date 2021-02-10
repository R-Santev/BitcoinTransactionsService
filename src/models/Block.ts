import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
    height: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
})


export const Block =  mongoose.model('Block' ,schema);