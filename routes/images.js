const { Router } = require('express')

const imageRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

imageRouter.get('/', async (req, res) => {
    try {
        const images = await prisma.image.findMany()
        res.send(images)
    } catch (error) {
        console.log(error.message)
        let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
        res.status(500).end(notificationDescription)
    }
})

imageRouter.post('/create', async (req, res) => {
    const { liveLink, applicableFor } = req.body    

    if (liveLink && applicableFor) {
        try {
            const samelinkedimage = await prisma.image.findFirst({
                where: {
                    liveLink: liveLink
                }
            })
            if (samelinkedimage) {
                console.log('same linked image found')
                let notificationDescription = "Another image is having the same link in the database."
                res.status(406).end(notificationDescription)
            } else {
                const createdimage = await prisma.image.create({
                    data: {
                        liveLink: liveLink,
                        applicableFor: applicableFor,
                        creationTime: new Date()
                    }
                })
                if (createdimage) {
                    console.log('image created')
                    res.send(createdimage)
                } else {
                    console.log('Image not created')
                    let notificationDescription = "Image could not be created."
                    res.status(406).end(notificationDescription)
                }
            }

        } catch (error) {
            console.log("Image" + error.message)
            let notificationDescription = "Image could not be created. Please try again after some times."
            res.status(500).end(notificationDescription)
        }
    } else {
        console.log("Image invalid params")
        let notificationDescription = "Please provide all the parameters correctly."
        res.status(400).end(notificationDescription)
    }
})

imageRouter.delete('/delete', async (req, res) => {
    const {imageId} = req.body

    if(imageId) {
        try {
            const deletedImage = await prisma.image.delete({
                where: {
                    id: imageId
                }
            })
            console.log(deletedImage)
            res.send(deletedImage)
        } catch (error) {
            console.log("Image could not delete")
            let notificationDescription = "Please check the credentials passed for the deletion."
            res.status(500).end(notificationDescription)
        }
    } else {
        console.log("Image invalid params")
        let notificationDescription = "Please provide correct id for the request."
        res.status(400).end(notificationDescription)
    }
})

module.exports = imageRouter