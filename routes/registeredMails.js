const { Router } = require("express");

const registeredMailsRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

registeredMailsRouter.get("/", async (req, res) => {
	try {
		const registeredMails = await prisma.registeredMail.findMany();
		if (registeredMails.length) {
			res.send(registeredMails);
		} else {
			let notificationDescription = "No Registered Mails Found...";
			console.log(notificationDescription);
			return res.status(404).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please try again after sometimes. There seems to be some issue with the network connection.";
		return res.status(500).end(notificationDescription);
	}
});

module.exports = registeredMailsRouter;
