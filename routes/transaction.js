const { Router } = require("express");

const transactionRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

transactionRouter.get("/", async (req, res) => {
	try {
		const transactions = await prisma.transaction.findMany();
		res.send(transactions);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please try again after sometimes. There seems to be some issue with the network connection.";
		return res.status(500).end(notificationDescription);
	}
});

transactionRouter.post("/create", async (req, res) => {
	const {
		transactionFromId,
		transactionToId,
		transactionAmount,
		transactionStatus,
		trxId,
		trxCodeId,
	} = req.body;

	if (
		transactionFromId &&
		transactionToId &&
		transactionAmount &&
		transactionStatus &&
		trxId
	) {
		try {
			const sameTransaction = await prisma.transaction.findFirst({
				where: {
					trxId: trxId,
				},
			});

			if (sameTransaction) {
				console.log("same transaction found");
				let notificationDescription = "Another transaction is having the id.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdTransaction = await prisma.transaction.create({
					data: {
						transactionFromId: transactionFromId,
						transactionToId: transactionToId,
						transactionAmount: transactionAmount,
						transactionStatus: transactionStatus,
						trxId: trxId,
						trxCodeId: trxCodeId,
						creationTime: new Date(),
						updationTime: new Date(),
					},
				});
				if (createdTransaction) {
					console.log("transaction created");
					let notificationDescription = "transaction was created successfully.";
					res.send(createdTransaction);
				} else {
					console.log("transaction not created");
					let notificationDescription = "transaction could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("transaction" + error.message);
			let notificationDescription =
				"Transaction could not be created. Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

transactionRouter.put("/update", async (req, res) => {
	const { transactionId, newTransaction } = req.body;

	if (
		transactionId &&
		newTransaction.transactionFromId &&
		newTransaction.transactionToId &&
		newTransaction.transactionAmount &&
		newTransaction.transactionStatus &&
		newTransaction.trxId &&
		newTransaction.trxCodeId
	) {
		try {
			const oldTransaction = await prisma.transaction.findFirst({
				where: {
					id: transactionId,
				},
			});
			if (oldTransaction) {
				const updatedtransaction = await prisma.transaction.update({
					where: {
						id: transactionId,
					},
					data: {
						transactionFromId: newTransaction.transactionFromId,
						transactionToId: newTransaction.transactionToId,
						transactionAmount: newTransaction.transactionAmount,
						transactionStatus: newTransaction.transactionStatus,
						trxId: newTransaction.trxId,
						trxCodeId: newTransaction.trxCodeId,
						updationTime: new Date(),
					},
				});
				if (updatedtransaction) {
					console.log("transaction updated");
					res.send(updatedtransaction);
				} else {
					console.log("transaction could not be updated");
					let notificationDescription =
						"Please try again after sometimes. There seems to be some issue with the network connection.Transaction was not updated.";
					return res.status(500).end(notificationDescription);
				}
			} else {
				console.log("transaction id not valid");
				let notificationDescription =
					"Please provide valid transaction id cause it is not valid.";
				return res.status(404).end(notificationDescription);
			}
		} catch (error) {
			console.log("transaction remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

transactionRouter.post("/delete", async (req, res) => {
	const { transactionId } = req.body;

	if (transactionId) {
		try {
			const deletedtransaction = await prisma.transaction.delete({
				where: {
					id: transactionId,
				},
			});
			console.log(deletedtransaction);
			res.send(deletedtransaction);
		} catch (error) {
			console.log("transaction could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = transactionRouter;
