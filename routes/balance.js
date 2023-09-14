const { Router } = require('express')

const balanceRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

balanceRouter.get('/', async (req, res) => {
    try {
        const balances = await prisma.balance.findMany()
        res.send(balances)
    } catch (error) {
        console.log(error.message)
        let notificationDescription = "There were some issues connecting with the server. Please try again after sometimes."
        return res.status(500).end(notificationDescription)
    }
})

balanceRouter.post('/create', async (req, res) => {
    const { userId, investedMoneyInBDT, withdrawedMoneyInBDT, returnOnInvestmentMoneyInBDT, referredMoneyInBDT, extraMoneyInBDT, balanceInBDT } = req.body    

    if ( userId && investedMoneyInBDT && withdrawedMoneyInBDT && returnOnInvestmentMoneyInBDT && referredMoneyInBDT && extraMoneyInBDT && balanceInBDT ) {
        try {
            const sameBalanceOfAnUser = await prisma.balance.findFirst({
                where: {
                    userId: userId,
                }
            })

            if (sameBalanceOfAnUser) {
                console.log('same balance found')
                let notificationDescription = "Another balance is having the same user id."
                return res.status(406).end(notificationDescription)
            } else {

                const createdBalance = await prisma.balance.create({
                    data: {
                        userId: userId,
                        investedMoneyInBDT: investedMoneyInBDT,
                        withdrawedMoneyInBDT: withdrawedMoneyInBDT,
                        returnOnInvestmentMoneyInBDT: returnOnInvestmentMoneyInBDT,
                        referredMoneyInBDT: referredMoneyInBDT,
                        extraMoneyInBDT: extraMoneyInBDT,
                        balanceInBDT: balanceInBDT,
                        creationTime: new Date(),
                        updationTime: new Date(),
                    }
                })

                if (createdBalance) {
                    console.log('balance created')
                    let notificationDescription = "balance was created successfully."
                    res.send(createdBalance)
                } else {
                    console.log('balance not created')
                    let notificationDescription = "balance could not be created."
                    return res.status(406).end(notificationDescription)
                }
            }

        } catch (error) {
            console.log("balance " + error.message)
            let notificationDescription = "balance could not be created. Please try again after some times."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("balance invalid params")
        let notificationDescription = "Please provide all the parameters correctly."
        return res.status(400).end(notificationDescription)
    }
})

balanceRouter.put('/update', async (req, res) => {
    const { balanceUserId, newBalance } = req.body 

    if (balanceUserId && newBalance.userId && newBalance.investedMoneyInBDT && newBalance.withdrawedMoneyInBDT && newBalance.returnOnInvestmentMoneyInBDT && newBalance.referredMoneyInBDT && newBalance.extraMoneyInBDT && newBalance.balanceInBDT ) {
        try {
            const conflictingBalance = await prisma.balance.findFirst({
                where: {
                    userId: newBalance.userId,
                }
            })
            if (conflictingBalance) {
                console.log("same balance found with the updated title and application")
                let notificationDescription = "Same balance exists where the user id is as the updated balance"
                return res.status(403).end(notificationDescription)
            } else {
                try {
                    const updatedbalance = await prisma.balance.update({
                        where: {
                            id: balanceUserId
                        },
                        data: {
                            userId: newBalance.userId,
                            investedMoneyInBDT: newBalance.investedMoneyInBDT,
                            withdrawedMoneyInBDT: newBalance.withdrawedMoneyInBDT,
                            returnOnInvestmentMoneyInBDT: newBalance.returnOnInvestmentMoneyInBDT,
                            referredMoneyInBDT: newBalance.referredMoneyInBDT,
                            extraMoneyInBDT: newBalance.extraMoneyInBDT,
                            balanceInBDT: newBalance.balanceInBDT,
                            updationTime: new Date()
                        }
                    })
                    if (updatedbalance) {
                        console.log('balance updated')
                        res.send(updatedbalance)
                    } else {
                        console.log("balance could not be updated")
                        let notificationDescription = "Please try again after sometimes. balance was not updated."
                        return res.status(500).end(notificationDescription)
                    }
                } catch (error) {
                    console.log("balance not found")
                    let notificationDescription = "Please check if this balance is there or not."
                    return res.status(403).end(notificationDescription)
                }
            }
        } catch (error) {
            console.log("balance remains the same")
            let notificationDescription = "Please try again after sometimes. There seems to be some issue with the network connection."
            return res.status(500).end(notificationDescription)

        }
        
    } else {
        console.log("balance invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }

})

balanceRouter.delete('/delete', async (req, res) => {
    const {balanceUserId} = req.body

    if(balanceUserId) {
        try {
            const deletedbalance = await prisma.balance.delete({
                where: {
                    id: balanceUserId
                }
            })
            console.log(deletedbalance)
            res.send(deletedbalance)
        } catch (error) {
            console.log("balance could not be deleted")
            let notificationDescription = "Please check the credentials passed for the deletion."
            return res.status(500).end(notificationDescription)
        }
    } else {
        console.log("balance invalid params")
        let notificationDescription = "Please provide correct id for the request."
        return res.status(400).end(notificationDescription)
    }
})

module.exports = balanceRouter