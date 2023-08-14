
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter  = require('./routes/users.js');
const authRouter = require('./routes/auth.js');
const bodyParser = require('body-parser');
const projectRouter = require('./routes/projects.js');
const imageRouter = require('./routes/images.js');
const tagRouter = require('./routes/tags.js');
const currencyRouter = require('./routes/currency.js');

dotenv.config();

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.use(cors({
    origin: '*'
}));

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/projects', projectRouter)
app.use('/images', imageRouter)
app.use('/currencies', currencyRouter)
app.use('/tags', tagRouter)
app.get('/', (req, res) => {
    res.send("Assalamu Alaikum from dev .Shad Reza.")
})

app.listen(process.env.PORT || 3000)