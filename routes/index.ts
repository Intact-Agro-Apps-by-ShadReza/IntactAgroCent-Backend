import { PrismaClient } from '@prisma/client'
import { Router } from 'express'

const router = Router()
const prisma = new PrismaClient()

const getUsersData = async () => {
    const users = await prisma.user.findMany()
    return users
}

router.get('/users', async (req, res) => {
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

router.get('/', (req, res) => {
    res.send("Assalamu Alaikum")
})

// router.get('/', async (req, res) => {
//     const users = await prisma.user.findMany()
//     res.json(users)
// })


export default router