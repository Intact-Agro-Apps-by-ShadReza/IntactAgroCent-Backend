const { Router } = require("express");

const withdrawlRequestsRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

withdrawlRequestsRouter.get("/", async (req, res) => {
	try {
		const withdrawlRequests = await prisma.withdrawlRequest.findMany();
		res.send(withdrawlRequests);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please try again after sometimes. There seems to be some issue with the network connection.";
		return res.status(500).end(notificationDescription);
	}
});

withdrawlRequestsRouter.post("/create", async (req, res) => {
	const { initiatedById, withdrawlAmount, status, processedById } = req.body;

	if (initiatedById && withdrawlAmount && status && processedById) {
		try {
			const createdWithdrawlRequest = await prisma.withdrawlRequest.create({
				data: {
					initiatedById: initiatedById,
					withdrawlAmount: withdrawlAmount,
					status: status,
					processedById: processedById,
					withdrawlStatus: "pending",
					processedTime: new Date(),
					updationTime: new Date(),
				},
			});
			if (createdWithdrawlRequest) {
				console.log("withdrawl request created");
				let notificationDescription =
					"Withdrawl Request was created successfully.";
				res.send(createdWithdrawlRequest);
			} else {
				console.log("withdrawl request not created");
				let notificationDescription = "Withdrawl Request could not be created.";
				return res.status(406).end(notificationDescription);
			}
		} catch (error) {
			console.log("Withdrawl Request" + error.message);
			let notificationDescription =
				"Withdrawl Request could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Withdrawl Request invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

withdrawlRequestsRouter.put("/update", async (req, res) => {
	const { withdrawlRequestId, newWithdrawlRequest } = req.body;

	if (
		withdrawlRequestId &&
		newWithdrawlRequest &&
		newWithdrawlRequest.initiatedById &&
		newWithdrawlRequest.withdrawlAmount &&
		newWithdrawlRequest.status &&
		newWithdrawlRequest.processedById &&
		newWithdrawlRequest.withdrawlStatus
	) {
		try {
			const updatedWithdrawlRequest = await prisma.withdrawlRequest.update({
				where: {
					id: withdrawlRequestId,
				},
				data: {
					initiatedById: newWithdrawlRequest.initiatedById,
					withdrawlAmount: newWithdrawlRequest.withdrawlAmount,
					status: newWithdrawlRequest.status,
					processedById: newWithdrawlRequest.processedById,
					withdrawlStatus: newWithdrawlRequest.withdrawlStatus,
					updationTime: new Date(),
				},
			});
			if (updatedWithdrawlRequest) {
				console.log("withdrawl request updated");
				res.send(updatedWithdrawlRequest);
			} else {
				console.log("Withdrawl Request could not be updated");
				let notificationDescription =
					"Please try again after sometimes. Tag was not updated.";
				return res.status(500).end(notificationDescription);
			}
		} catch (error) {
			console.log("Withdrawl Request remains the same");
			let notificationDescription =
				"Please check if your connection is stable. Please try again within some time.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Withdrawl Request invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

withdrawlRequestsRouter.post("/delete", async (req, res) => {
	const { withdrawlRequestId } = req.body;

	if (withdrawlRequestId) {
		try {
			const deletedWithdrawlRequest = await prisma.withdrawlRequest.delete({
				where: {
					id: withdrawlRequestId,
				},
			});
			console.log(deletedWithdrawlRequest);
			res.send(deletedWithdrawlRequest);
		} catch (error) {
			console.log("Withdrawl Request could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Withdrawl Request invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = withdrawlRequestsRouter;
