const { Router } = require('express')

const adminPanelRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

adminPanelRouter.get('/', async (req, res) => {
    try {
        const adminPanel = await prisma.adminPanel.findMany()
        res.send(adminPanel)
    } catch (error) {
        console.log(error.message)
        let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
        return res.status(500).end(notificationDescription)
    }
})

adminPanelRouter.post('/create', async (req, res) => {
    const { userId, roleId } = req.body    

    if (userId && roleId) {
        try {
            const sameAdminPanelMember = await prisma.adminPanel.findFirst({
                where: {
                    userId: userId
                }
            })

            if (sameAdminPanelMember) {
                console.log('same admin panel member found')
                let notificationDescription = "Another admin panel member is already with another duty."
                return res.status(406).end(notificationDescription)
            } else {
                const createdAdminPanelMember = await prisma.adminPanel.create({
                    data: {
                        userId: userId,
                        roleId: roleId,
                        creationTime: new Date(),
                        updationTime: new Date(),
                    }
                })
                if (createdAdminPanelMember) {
                    console.log('admin panel member created')
                    let notificationDescription = "Admin panel member was created successfully."
                    res.send(createdAdminPanelMember)
                } else {
                    console.log('admin panel member not created')
                    let notificationDescription = "Admin panel member could not be created."
                    return res.status(406).end(notificationDescription)
                }
            }

        } catch (error) {
            console.log("admin panel member" + error.message)
            let notificationDescription = "admin panel member could not be created. Please try again after some times."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("admin panel member invalid params")
        let notificationDescription = "Please provide all the parameters correctly."
        return res.status(400).end(notificationDescription)
    }
})

adminPanelRouter.put('/update', async (req, res) => {
    const { adminPanelId, newAdminPanel } = req.body 

    if (adminPanelId && newAdminPanel && newAdminPanel.userId && newAdminPanel.roleId) {
        try {
            const conflictingAdminPanel = await prisma.adminPanel.findFirst({
                where: {
                    userId: newAdminPanel.userId,
                    roleId: newAdminPanel.roleId
                }
            })
            if (conflictingAdminPanel) {
                console.log("same admin panel member found with the updated role")
                let notificationDescription = "Same admin panel member exists where the roles is as the updated admin panel member"
                return res.status(403).end(notificationDescription)
            } else {
                try {
                    const updatedAdminPanel = await prisma.adminPanel.update({
                        where: {
                            id: adminPanelId
                        },
                        data: {
                            roleId: newAdminPanel.roleId,
                            updationTime: new Date()
                        }
                    })
                    if (updatedAdminPanel) {
                        console.log('admin panel updated')
                        res.send(updatedAdminPanel)
                    } else {
                        console.log("admin panel member could not be updated")
                        let notificationDescription = "Please try again after sometimes. Admin Panel was not updated."
                        return res.status(500).end(notificationDescription)
                    }
                } catch (error) {
                    console.log("admin panel member not found")
                    let notificationDescription = "Please check if this admin panel is there or not."
                    return res.status(403).end(notificationDescription)
                }
            }
        } catch (error) {
            console.log("admin panel member remains the same")
            let notificationDescription = "Please try again after sometimes. There seems to be some issue with the network connection."
            return res.status(500).end(notificationDescription)

        }
        
    } else {
        console.log("admin panel member invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }

})

adminPanelRouter.delete('/delete', async (req, res) => {
    const {adminPanelId} = req.body

    if(adminPanelId) {
        try {
            const deletedtag = await prisma.adminPanel.delete({
                where: {
                    id: adminPanelId
                }
            })
            console.log(deletedtag)
            res.send(deletedtag)
        } catch (error) {
            console.log("admin panel member could not delete")
            let notificationDescription = "Please check the credentials passed for the deletion."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("admin panel member invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }
})

module.exports = adminPanelRouter