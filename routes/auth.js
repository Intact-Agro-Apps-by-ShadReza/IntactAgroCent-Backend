const { Router } = require('express')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')
const authRouter = Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const Encrypt = require('../encryption')

const emailValidator = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/
    if (reg.test(text) === false) {
        return false
    }
    else {
        return true
    }
}

authRouter.get('/', (req, res) => {
    res.send({name: "Assalamu Alaikum from Auth Router"})
})

authRouter.post('/forgotPassword', async (req, res) => {
    const { email } = req.body
    if (!(email)) {
        res.statusMessage = "Provide a valid Email!"
        return res.status(400).end("Provide a valid Email!")
    } else {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }


    try {
        const foundTheEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheEmail) {
            if (foundTheEmail.emailVerified) {
                let config = {
                    service: 'gmail',
                    auth: {
                        user: process.env.MAIL_OF_SENDER_CONFIGURED,
                        pass: process.env.PASSWORD_OF_SENDER_MAIL_CONFIGURED
                    }
                }

                let MailGenerator = new Mailgen({
                    theme: 'default',
                    product: {
                        name: 'Mailgen',
                        link: 'https://mailgen.js/'
                    }
                })

                const generatedOTP = Math.random().toString().substr(2, 6)

                const verificationCodeForMail = await prisma.mailVerificationCode.findFirst({
                    where: {
                        emailId: foundTheEmail.id
                    }
                })

                const codeTTLInMinutes = 10
                const currentTime = new Date()

                if (verificationCodeForMail) {
                    if (currentTime <= verificationCodeForMail.expiredAt) {
                        res.statusMessage = "A verification code is already sitting in your mail. Please verify first."
                        return res.status(201).end("A verification code is already sitting in your mail. Please verify first.")
                    }
                }
                await prisma.mailVerificationCode.deleteMany({
                    where: {
                        emailId: foundTheEmail.id
                    }
                })

                const veriificationMail = prisma.mailVerificationCode.create({
                    data: {
                        verificationCode: generatedOTP,
                        emailId: foundTheEmail.id,
                        expirationTimeInMinutes: codeTTLInMinutes,
                        expiredAt: new Date(new Date().getTime() + codeTTLInMinutes * 60000),
                        creationTime: new Date()
                    }
                })

                if (await veriificationMail && (await veriificationMail).emailId) {
                    let response = {
                        body: {
                            name: "Intact Agro",
                            intro: `Your password reset code is ${generatedOTP}`,
                            outro: `This will expire within ${codeTTLInMinutes} minutes...`
                        }
                    }

                    let mail = MailGenerator.generate(response)
                    let message = {
                        from: process.env.MAIL_OF_SENDER_CONFIGURED,
                        to: email,
                        subject: 'Password resetion from Intact Agro Cent',
                        html: mail
                    }

                    let transporter = nodemailer.createTransport(config)

                    transporter.sendMail(message)
                        .then(() => {
                            res.statusMessage = "Password Reset code sent to your mail. Reset password using that code."
                            return res.status(201).end("Password Reset code sent to your mail. Reset password using that code.")
                        })
                        .catch((error) => {
                            console.log(error.message)
                            res.statusMessage = "Password Reset could not be done now. Please try again after some time."
                            return res.status(500).end("Password Reset could not be done now. Please try again after some time.")
                        })
                } else {
                    console.log("Password Reset code could not be stored in DB")
                    res.statusMessage = "Password Reset could not be done now. Please try again after some time."
                    return res.status(500).end("Password Reset could not be done now. Please try again after some time.")
                }
            } else {
                console.log('Email not verified')
                res.statusMessage = "Your Email is not verified yet. Please verify your email first"
                return res.status(403).end("Your Email is not verified yet. Please verify your email first")
            }
        } else {
            console.log('Email not registered')
            res.statusMessage = "You are not registered. Please register first"
            return res.status(403).end("You are not registered. Please register first")
        }
    } catch (error) {
        console.log('Forgot Password Error')
        res.statusMessage = "Network Issue. Please Try Again sometimes later."
        return res.status(500).end("Network Issue. Please Try Again sometimes later.")
    }
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!(email && password)) {
        res.statusMessage = "Provide Email & Password !"
        return res.status(400).end("Provide Email & Password !")
    }

    if(email) {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }

    try {
        const foundTheSameEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheSameEmail) {
            if (foundTheSameEmail.email === email) {
                if (foundTheSameEmail.emailVerified) {
                    if ((await Encrypt.comparePassword(password, foundTheSameEmail.password))) {
                        await prisma.mailVerificationCode.deleteMany({
                            where: {
                                emailId: foundTheSameEmail.id
                            }
                        })
                        res.statusMessage = "Login Successful"
                        res.set({
                            userEmail: email,
                            userVerification: foundTheSameEmail.emailVerified
                        })
                        return res.status(200).end("Login Successful")
                    } else {
                        res.statusMessage = "Invalid Credentials"
                        return res.status(403).end("Invalid Credentials")
                    }
                } else {
                    res.statusMessage = "Email not verified yet. An OTP has been sent to your email."
                    return res.status(401).end("Email not verified yet. An OTP has been sent to your email.")
                }
            } else {
                console.log('invalid creds')
                res.statusMessage = "Invalid Credentials"
                return res.status(403).end("Invalid Credentials")
            }
        } else {
            console.log('Not Registered')
            res.statusMessage = "You are not registered. Please register first"
            return res.status(403).end("You are not registered. Please register first")
        }
    } catch (error) {
        console.log('Login Error')
        res.statusMessage = "Network Issue. Please Try Again sometimes later."
        return res.status(500).end("Network Issue. Please Try Again sometimes later.")
    }
})

