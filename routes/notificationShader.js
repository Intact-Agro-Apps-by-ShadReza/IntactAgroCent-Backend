const { Router } = require("express");

const notificationShaderRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

notificationShaderRouter.get("/", async (req, res) => {
	try {
		const notificationShader = await prisma.notificationShader.findMany();
		res.send(notificationShader);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please check if your connection is stable. Please try again within some time.";
		return res.status(500).end(notificationDescription);
	}
});

notificationShaderRouter.post("/create", async (req, res) => {
	const { initiatedById, initiatedForType, initiatedForId, message } = req.body;

	if (
		initiatedById &&
		initiatedForType &&
		initiatedForType !== "all-user" &&
		initiatedForType !== "all-admin" &&
		initiatedForType !== "all" &&
		initiatedForId != "" &&
		message
	) {
		try {
			const sameNotification = await prisma.notificationShader.findFirst({
				where: {
					initiatedForType: initiatedForType,
					initiatedForId: initiatedForId,
					message: message,
				},
			});

			if (sameNotification) {
				console.log("same notfication for the same audience found");
				let notificationDescription =
					"Another notification is having the same configuration.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdNotificationShader =
					await prisma.notificationShader.create({
						data: {
							initiatedById: initiatedById,
							initiatedForType: initiatedForType,
							initiatedForId: initiatedForId,
							message: message,
							creationTime: new Date(),
							updationTime: new Date(),
						},
					});
				if (createdNotificationShader) {
					console.log("notification shader created");
					let notificationDescription =
						"Notification shader was created successfully.";
					res.send(createdNotificationShader);
				} else {
					console.log("notification shader not created");
					let notificationDescription =
						"Notification shader could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("notification shader " + error.message);
			let notificationDescription =
				"Notification shader could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("notification shader invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

notificationShaderRouter.put("/update", async (req, res) => {
	const { notificationShaderId, newNotificationShader } = req.body;

	if (
		notificationShaderId &&
		newNotificationShader.initiatedById &&
		newNotificationShader.initiatedForType &&
		newNotificationShader.initiatedForId &&
		newNotificationShader.message
	) {
		try {
			const conflictingNotificationShader =
				await prisma.notificationShader.findFirst({
					where: {
						initiatedForId: newNotificationShader.initiatedForId,
						initiatedForType: newNotificationShader.initiatedForType,
						initiatedById: newNotificationShader.initiatedById,
						message: newNotificationShader.message,
					},
				});
			if (conflictingNotificationShader) {
				console.log(
					"same notification shader found with the updated configuration"
				);
				let notificationDescription =
					"Same notification shader exists where the configuration is as the updated notification shader";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedNotificationShader =
						await prisma.notificationShader.update({
							where: {
								id: notificationShaderId,
							},
							data: {
								initiatedById: newNotificationShader.initiatedById,
								initiatedForType: newNotificationShader.initiatedForType,
								initiatedForId: newNotificationShader.initiatedForId,
								updationTime: new Date(),
							},
						});
					if (updatedNotificationShader) {
						console.log("notification shader updated");
						res.send(updatedNotificationShader);
					} else {
						console.log("notification shader could not be updated");
						let notificationDescription =
							"Please try again after sometimes. Notification Shader was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("notification shader not found");
					let notificationDescription =
						"Please check if this notification shader is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("notification shader remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("notification shader invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

notificationShaderRouter.post("/delete", async (req, res) => {
	const { notificationShaderId } = req.body;

	if (notificationShaderId) {
		try {
			const deletedNotificationShader = await prisma.notificationShader.delete({
				where: {
					id: notificationShaderId,
				},
			});
			console.log(deletedNotificationShader);
			res.send(deletedNotificationShader);
		} catch (error) {
			console.log("notification shader could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("notification shader invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = notificationShaderRouter;
