const { Router } = require("express");

const transactionCodesRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

transactionCodesRouter.get("/", async (req, res) => {
	try {
		const transactionCodes = await prisma.transactionCodes.findMany();
		res.send(transactionCodes);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

transactionCodesRouter.post("/create", async (req, res) => {
	const { trxCode, trxName, createdById } = req.body;

	if (trxCode && trxName && createdById) {
		try {
			const sameTransactionCode = await prisma.transactionCodes.findFirst({
				where: {
					OR: [{ trxCode: trxCode }, { trxName: trxName }],
				},
			});

			if (sameTransactionCode) {
				console.log("same transaction code found");
				let notificationDescription =
					"Another transaction code is having the same title or code.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdTransactionCode = await prisma.transactionCodes.create({
					data: {
						trxCode: trxCode,
						trxName: trxName,
						updationTime: new Date(),
						creationTime: new Date(),
						createdById: createdById,
					},
				});
				if (createdTransactionCode) {
					console.log("transaction code created");
					let notificationDescription =
						"transaction code was created successfully.";
					res.send(createdTransactionCode);
				} else {
					console.log("transaction code not created");
					let notificationDescription =
						"transaction code could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("transaction code" + error.message);
			let notificationDescription =
				"transaction code could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction code invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

transactionCodesRouter.put("/update", async (req, res) => {
	const { transactionCodeId, newTransactionCode } = req.body;

	if (
		transactionCodeId &&
		newTransactionCode.trxCode &&
		newTransactionCode.trxName
	) {
		try {
			const conflictingTransactionCode =
				await prisma.transactionCodes.findFirst({
					where: {
						OR: [
							{ trxCode: newTransactionCode.trxCode },
							{ trxName: newTransactionCode.trxName },
						],
					},
				});
			if (conflictingTransactionCode) {
				console.log(
					"same transaction code found with the updated configuration"
				);
				let notificationDescription =
					"Same transactioncode exists where the name or code is as the updated transaction code";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedTransactionCode = await prisma.transactionCodes.update({
						where: {
							id: transactionCodeId,
						},
						data: {
							trxCode: newTransactionCode.trxCode,
							trxName: newTransactionCode.trxName,
							updationTime: new Date(),
						},
					});
					if (updatedTransactionCode) {
						console.log("transaction code updated");
						res.send(updatedTransactionCode);
					} else {
						console.log("transaction code could not be updated");
						let notificationDescription =
							"Please try again after sometimes. transaction code was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("transaction code not found");
					let notificationDescription =
						"Please check if this transaction code is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("transaction code remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction code invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

transactionCodesRouter.delete("/delete", async (req, res) => {
	const { transactionCodeId } = req.body;

	if (transactionCodeId) {
		try {
			const deletedTransactionCode = await prisma.transactionCodes.delete({
				where: {
					id: transactionCodeId,
				},
			});
			console.log(deletedTransactionCode);
			res.send(deletedTransactionCode);
		} catch (error) {
			console.log("transaction code could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("transaction code invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = transactionCodesRouter;
