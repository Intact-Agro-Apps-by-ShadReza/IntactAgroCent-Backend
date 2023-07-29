const { Router } = require('express')

const authRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

authRouter.get('/', (req, res) => {
    res.send({name: "Assalamu Alaikum from Auth Router"})
})

// authRouter.get('/', async (req, res) => {
//     const users = await prisma.user.findMany()
//     res.json(users)
// })


module.exports = authRouter