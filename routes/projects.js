const { Router } = require('express')

const projectRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const filterTheProjects = async (startingProjectIndex, normalGivingCount, totalProjectsCount, projects) => {

    let filteredProjects = []
    let lastIndex = startingProjectIndex + normalGivingCount
    if (lastIndex > totalProjectsCount) {
        lastIndex = totalProjectsCount
    }
    for (let i = startingProjectIndex; i < lastIndex; i++) {
        if (projects[i]) {
            filteredProjects.push(projects[i])
        }
    }
    return filteredProjects
}

projectRouter.get('/', async (req, res) => {

    let startingProjectIndex = 0
    let normalGivingCount = 6
    
    try {

        let queryStartingPageNumber = req.query.startingPageNumber
        let queryPerPageCount = req.query.perPageCount

        let startingPageNumber = 1
        let perPageCount = 6

        if (queryStartingPageNumber && parseInt(queryStartingPageNumber.toString())) {
            startingPageNumber = parseInt(queryStartingPageNumber.toString())
        }

        if (queryPerPageCount && parseInt(queryPerPageCount.toString())) {
            perPageCount = parseInt(queryPerPageCount.toString())
        }

        
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
                    let notificationDescription = "Currently there are no project enlisted."
                return res.status(404).end(notificationDescription)
            } else {
                if (normalGivingCount >= projectsCount) {
                    normalGivingCount = projectsCount
                    startingProjectIndex = 0
                } else {

                    if (normalGivingCount < 1) {
                        normalGivingCount = 1
                    }
                    if ((startingProjectIndex >= projectsCount)) {
                        startingProjectIndex = projectsCount - 1
                    } else if (startingProjectIndex < 0) {
                        startingProjectIndex = 0
                    }
                }
                let projects = []
                try {
                    let filter = ''
                    const queryFilter = req.query.filter
                    if (queryFilter && queryFilter.toString()) {
                        filter = queryFilter.toString()
                    }
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
                    }  else if (filter === "sort-by-investment-per-unit-asc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                investingCapitalPerUnitinBDT: 'asc',
                            },
                        })
                    }  else if (filter === "sort-by-investment-per-unit-desc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                investingCapitalPerUnitinBDT: 'desc',
                            },
                        })
                    } else if (filter === "sort-by-roi-asc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                returnOnInterestRate: 'asc',
                            },
                        })
                    } else if (filter === "sort-by-roi-desc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                returnOnInterestRate: 'desc',
                            },
                        })
                    } else if (filter === "sort-by-roi-time-asc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                returnOnInterestReturnPeriodinMonths: 'asc',
                            },
                        })
                    } else if (filter === "sort-by-roi-time-desc") {
                        projects = await prisma.project.findMany({
                            orderBy: {
                                returnOnInterestReturnPeriodinMonths: 'desc',
                            },
                        })
                    } else if (filter === "sort-by-live") {
                        projects = await prisma.project.findMany({
                            where: {
                                projectStatus: 'live',
                            },
                        })
                    } else if (filter === "sort-by-at-halt") {
                        projects = await prisma.project.findMany({
                            where: {
                                projectStatus: 'at-halt',
                            },
                        })
                    } else if (filter === "sort-by-closed") {
                        projects = await prisma.project.findMany({
                            where: {
                                projectStatus: 'closed',
                            },
                        })
                    } else {
                        projects = await prisma.project.findMany()
                    }


                    await filterTheProjects(startingProjectIndex, normalGivingCount, projectsCount, projects)
                        .then(response => {
                            res.send({
                                totalProjectCount: projectsCount,
                                filteredProjects: response
                            })
                        })
                } catch(error) {
                    console.log(error.message)
                    let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
                    return res.status(500).end(notificationDescription)
                }
            }
        } catch {
            let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
            return res.status(500).end(notificationDescription)
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
        featuredPictureLink,
        pictureLinks,
        tagNames,
        projectStatus,
        location } = req.body    

    if (title && description && investingCapitalPerUnitinBDT && returnOnInterestRate && returnOnInterestReturnPeriodinMonths && featuredPictureLink && pictureLinks && pictureLinks.length && tagNames.length && tagNames && projectStatus && location) {
        try {
            const sameConfiguredProject = await prisma.project.findFirst({
                where: {
                    OR: [
                        { title: title },
                        { featuredPictureLink: featuredPictureLink },
                    ]
                }
            })

            if (sameConfiguredProject) {
                console.log('same configured project found')
                let notificationDescription = "Another project is having the same configuration."
                return res.status(406).end(notificationDescription)
            } else {
                const createdProject = await prisma.project.create({
                    data: {
                        title: title,
                        description: description,
                        investingCapitalPerUnitinBDT: investingCapitalPerUnitinBDT,
                        returnOnInterestRate: returnOnInterestRate,
                        returnOnInterestReturnPeriodinMonths: returnOnInterestReturnPeriodinMonths,
                        featuredPictureLink: featuredPictureLink,
                        pictureLinks: {set: pictureLinks},
                        tagNames: {set: tagNames},
                        projectStatus: projectStatus,
                        location: location,
                        creationTime: new Date()
                    }
                })
                if (createdProject) {
                    console.log('project created')
                    let notificationDescription = "Project was created successfully."
                    res.send(createdProject)
                } else {
                    console.log('project not created')
                    let notificationDescription = "Project could not be created."
                    return res.status(406).end(notificationDescription)
                }
            }

        } catch (error) {
            console.log("project" + error.message)
            let notificationDescription = "Project could not be created. Please try again after some times."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("project invalid params")
        let notificationDescription = "Please provide all the parameters correctly."
        return res.status(400).end(notificationDescription)
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
        newProject.featuredPictureLink &&
        newProject.pictureLinks &&
        newProject.tagNames &&
        newProject.projectStatus &&
        newProject.location
    ) {
        try {
            const conflictingProject = await prisma.project.findFirst({
                where: {
                    OR: [
                        { title: newProject.title },
                        { featuredPictureLink: newProject.featuredPictureLink },
                    ]
                }
            })
            if (conflictingProject) {
                console.log("same project found with the updated title and application")
                let notificationDescription = "Same project exists where the title, feature image, status nad lovation are as the updated project"
                return res.status(403).end(notificationDescription)
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
                            featuredPictureLink: newProject.featuredPictureLink,
                            pictureLinks: {set: newProject.pictureLinks},
                            tagNames: {set: newProject.tagNames},
                            projectStatus: newProject.projectStatus,
                            location: newProject.location,
                            creationTime: new Date()
                        }
                    })
                    if (updatedProject) {
                        console.log('project updated')
                        res.send(updatedProject)
                    } else {
                        console.log("project could not be updated")
                        let notificationDescription = "Please try again after sometimes. Project was not updated."
                        return res.status(500).end(notificationDescription)
                    }
                } catch (error) {
                    console.log("project not found")
                    let notificationDescription = "Please check if this project is there or not."
                    return res.status(403).end(notificationDescription)
                }
            }
        } catch (error) {
            console.log("project remains the same")
            let notificationDescription = "Please try again after sometimes. There seems to be some issue with the network connection."
            return res.status(400).end(notificationDescription)
        }
        
    } else {
        console.log("project invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }

})

module.exports = projectRouter