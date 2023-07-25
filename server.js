const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const router  = require('./routes/index.js');

dotenv.config();


const app = express()

app.use(cors({
    origin: '*'
}));


app.use('/', router)

app.listen(process.env.PORT || 3000)

