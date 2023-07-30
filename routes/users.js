const { Router } = require('express')

const userRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getUsersData = async () => {
    const users = await prisma.user.findMany()
    return users
}

userRouter.get('/', async (req, res) => {
    await getUsersData()
        .then(async (data) => {
            res.send(data)
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            res.sendStatus(500)
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
})


module.exports = userRouter