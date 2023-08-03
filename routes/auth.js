const { Router } = require('express')
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen')
const authRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const textflow = require("textflow.js");
const Encrypt = require('../encryption');
const { error } = require('console');
textflow.useKey("KRK7Fkk2tpTNgCbZtCh43DJtVOyhOEomYtUT270kradNbvyg4woMHmgqQWoGLv7L");

authRouter.get('/', (req, res) => {
    res.send({name: "Assalamu Alaikum from Auth Router"})
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!(email && password)) {
        res.statusMessage = "Provide Email & Password !"
        return res.status(400).end();
    }

    try {
        const foundTheSameEmail = await prisma.registeredMail.findFirst({
            where: {
                email: email
            }
        })

        if (foundTheSameEmail && foundTheSameEmail.email === email && foundTheSameEmail.emailVerified && (await Encrypt.comparePassword(password, foundTheSameEmail.password))) {
            res.statusMessage = "Login Successful"
            return res.status(200).end();
        } else {
            res.statusMessage = "Invalid Credentials"
            return res.status(403).end();
        }
    } catch (error) {
        console.log('Login Error')
        res.statusMessage = "Network Issue. Please Try Again sometimes later."
        return res.status(500).end();
    }
})

authRouter.post('/resendVerificationCode', async (req, res) => {

    const { email } = req.body
    if (!(email)) {
        res.statusMessage = "Provide valid Email"
        return res.status(400).end();
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
                if (currentTime >= verificationCodeForMail.expiredAt) {
                    res.statusMessage = "A verification code is already sitting in your mail. Please verify first.";
                    return res.status(201).end();
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
                        }
                    })

                    if (await veriificationMail && (await veriificationMail).emailId) {
                        let response = {
                            body: {
                                name: "Intact Agro",
                                intro: `Your verification code is ${generatedOTP}`,
                                outro: 'This will expire within 30 minutes...'
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
                                res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.";
                                return res.status(201).end();
                            })
                            .catch((error) => {
                                console.log(error.message)
                                res.statusMessage = "Registration Successful. But mail not sent.";
                                return res.status(500).end();
                            })
                    } else {
                        console.log("VerificationCode could not be stored in DB")
                        res.statusMessage = "Registration Successful. But mail not sent.";
                        return res.status(500).end();
                    }
                }
            }
        } else {
            console.log('Email not registered')
            res.statusMessage = "Your Email is not registered. Please register at first."
            return res.status(409).end();
        }
    } catch (error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end();
    }

})

authRouter.post('/verifyMail', async (req, res) => {

    const { email, verificationCode } = req.body
    if (!(email && verificationCode)) {
        res.statusMessage = "Provide valid Email with Verification Code"
        return res.status(400).end();
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
            if (verificationCodeOfMail && (verificationCodeOfMail.expiredAt >= new Date())) {
                if (verificationCodeOfMail.verificationCode === verificationCode) {
                    const verifyTheMail = await prisma.registeredMail.update({
                        where: {
                            email: foundTheEmail.email,
                        },
                        data: {
                            emailVerified: true
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
                        return res.status(200).end();
                    } else {
                        console.log('Verification incomplete')
                        res.statusMessage = "Mail could not be verified"
                        return res.status(500).end();
                    }
                } else {
                    console.log('Verification Failure')
                    res.statusMessage = "Mail could not be verified"
                    return res.status(401).end();
                }
            } else {
                console.log('Verification code has expired')
                res.statusMessage = "This verification code has been expired"
                return res.status(409).end();
            }
        } else {
            console.log('Email does not exits')
            res.statusMessage = "This Email has not been registered yet"
            return res.status(409).end();
        }
    } catch (error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end();
    }
})

authRouter.post('/register', async (req, res) => {

    const { email, password } = req.body

    if (!(email && password)) {
        res.statusMessage = "Provide valid Email & Password !"
        return res.status(400).end();
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
            res.statusMessage = "This Email has already joined. " + emailVerificationMessage;
            return res.status(409).end();
        } else {
            // the user has not yet registered
            const encryptedPassowrd = await Encrypt.cryptPassword(password)
                
            const registeredMail = await prisma.registeredMail.create({
                data: {
                    email: email,         
                    password: encryptedPassowrd,         
                    emailVerified: false
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
                        res.statusMessage = "A verification code is already sitting in your mail. Please verify first.";
                        return res.status(201).end();
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
                                expiredAt: new Date(new Date().getTime() + codeTTLInMinutes*60000),
                            }
                        })

                        if(await veriificationMail && (await veriificationMail).emailId) {
                            let response = {
                                body: {
                                    name: "Intact Agro",
                                    intro: `Your verification code is ${generatedOTP}`,
                                    outro: 'This will expire within 30 minutes...'
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
                                    res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.";
                                    return res.status(201).end();
                                })
                                .catch((error) => {
                                    console.log(error.message)
                                    res.statusMessage = "Registration Successful. But mail not sent.";
                                    return res.status(500).end();
                                })
                        } else {
                            console.log("VerificationCode could not be stored in DB")
                            res.statusMessage = "Registration Successful. But mail not sent.";
                            return res.status(500).end();
                        }
                    }
                } else {
                    const veriificationMail = prisma.mailVerificationCode.create({
                        data: {
                            verificationCode: generatedOTP,
                            emailId: registeredMail.id,
                            expirationTimeInMinutes: codeTTLInMinutes,
                            expiredAt: new Date(new Date().getTime() + codeTTLInMinutes*60000),
                        }
                    })

                    if(await veriificationMail && (await veriificationMail).emailId) {
                        let response = {
                            body: {
                                name: "Intact Agro",
                                intro: `Your verification code is ${generatedOTP}`,
                                outro: 'This will expire within 30 minutes...'
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
                                res.statusMessage = "Registration Successful. Please verify your mail. We've already sent you a verification mail to your registered Email.";
                                return res.status(201).end();
                            })
                            .catch((error) => {
                                console.log(error.message)
                                res.statusMessage = "Registration Successful. But mail not sent.";
                                return res.status(500).end();
                            })
                    } else {
                        console.log("VerificationCode could not be stored in DB")
                        res.statusMessage = "Registration Successful. But mail not sent.";
                        return res.status(500).end();
                    }
                }
            } else {
                res.statusMessage = "Registration Unsuccessful. Please try again later ";
                return res.status(409).end();
            }
        }

        
    } catch(error) {
        console.log('Error', error.message)
        res.statusMessage = "There were some issues. Please try again later"
        return res.status(409).end();
    }
        
})

module.exports = authRouter