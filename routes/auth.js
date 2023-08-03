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

authRouter.post('/login', (req, res) => {
    console.log(req.body)
    res.send({"code": 1000})
})

authRouter.post('/register', async (req, res) => {

    const { email, password } = req.body

    if (!(email && password)) {
        res.status(400).send('Provide valid Email & Password !');
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
    }
        
})
    
    

// })

module.exports = authRouter