authRouter.post('/resendVerificationCode', async (req, res) => {

    const { email } = req.body
    if (!(email)) {
        res.statusMessage = "Provide valid Email"
        return res.status(400).end("Provide valid Email")
    } else {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }

    try {
        const foundTheEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheEmail && foundTheEmail.emailVerified) {
            console.log('Email already verified')
            res.statusMessage = "Your Email is already verified."
            return res.status(400).end("Your Email is already verified.")
        }

        if (foundTheEmail) {
            let config = {
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_OF_SENDER_CONFIGURED,
                    pass: process.env.PASSWORD_OF_SENDER_MAIL_CONFIGURED
                }
            }

            let MailGenerator = new Mailgen({
                theme: 'default',
                product: {
                    name: 'Mailgen',
                    link: 'https://mailgen.js/'
                }
            })

            const generatedOTP = Math.random().toString().substr(2, 6)

            const verificationCodeForMail = await prisma.mailVerificationCode.findFirst({
                where: {
                    emailId: foundTheEmail.id
                }
            })

            const codeTTLInMinutes = 30

            if (verificationCodeForMail) {
                const currentTime = new Date()
                if (currentTime <= verificationCodeForMail.expiredAt) {
                    res.statusMessage = "A verification code is already sitting in your mail. Please verify first."
                    return res.status(201).end("A verification code is already sitting in your mail. Please verify first.")
                } else {
                    await prisma.mailVerificationCode.deleteMany({
                        where: {
                            emailId: foundTheEmail.id
                        }
                    })


                    const veriificationMail = prisma.mailVerificationCode.create({
                        data: {
                            verificationCode: generatedOTP,
                            emailId: foundTheEmail.id,
                            expirationTimeInMinutes: codeTTLInMinutes,
                            expiredAt: new Date(new Date().getTime() + codeTTLInMinutes * 60000),
                            creationTime: new Date()
                        }
                    })

                    if (await veriificationMail && (await veriificationMail).emailId) {
                        let response = {
                            body: {
                                name: "Intact Agro",
                                intro: `Your verification code is ${generatedOTP}`,
                                outro: `This will expire within ${codeTTLInMinutes} minutes...`
                            }
                        }

                        let mail = MailGenerator.generate(response)
                        let message = {
                            from: process.env.MAIL_OF_SENDER_CONFIGURED,
                            to: email,
                            subject: 'Email verification from Intact Agro Cent',
                            html: mail
                        }

                        let transporter = nodemailer.createTransport(config)

                        transporter.sendMail(message)
                            .then(() => {
                                res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email."
                                return res.status(201).end("Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.")
                            })
                            .catch((error) => {
                                console.log(error.message)
                                res.statusMessage = "Registration Successful. But mail not sent."
                                return res.status(500).end("Registration Successful. But mail not sent.")
                            })
                    } else {
                        console.log("VerificationCode could not be stored in DB")
                        res.statusMessage = "Registration Successful. But mail not sent."
                        return res.status(500).end("Registration Successful. But mail not sent.")
                    }
                }
            }
        } else {
            console.log('Email not registered')
            res.statusMessage = "Your Email is not registered. Please register at first."
            return res.status(409).end("Your Email is not registered. Please register at first.")
        }
    } catch (error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end("There were some issues. Please try again later")
    }

})

