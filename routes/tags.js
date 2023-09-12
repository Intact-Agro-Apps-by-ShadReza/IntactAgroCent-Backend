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
        let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
        return res.status(500).end(notificationDescription)
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
                let notificationDescription = "Another tag is having the same title and application."
                return res.status(406).end(notificationDescription)
            } else {
                const createdtag = await prisma.tag.create({
                    data: {
                        title: title,
                        description: description,
                        applicableFor: applicableFor,
                        creationTime: new Date(),
                        updationTime: new Date(),
                    }
                })
                if (createdtag) {
                    console.log('tag created')
                    let notificationDescription = "Tag was created successfully."
                    res.send(createdtag)
                } else {
                    console.log('tag not created')
                    let notificationDescription = "Tag could not be created."
                    return res.status(406).end(notificationDescription)
                }
            }

        } catch (error) {
            console.log("tag" + error.message)
            let notificationDescription = "Tag could not be created. Please try again after some times."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("tag invalid params")
        let notificationDescription = "Please provide all the parameters correctly."
        return res.status(400).end(notificationDescription)
    }
})

tagRouter.put('/update', async (req, res) => {
    const { tagId, newTag } = req.body 

    if (tagId && newTag.title && newTag.description && newTag.applicableFor) {
        try {
            const conflictingTag = await prisma.tag.findFirst({
                where: {
                    title: newTag.title,
                    applicableFor: newTag.applicableFor
                }
            })
            if (conflictingTag) {
                console.log("same tag found with the updated title and application")
                let notificationDescription = "Same tag exists where the title and application is as the updated tag"
                return res.status(403).end(notificationDescription)
            } else {
                try {
                    const updatedTag = await prisma.tag.update({
                        where: {
                            id: tagId
                        },
                        data: {
                            title: newTag.title,
                            description: newTag.description,
                            applicableFor: newTag.applicableFor,
                            updationTime: new Date()
                        }
                    })
                    if (updatedTag) {
                        console.log('tag updated')
                        res.send(updatedTag)
                    } else {
                        console.log("tag could not be updated")
                        let notificationDescription = "Please try again after sometimes. Tag was not updated."
                        return res.status(500).end(notificationDescription)
                    }
                } catch (error) {
                    console.log("tag not found")
                    let notificationDescription = "Please check if this tag is there or not."
                    return res.status(403).end(notificationDescription)
                }
            }
        } catch (error) {
            console.log("tag remains the same")
            let notificationDescription = "Please try again after sometimes. There seems to be some issue with the network connection."
            return res.status(500).end(notificationDescription)

        }
        
    } else {
        console.log("tag invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
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
            let notificationDescription = "Please check the credentials passed for the deletion."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("tag invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }
})

module.exports = tagRouter