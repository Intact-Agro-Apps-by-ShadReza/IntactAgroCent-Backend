const { Router } = require('express')

const projectRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

projectRouter.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany()
        res.send(projects)
    } catch (error) {
        console.log(error.message)
        res.set({
            notificationTitle: "Network Error",
            notificationDescription: "There were some issues connecting with the server. Please try again after sometimes."
        })
        return res.status(500).end()
    }
})

projectRouter.post('/create', async (req, res) => {
    const {
        title,
        description,
        investingCapitalPerUnitinBDT,
        returnOnInterestRate,
        returnOnInterestReturnPeriodinMonths,
        featuredPictureId,
        pictureIds,
        tagIds,
        projectStatus,
        location } = req.body    

    if (title && description && investingCapitalPerUnitinBDT && returnOnInterestRate && returnOnInterestReturnPeriodinMonths && featuredPictureId && pictureIds && pictureIds.length && tagIds.length && tagIds && projectStatus && location) {
        try {

            const sameTitledProject = await prisma.project.findFirst({
                where: {
                    title: title
                }
            })

            if (sameTitledProject) {
                console.log('same titled project found')
                res.set({
                    notificationTitle: "Project Creation Unsuccessful",
                    notificationDescription: "Another project is having the same title."
                })
                return res.status(406).end()
            } else {
                const createdProject = await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        investingCapitalPerUnitinBDT: investingCapitalPerUnitinBDT,
                        returnOnInterestRate: returnOnInterestRate,
                        returnOnInterestReturnPeriodinMonths: returnOnInterestReturnPeriodinMonths,
                        featuredPictureId: featuredPictureId,
                        pictureIds: {set: pictureIds},
                        tagIds: {set: tagIds},
                        projectStatus: projectStatus,
                        location: location
                    }
                })
                if (createdProject) {
                    console.log('project created')
                    res.set({
                        notificationTitle: "Project Creation Successful",
                        notificationDescription: "Project was created successfully."
                    })
                    res.send(createdProject)
                } else {
                    console.log('project not created')
                    res.set({
                        notificationTitle: "Project Creation Unsuccessful",
                        notificationDescription: "Project could not be created."
                    })
                    return res.status(406).end()
                }
            }

        } catch (error) {
            console.log("project" + error.message)
            res.set({
                notificationTitle: "Project Creation Eror",
                notificationDescription: "Project could not be created. Please try again after some times."
            })
            return res.status(500).end()
        }
    } else {
        console.log("project invalid params")
        res.set({
            notificationTitle: "Invalid Parameters",
            notificationDescription: "Please provide all the parameters correctly."
        })
        return res.status(400).end()
    }
})

module.exports = projectRouter