authRouter.post('/verifyMail', async (req, res) => {

    const { email, verificationCode } = req.body
    if (!(email && verificationCode)) {
        res.statusMessage = "Provide valid Email with Verification Code"
        return res.status(400).end("Provide valid Email with Verification Code")
    }

    if(email) {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }

    try {
        const foundTheEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheEmail && foundTheEmail.emailVerified) {
            console.log('Verification already done')
            res.statusMessage = "Mail already verified"
            return res.status(200).end("Mail already verified")
        }

        if (foundTheEmail) {
            const verificationCodeOfMail = await prisma.mailVerificationCode.findFirst({
                where: {
                    emailId: foundTheEmail.id
                }
            })
            if (verificationCodeOfMail && (verificationCodeOfMail.expiredAt >= new Date())) {
                if (verificationCodeOfMail.verificationCode === verificationCode) {
                    const verifyTheMail = await prisma.registeredMail.update({
                        where: {
                            email: foundTheEmail.email,
                        },
                        data: {
                            emailVerified: true,
                        }
                    })
                    
                    if (verifyTheMail && verifyTheMail.emailVerified) {    
                        await prisma.mailVerificationCode.deleteMany({
                            where: {
                                emailId: foundTheEmail.id
                            }
                        })
                        console.log('Verification done')
                        res.statusMessage = "Mail verified"
                        return res.status(200).end("Mail verified")
                    } else {
                        console.log('Verification incomplete')
                        res.statusMessage = "Mail could not be verified"
                        return res.status(500).end("Mail could not be verified")
                    }
                } else {
                    console.log('Verification Failure')
                    res.statusMessage = "Mail could not be verified"
                    return res.status(401).end("Mail could not be verified")
                }
            } else {
                console.log('Verification code has expired')
                res.statusMessage = "This verification code has been expired"
                return res.status(409).end("This verification code has been expired")
            }
        } else {
            console.log('Email does not exits')
            res.statusMessage = "This Email has not been registered yet"
            return res.status(409).end("This Email has not been registered yet")
        }
    } catch (error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end("There were some issues. Please try again later")
    }
})

authRouter.post('/verifyPasswordReset', async (req, res) => {

    const { email, verificationCode, password } = req.body
    if (!(email && verificationCode && password)) {
        res.statusMessage = "Provide valid Email with Verification Code and New Password"
        return res.status(400).end("Provide valid Email with Verification Code and New Password")
    }

    if(email) {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }

    try {
        const foundTheEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheEmail) {
            const verificationCodeOfMail = await prisma.mailVerificationCode.findFirst({
                where: {
                    emailId: foundTheEmail.id
                }
            })
            if (foundTheEmail.emailVerified && verificationCodeOfMail && (verificationCodeOfMail.expiredAt >= new Date())) {
                const encryptedPassowrd = await Encrypt.cryptPassword(password)
                if (verificationCodeOfMail.verificationCode === verificationCode) {
                    const verifyTheMail = await prisma.registeredMail.update({
                        where: {
                            email: foundTheEmail.email,
                        },
                        data: {
                            password: encryptedPassowrd
                        }
                    })
                    
                    if (verifyTheMail && verifyTheMail.emailVerified && verifyTheMail.password) {    
                        await prisma.mailVerificationCode.deleteMany({
                            where: {
                                emailId: foundTheEmail.id
                            }
                        })
                        console.log('Password Reset Done')
                        res.statusMessage = "You have successfully reseted your password."
                        return res.status(200).end("You have successfully reseted your password.")
                    } else {
                        console.log('Password reset incomplete')
                        res.statusMessage = "Password could not be reset"
                        return res.status(500).end("Password could not be reset")
                    }
                } else {
                    console.log('Verification Failure')
                    res.statusMessage = "Password reset code don't match"
                    return res.status(401).end("Password reset code don't match")
                }
            } else {
                console.log('Password reset code has expired')
                res.statusMessage = "This password reset code has been expired"
                return res.status(409).end("This password reset code has been expired")
            }
        } else {
            console.log('Email does not exits')
            res.statusMessage = "This Email has not been registered yet"
            return res.status(409).end("This Email has not been registered yet")
        }
    } catch (error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end("There were some issues. Please try again later")
    }
})

