const { Router } = require("express");

const storeBalanceRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

storeBalanceRouter.get("/", async (req, res) => {
	try {
		const storeBalance = await prisma.storeBalance.findFirst();
		if (storeBalance) {
			res.send(storeBalance);
		} else {
			let notificationDescription = "No Data Found.";
			return res.status(500).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

storeBalanceRouter.post("/reset", async (req, res) => {
	const { resetPassword } = req.body;
	if (
		resetPassword &&
		resetPassword === process.env.STORE_BALANCE_RESET_PASSWORD
	) {
		try {
			await prisma.storeBalance.deleteMany().then(async (response) => {
				try {
					const createdStoreBalance = await prisma.storeBalance.create({
						data: {
							creationTime: new Date(),
							updationTime: new Date(),
							moneyInBdtInlet: 0.0,
							moneyInBdtOutlet: 0.0,
							moneyInBdtForWithdrawls: 0.0,
							moneyInBdtForReferrals: 0.0,
							moneyInBdtForPendingWithdrawls: 0.0,
						},
					});
					if (createdStoreBalance) {
						res.send(createdStoreBalance);
					} else {
						let notificationDescription =
							"There were some issues creating the initial data as nothing is there. Please try again after sometimes.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					let notificationDescription =
						"There were some issues connecting with the server. Please try again after sometimes.";
					return res.status(500).end(notificationDescription);
				}
			});
		} catch (error) {
			console.log(error.message);
			let notificationDescription =
				"There were some issues connecting with the server. Please try again after sometimes.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		let notificationDescription =
			"Invalid params. Please make a proper request to reset the store balance.";
		console.log(notificationDescription);
		return res.status(500).end(notificationDescription);
	}
});

module.exports = storeBalanceRouter;
