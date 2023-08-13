const { Router } = require('express')

const projectRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const filterTheProjects = async (/** @type {number} */ startingProjectIndex, /** @type {number} */ normalGivingCount, /** @type {any[]} */ projects) => {
    let filteredProjects = []
    for (let i = startingProjectIndex; i < startingProjectIndex+normalGivingCount; i++) {
        filteredProjects.push(projects[i])
    }
    return filteredProjects
}

projectRouter.get('/', async (req, res) => {

    let startingProjectIndex = 0
    let normalGivingCount = 6
    
    try {
        let { startingPageNumber, perPageCount } = req.body
        if (startingPageNumber && perPageCount) {
            if (perPageCount < 1) {
                perPageCount = normalGivingCount
            }
            if (startingPageNumber < 1) {
                startingPageNumber = 1
            }
            startingProjectIndex = (startingPageNumber - 1) * perPageCount
            normalGivingCount = perPageCount
        } else {
            startingProjectIndex = 0
            normalGivingCount = 6
        }
    } catch {
        startingProjectIndex = 0
        normalGivingCount = 6
    } finally {
        try {
            const projectsCount = await prisma.project.count()
            if (projectsCount < 1) {
                res.set({
                    notificationTitle: "No Projects Found",
                    notificationDescription: "Currently there are no project enlisted."
                })
                return res.status(404).end()
            } else {
                if (normalGivingCount >= projectsCount) {
                    normalGivingCount = projectsCount
                    startingProjectIndex = 0
                } else {
                    if (normalGivingCount < 1) {
                        normalGivingCount = 1
                    }
                    const maxPageNumberCount = Math.ceil(projectsCount / normalGivingCount)
                    if (startingProjectIndex >= maxPageNumberCount) {
                        startingProjectIndex = maxPageNumberCount - 1
                    } else if (startingProjectIndex < 0) {
                        startingProjectIndex = 0
                    }
                }
                let projects = []
                try {
                    const { filter } = req.body
                    if (filter === "sort-by-name-asc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                title: 'asc',
                            },
                        })
                    } else if (filter === "sort-by-name-desc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                title: 'desc',
                            },
                        })
                    } else if (filter === "sort-by-created-asc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                creationTime: 'asc',
                            },
                        })
                    } else if (filter === "sort-by-created-desc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                creationTime: 'desc',
                            },
                        })
                    } else {
                        projects = await prisma.project.findMany()
                    }
                    await filterTheProjects(startingProjectIndex, normalGivingCount, projects)
                        .then(response => {
                            res.send({
                                totalProjectCount: projectsCount,
                                filteredProjects: response
                            })
                        })
                } catch(error) {
                    console.log(error.message)
                    res.set({
                        notificationTitle: "Network Error",
                        notificationDescription: "There were some issues connecting with the server. Please try again after sometimes."
                    })
                    return res.status(500).end()
                }
            }
        } catch {
            res.set({
                notificationTitle: "Network Error",
                notificationDescription: "There were some issues connecting with the server. Please try again after sometimes."
            })
            return res.status(500).end()
        }
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

            const sameConfiguredProject = await prisma.project.findFirst({
                where: {
                    OR: [
                        { title: title },
                        { featuredPictureId: featuredPictureId },
                    ]
                }
            })

            if (sameConfiguredProject) {
                console.log('same configured project found')
                res.set({
                    notificationTitle: "Project Creation Unsuccessful",
                    notificationDescription: "Another project is having the same configuration."
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

projectRouter.put('/update', async (req, res) => {
    const { projectId, newProject } = req.body 

    if (projectId &&
        newProject.title &&
        newProject.description &&
        newProject.investingCapitalPerUnitinBDT &&
        newProject.returnOnInterestRate &&
        newProject.returnOnInterestReturnPeriodinMonths &&
        newProject.featuredPictureId &&
        newProject.pictureIds &&
        newProject.tagIds &&
        newProject.projectStatus &&
        newProject.location
    ) {
        try {
            const conflictingProject = await prisma.project.findFirst({
                where: {
                    OR: [
                        { title: newProject.title },
                        { featuredPictureId: newProject.featuredPictureId },
                    ]
                }
            })
            if (conflictingProject) {
                console.log("same project found with the updated title and application")
                res.set({
                    notificationTitle: "Conflicting Project Found",
                    notificationDescription: "Same project exists where the title, feature image, status nad lovation are as the updated project"
                })
                return res.status(403).end()
            } else {
                try {
                    const updatedProject = await prisma.project.update({
                        where: {
                            id: projectId
                        },
                        data: {
                            title: newProject.title,
                            description: newProject.description,
                            investingCapitalPerUnitinBDT: newProject.investingCapitalPerUnitinBDT,
                            returnOnInterestRate: newProject.returnOnInterestRate,
                            returnOnInterestReturnPeriodinMonths: newProject.returnOnInterestReturnPeriodinMonths,
                            featuredPictureId: newProject.featuredPictureId,
                            pictureIds: {set: newProject.pictureIds},
                            tagIds: {set: newProject.tagIds},
                            projectStatus: newProject.projectStatus,
                            location: newProject.location
                        }
                    })
                    if (updatedProject) {
                        console.log('project updated')
                        res.send(updatedProject)
                    } else {
                        console.log("project could not be updated")
                        res.set({
                            notificationTitle: "Project Not Updated",
                            notificationDescription: "Please try again after sometimes. Project was not updated."
                        })
                        return res.status(500).end()
                    }
                } catch (error) {
                    console.log("project not found")
                    res.set({
                        notificationTitle: "Project not found",
                        notificationDescription: "Please check if this project is there or not."
                    })
                    return res.status(403).end()
                }
            }
        } catch (error) {
            console.log("project remains the same")
            res.set({
                notificationTitle: "Network Issue",
                notificationDescription: "Please try again after sometimes. There seems to be some issue with the network connection."
            })
        }
        
    } else {
        console.log("project invalid params")
        res.set({
            notificationTitle: "Invalid Parameters for Updating",
            notificationDescription: "Please provide correct id for the request."
        })
        return res.status(400).end()
    }

})

module.exports = projectRouter