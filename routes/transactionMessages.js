const { Router } = require("express");

const transactionMessagesRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

transactionMessagesRouter.get("/", async (req, res) => {
	try {
		const transactionMessages = await prisma.transactionMessage.findMany();
		res.send(transactionMessages);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please try again after sometimes. There seems to be some issue with the network connection.";
		return res.status(500).end(notificationDescription);
	}
});

transactionMessagesRouter.post("/create", async (req, res) => {
	const {
		sendingTime,
		title,
		description,
		transactionFromId,
		transactionToId,
	} = req.body;

	if (title && description && transactionFromId && transactionToId) {
		try {
			const sameTransactionMessage = await prisma.transactionMessage.findFirst({
				where: {
					title: title,
					description: description,
					transactionFromId: transactionFromId,
					transactionToId: transactionToId,
				},
			});

			if (sameTransactionMessage) {
				console.log("same transaction message found");
				let notificationDescription =
					"Another transaction message is having the same properties.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdTransactionMessage =
					await prisma.transactionMessage.create({
						data: {
							title: title,
							description: description,
							transactionFromId: transactionFromId,
							transactionToId: transactionToId,
							sendingTime: new Date(),
							updationTime: new Date(),
						},
					});
				if (createdTransactionMessage) {
					console.log("transaction mesage created");
					let notificationDescription =
						"Transaction mesage was created successfully.";
					res.send(createdTransactionMessage);
				} else {
					console.log("transaction mesage not created");
					let notificationDescription =
						"Rransaction mesage could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("transaction mesage" + error.message);
			let notificationDescription =
				"Transaction mesage could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction mesage invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

transactionMessagesRouter.put("/update", async (req, res) => {
	const { transactionMessageId, newTransactionMessage } = req.body;

	if (
		transactionMessageId &&
		newTransactionMessage.title &&
		newTransactionMessage.description &&
		newTransactionMessage.transactionFromId &&
		newTransactionMessage.transactionToId
	) {
		try {
			const conflictingTransactionMessage =
				await prisma.transactionMessage.findFirst({
					where: {
						title: newTransactionMessage.title,
						transactionFromId: newTransactionMessage.transactionFromId,
						transactionToId: newTransactionMessage.transactionToId,
						description: newTransactionMessage.description,
					},
				});
			if (conflictingTransactionMessage) {
				console.log(
					"same transaction message found with the updated information"
				);
				let notificationDescription =
					"Same transaction message exists where the information is as the updated transaction message";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedTransactionMessage =
						await prisma.transactionMessage.update({
							where: {
								id: transactionMessageId,
							},
							data: {
								title: newTransactionMessage.title,
								description: newTransactionMessage.description,
								transactionFromId: newTransactionMessage.transactionFromId,
								transactionToId: newTransactionMessage.transactionToId,
								updationTime: new Date(),
							},
						});
					if (updatedTransactionMessage) {
						console.log("transaction message updated");
						res.send(updatedTransactionMessage);
					} else {
						console.log("transaction message could not be updated");
						let notificationDescription =
							"Please try again after sometimes. Transactoin Message was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("transaction message not found");
					let notificationDescription =
						"Please check if this transaction message is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("transaction message remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction message invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

transactionMessagesRouter.delete("/delete", async (req, res) => {
	const { transactionMessageId } = req.body;

	if (transactionMessageId) {
		try {
			const deletedTransactionMessage = await prisma.transactionMessage.delete({
				where: {
					id: transactionMessageId,
				},
			});
			console.log(deletedTransactionMessage);
			res.send(deletedTransactionMessage);
		} catch (error) {
			console.log("transaction message could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction message invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = transactionMessagesRouter;
