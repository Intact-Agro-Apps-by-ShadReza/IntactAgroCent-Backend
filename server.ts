import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import router from './routes/index';

dotenv.config();


const app: Express = express()

app.use(cors({
    origin: '*'
}));

app.use('/', router)

app.listen(process.env.PORT || 3000)

