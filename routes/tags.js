const { Router } = require('express')

const tagRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

tagRouter.get('/', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany()
        res.send(tags)
    } catch (error) {
        console.log(error.message)
        res.set({
            notificationTitle: "Network Error",
            notificationDescription: "There were some issues connecting with the server. Please try again after sometimes."
        })
        return res.status(500).end()
    }
})

tagRouter.post('/create', async (req, res) => {
    const { title, description, applicableFor } = req.body    

    if (title && description && applicableFor) {
        try {
            const sameTag = await prisma.tag.findFirst({
                where: {
                    title: title,
                    applicableFor: applicableFor
                }
            })

            if (sameTag) {
                console.log('same tag found')
                res.set({
                    notificationTitle: "Tag Creation Unsuccessful",
                    notificationDescription: "Another tag is having the same title and application."
                })
                return res.status(406).end()
            } else {
                const createdtag = await prisma.tag.create({
                    data: {
                        title: title,
                        description: description,
                        applicableFor: applicableFor
                    }
                })
                if (createdtag) {
                    console.log('tag created')
                    res.set({
                        notificationTitle: "Tag Creation Successful",
                        notificationDescription: "Tag was created successfully."
                    })
                    res.send(createdtag)
                } else {
                    console.log('tag not created')
                    res.set({
                        notificationTitle: "Tag Creation Unsuccessful",
                        notificationDescription: "Tag could not be created."
                    })
                    return res.status(406).end()
                }
            }

        } catch (error) {
            console.log("tag" + error.message)
            res.set({
                notificationTitle: "Tag Creation Eror",
                notificationDescription: "Tag could not be created. Please try again after some times."
            })
            return res.status(500).end()
        }
    } else {
        console.log("tag invalid params")
        res.set({
            notificationTitle: "Invalid Parameters",
            notificationDescription: "Please provide all the parameters correctly."
        })
        return res.status(400).end()
    }
})

tagRouter.delete('/delete', async (req, res) => {
    const {tagId} = req.body

    if(tagId) {
        try {
            const deletedtag = await prisma.tag.delete({
                where: {
                    id: tagId
                }
            })
            console.log(deletedtag)
            res.send(deletedtag)
        } catch (error) {
            console.log("tag could not delete")
            res.set({
                notificationTitle: "Delete Unsuccessful",
                notificationDescription: "Please check the credentials passed for the deletion."
            })
            return res.status(500).end()
        }
    } else {
        console.log("tag invalid params")
        res.set({
            notificationTitle: "Invalid Parameters",
            notificationDescription: "Please provide correct id for the request."
        })
        return res.status(400).end()
    }
})

module.exports = tagRouter