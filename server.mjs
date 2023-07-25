import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './routes/index.mjs';

dotenv.config();


const app = express()

app.use(cors({
    origin: '*'
}));


app.use('/', router)

app.listen(process.env.PORT || 3000)

