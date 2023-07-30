const { Router } = require('express')
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen')
const authRouter = Router()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const textflow = require("textflow.js");
textflow.useKey("KRK7Fkk2tpTNgCbZtCh43DJtVOyhOEomYtUT270kradNbvyg4woMHmgqQWoGLv7L");

authRouter.get('/', (req, res) => {
    res.send({name: "Assalamu Alaikum from Auth Router"})
})

authRouter.post('/login', (req, res) => {
    console.log(req.body)
    res.send({"code": 1000})
})

// authRouter.post('/mail', async (req, res) => {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'sabryna.mills92@ethereal.email',
//             pass: 'vnrbdJJ593JEpMeaeg'
//         }
//     });
//     const message = {
//         from: '"Intact Agro 👻" <intactagrocent@gmail.com>', // sender address
//         to: "shadreza100@gmail.com", // list of receivers
//         subject: "Hello ✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>", // html body
//     };

//     transporter.sendMail(message).then((info) => {
//         return res.status(201).json({
//             msg: "you should have recieved a mail",
//             info: info.messageId,
//             preview: nodemailer.getTestMessageUrl(info) 
//         })
//     })

// })

authRouter.post('/realMail', async (req, res) => {
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

    let response = {
        body: {
            name: "Intact Agro",
            intro: `Your verification code is ${Math.random().toString().substr(2, 6)}`,
            outro: 'This will expire within 30 minutes...'
        }
    }

    let mail = MailGenerator.generate(response)
    let message = {
        from: process.env.MAIL_OF_SENDER_CONFIGURED,
        to: 'sidratul15-13585@diu.edu.bd',
        subject: 'This is a test Message',
        html: mail
    }

    let transporter = nodemailer.createTransport(config)

    transporter.sendMail(message)
        .then(() => {
            return res.status(201).json("real mail sent")
        })
        .catch((error) => {
            console.log(error.message)
            res.status(500).json("real mail could not be sent")
        })
})

module.exports = authRouter