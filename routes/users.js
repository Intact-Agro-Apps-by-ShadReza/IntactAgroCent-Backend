const { Router } = require("express");

const usersRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

usersRouter.get("/", async (req, res) => {
	try {
		const users = await prisma.user.findMany();
		res.send(users);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

usersRouter.post("/create", async (req, res) => {
	const {
		username,
		firstName,
		lastName,
		email,
		phoneNumber,
		bankAccountNumber,
		nidCardFrontPicLink,
		nidCardBackPicLink,
		address,
		country,
		dateOfBirth,
	} = req.body;

	if (
		username &&
		firstName &&
		lastName &&
		email &&
		phoneNumber &&
		bankAccountNumber &&
		nidCardFrontPicLink &&
		nidCardBackPicLink &&
		address &&
		country &&
		dateOfBirth
	) {
		try {
			const sameUser = await prisma.user.findFirst({
				where: {
					OR: [
						{ username: username },
						{ email: email },
						{ nidCardFrontPicLink: nidCardFrontPicLink },
						{ nidCardBackPicLink: nidCardBackPicLink },
						{ nidCardFrontPicLink: nidCardBackPicLink },
						{ nidCardBackPicLink: nidCardFrontPicLink },
					],
				},
			});

			if (sameUser) {
				console.log("same user configuration found");
				let notificationDescription =
					"Another user is having the same credential configuration.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdUser = await prisma.user.create({
					data: {
						username: username,
						firstName: firstName,
						lastName: lastName,
						email: email,
						phoneNumber: phoneNumber,
						bankAccountNumber: bankAccountNumber,
						nidCardFrontPicLink: nidCardFrontPicLink,
						nidCardBackPicLink: nidCardBackPicLink,
						address: address,
						country: country,
						dateOfBirth: dateOfBirth,
						creationTime: new Date(),
						updationTime: new Date(),
					},
				});
				if (createdUser) {
					console.log("user created");
					let notificationDescription = "User was created successfully.";
					res.send(createdUser);
				} else {
					console.log("user not created");
					let notificationDescription = "User could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("User" + error.message);
			let notificationDescription =
				"User could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("User invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

usersRouter.put("/update", async (req, res) => {
	const { userId, newUser } = req.body;

	if (
		userId &&
		newUser.username &&
		newUser.firstName &&
		newUser.lastName &&
		newUser.email &&
		newUser.phoneNumber &&
		newUser.bankAccountNumber &&
		newUser.nidCardFrontPicLink &&
		newUser.nidCardBackPicLink &&
		newUser.address &&
		newUser.country &&
		newUser.dateOfBirth
	) {
		try {
			const conflictingUser = await prisma.user.findFirst({
				where: {
					OR: [
						{ username: newUser.username },
						{ email: newUser.email },
						{ nidCardFrontPicLink: newUser.nidCardFrontPicLink },
						{ nidCardBackPicLink: newUser.nidCardBackPicLink },
						{ nidCardFrontPicLink: newUser.nidCardBackPicLink },
						{ nidCardBackPicLink: newUser.nidCardFrontPicLink },
					],
				},
			});
			if (conflictingUser) {
				console.log("same user found with the updated title and application");
				let notificationDescription =
					"Same User exists where the configurations are as the updated User";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedUser = await prisma.user.update({
						where: {
							id: userId,
						},
						data: {
							username: newUser.username,
							firstName: newUser.firstName,
							lastName: newUser.lastName,
							email: newUser.email,
							phoneNumber: newUser.phoneNumber,
							bankAccountNumber: newUser.bankAccountNumber,
							nidCardFrontPicLink: newUser.nidCardFrontPicLink,
							nidCardBackPicLink: newUser.nidCardBackPicLink,
							address: newUser.address,
							country: newUser.country,
							dateOfBirth: newUser.dateOfBirth,
							updationTime: new Date(),
						},
					});
					if (updatedUser) {
						console.log("User updated");
						res.send(updatedUser);
					} else {
						console.log("User could not be updated");
						let notificationDescription =
							"Please try again after sometimes. User was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("User not found");
					let notificationDescription =
						"Please check if this User is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("User remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("User invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

usersRouter.delete("/delete", async (req, res) => {
	const { userId } = req.body;

	if (userId) {
		try {
			const deletedUser = await prisma.user.delete({
				where: {
					id: userId,
				},
			});
			console.log(deletedUser);
			res.send(deletedUser);
		} catch (error) {
			console.log("User could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("User invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = usersRouter;
