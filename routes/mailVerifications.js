const { Router } = require("express");

const mailVerificationsRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

mailVerificationsRouter.get("/", async (req, res) => {
	try {
		const mailVerificationCodes = await prisma.mailVerificationCode.findMany();
		if (mailVerificationCodes.length) {
			res.send(mailVerificationCodes);
		} else {
			let notificationDescription = "No Mail Verifications Found...";
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

module.exports = mailVerificationsRouter;
