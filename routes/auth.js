const { Router } = require('express')

const authRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

authRouter.get('/', (req, res) => {
    res.send({name: "Assalamu Alaikum from Auth Router"})
})

authRouter.post('/login', (req, res) => {
    console.log(req.body)
    res.send({"code": 1000})
})

// authRouter.get('/', async (req, res) => {
//     const users = await prisma.user.findMany()
//     res.json(users)
// })


module.exports = authRouter