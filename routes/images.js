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
        res.set({
            notificationTitle: "Network Error",
            notificationDescription: "There were some issues connecting with the server. Please try again after sometimes."
        })
        return res.status(500).end()
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
                res.set({
                    notificationTitle: "Image Creation Unsuccessful",
                    notificationDescription: "Another image is having the same link."
                })
                return res.status(406).end()
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
                    res.set({
                        notificationTitle: "Image Creation Successful",
                        notificationDescription: "Image was created successfully."
                    })
                    res.send(createdimage)
                } else {
                    console.log('Image not created')
                    res.set({
                        notificationTitle: "Image Creation Unsuccessful",
                        notificationDescription: "Image could not be created."
                    })
                    return res.status(406).end()
                }
            }

        } catch (error) {
            console.log("Image" + error.message)
            res.set({
                notificationTitle: "Image Creation Eror",
                notificationDescription: "Image could not be created. Please try again after some times."
            })
            return res.status(500).end()
        }
    } else {
        console.log("Image invalid params")
        res.set({
            notificationTitle: "Invalid Parameters",
            notificationDescription: "Please provide all the parameters correctly."
        })
        return res.status(400).end()
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
            res.set({
                notificationTitle: "Delete Unsuccessful",
                notificationDescription: "Please check the credentials passed for the deletion."
            })
            return res.status(500).end()
        }
    } else {
        console.log("Image invalid params")
        res.set({
            notificationTitle: "Invalid Parameters",
            notificationDescription: "Please provide correct id for the request."
        })
        return res.status(400).end()
    }
})

module.exports = imageRouter