authRouter.post('/register', async (req, res) => {

    const { email, password } = req.body

    if (!(email && password)) {
        res.statusMessage = "Provide valid Email & Password !"
        return res.status(400).end("Provide valid Email & Password !")
    }

    if(email) {
        if (!emailValidator(email)) {
            res.statusMessage = "Provide a valid Email!"
            return res.status(400).end("Provide a valid Email!")
        }
    }

    try {
        const foundTheSameEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheSameEmail) {
            // the user has already registered
            console.log('Same Email already exists')
            const emailVerificationMessage = foundTheSameEmail.emailVerified ? "Please Signin." : "Please do the verification."
            res.statusMessage = "This Email has already joined. " + emailVerificationMessage
            return res.status(409).end("This Email has already joined. " + emailVerificationMessage)
        } else {
            // the user has not yet registered
            const encryptedPassowrd = await Encrypt.cryptPassword(password)
                
            const registeredMail = await prisma.registeredMail.create({
                data: {
                    email: email,         
                    password: encryptedPassowrd,         
                    emailVerified: false,
                    creationTime: new Date()
                }
            })
            
            if (registeredMail && registeredMail.email && registeredMail.email === email) {
                let config = {
                    service: 'gmail',
                    auth: {
                        user: process.env.MAIL_OF_SENDER_CONFIGURED,
                        pass: process.env.PASSWORD_OF_SENDER_MAIL_CONFIGURED
                    }
                }

                let MailGenerator = new Mailgen({
                    theme: 'default',
                    product: {
                        name: 'Mailgen',
                        link: 'https://mailgen.js/'
                    }
                })

                const generatedOTP = Math.random().toString().substr(2, 6)

                const verificationCodeForMail = await prisma.mailVerificationCode.findFirst({
                    where: {
                        emailId: registeredMail.id
                    }
                })

                const codeTTLInMinutes = 30

                if (verificationCodeForMail) {
                    const currentTime = new Date()
                    if (currentTime >= verificationCodeForMail.expiredAt) {
                        res.statusMessage = "A verification code is already sitting in your mail. Please verify first."
                        return res.status(201).end("A verification code is already sitting in your mail. Please verify first.")
                    } else {
                        await prisma.mailVerificationCode.deleteMany({
                            where: {
                                emailId: registeredMail.id
                            }
                        })


                        const veriificationMail = prisma.mailVerificationCode.create({
                            data: {
                                verificationCode: generatedOTP,
                                emailId: registeredMail.id,
                                expirationTimeInMinutes: codeTTLInMinutes,
                                expiredAt: new Date(new Date().getTime() + codeTTLInMinutes * 60000),
                                creationTime: new Date()
                            }
                        })

                        if(await veriificationMail && (await veriificationMail).emailId) {
                            let response = {
                                body: {
                                    name: "Intact Agro",
                                    intro: `Your verification code is ${generatedOTP}`,
                                    outro: `This will expire within ${codeTTLInMinutes} minutes...`
                                }
                            }

                            let mail = MailGenerator.generate(response)
                            let message = {
                                from: process.env.MAIL_OF_SENDER_CONFIGURED,
                                to: email,
                                subject: 'Email verification from Intact Agro Cent',
                                html: mail
                            }

                            let transporter = nodemailer.createTransport(config)

                            transporter.sendMail(message)
                                .then(() => {
                                    res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email."
                                    return res.status(201).end("Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.")
                                })
                                .catch((error) => {
                                    console.log(error.message)
                                    res.statusMessage = "Registration Successful. But mail not sent."
                                    return res.status(500).end("Registration Successful. But mail not sent.")
                                })
                        } else {
                            console.log("VerificationCode could not be stored in DB")
                            res.statusMessage = "Registration Successful. But mail not sent."
                            return res.status(500).end("Registration Successful. But mail not sent.")
                        }
                    }
                } else {
                    const veriificationMail = prisma.mailVerificationCode.create({
                        data: {
                            verificationCode: generatedOTP,
                            emailId: registeredMail.id,
                            expirationTimeInMinutes: codeTTLInMinutes,
                            expiredAt: new Date(new Date().getTime() + codeTTLInMinutes * 60000),
                            creationTime: new Date()
                        }
                    })

                    if(await veriificationMail && (await veriificationMail).emailId) {
                        let response = {
                            body: {
                                name: "Intact Agro",
                                intro: `Your verification code is ${generatedOTP}`,
                                outro: `This will expire within ${codeTTLInMinutes} minutes...`
                            }
                        }

                        let mail = MailGenerator.generate(response)
                        let message = {
                            from: process.env.MAIL_OF_SENDER_CONFIGURED,
                            to: email,
                            subject: 'Email verification from Intact Agro Cent',
                            html: mail
                        }

                        let transporter = nodemailer.createTransport(config)

                        transporter.sendMail(message)
                            .then(() => {
                                res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email."
                                return res.status(201).end("Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.")
                            })
                            .catch((error) => {
                                console.log(error.message)
                                res.statusMessage = "Registration Successful. But mail not sent."
                                return res.status(500).end("Registration Successful. But mail not sent.")
                            })
                    } else {
                        console.log("VerificationCode could not be stored in DB")
                        res.statusMessage = "Registration Successful. But mail not sent."
                        return res.status(500).end("Registration Successful. But mail not sent.")
                    }
                }
            } else {
                res.statusMessage = "Registration Unsuccessful. Please try again later "
                return res.status(409).end("Registration Unsuccessful. Please try again later ")
            }
        }

        
    } catch(error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end("There were some issues. Please try again later")
    }
        
})

module.exports = authRouter