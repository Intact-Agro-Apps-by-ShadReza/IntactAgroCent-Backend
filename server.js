
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter  = require('./routes/users.js');
const authRouter  = require('./routes/auth.js');

dotenv.config();

const app = express()

app.use(cors({
    origin: '*'
}));

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.get('/', (req, res) => {
    res.send("Assalamu Alaikum")
})

app.listen(process.env.PORT || 3000)