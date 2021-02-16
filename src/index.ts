import express from 'express';
import mongoose from 'mongoose';

import * as wsService from './services/webSocketService';

const PORT = 8000;
const app = express();

app.use(express.urlencoded({ extended: true }));
    
mongoose.connect('mongodb://localhost/cubicle', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.on('open', () => {
  console.log('DB connected!');
});

wsService.connectWebSocket();

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
