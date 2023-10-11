const { Router } = require("express");

const websiteInformationRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

websiteInformationRouter.get("/", async (req, res) => {
	try {
		const websiteInformation = await prisma.websiteInformation.findMany();
		res.send(websiteInformation);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please try again after sometimes. There seems to be some issue with the network connection.";
		return res.status(500).end(notificationDescription);
	}
});

websiteInformationRouter.post("/create", async (req, res) => {
	const {
		websiteName,
		bigLogoLink,
		smallLogoLink,
		privacyPolicyLink,
		termsAndConditionLink,
	} = req.body;

	if (
		websiteName &&
		bigLogoLink &&
		smallLogoLink &&
		privacyPolicyLink &&
		termsAndConditionLink
	) {
		try {
			const alreadyAnInfoAvailable =
				await prisma.websiteInformation.findFirst();

			if (alreadyAnInfoAvailable) {
				console.log("another web info found");
				let notificationDescription =
					"Another website information is already there.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdWebInfo = await prisma.websiteInformation.create({
					data: {
						websiteName: websiteName,
						bigLogoLink: bigLogoLink,
						smallLogoLink: smallLogoLink,
						privacyPolicyLink: privacyPolicyLink,
						termsAndConditionLink: termsAndConditionLink,
						updationTime: new Date(),
						creationTime: new Date(),
					},
				});
				if (createdWebInfo) {
					console.log("Web Info created");
					let notificationDescription = "Web Info was created successfully.";
					res.send(createdWebInfo);
				} else {
					console.log("Web Info not created");
					let notificationDescription = "Web Info could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("Web Info" + error.message);
			let notificationDescription =
				"Web Info could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Web Info invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

websiteInformationRouter.put("/update", async (req, res) => {
	const { webInfoId, newWebInfo } = req.body;

	if (
		webInfoId &&
		newWebInfo.websiteName &&
		newWebInfo.bigLogoLink &&
		newWebInfo.smallLogoLink &&
		newWebInfo.privacyPolicyLink &&
		newWebInfo.termsAndConditionLink
	) {
		try {
			const sameConfiguredWebInfo = await prisma.websiteInformation.findFirst({
				where: {
					websiteName: newWebInfo.websiteName,
					bigLogoLink: newWebInfo.bigLogoLink,
					smallLogoLink: newWebInfo.smallLogoLink,
					privacyPolicyLink: newWebInfo.privacyPolicyLink,
					termsAndConditionLink: newWebInfo.termsAndConditionLink,
				},
			});
			if (sameConfiguredWebInfo) {
				console.log("same WebInfo found with the updated configuration");
				let notificationDescription =
					"Same WebInfo exists where the configuration is as the updated WebInfo";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedWebInfo = await prisma.websiteInformation.update({
						where: {
							id: webInfoId,
						},
						data: {
							websiteName: newWebInfo.websiteName,
							bigLogoLink: newWebInfo.bigLogoLink,
							smallLogoLink: newWebInfo.smallLogoLink,
							privacyPolicyLink: newWebInfo.privacyPolicyLink,
							termsAndConditionLink: newWebInfo.termsAndConditionLink,
							updationTime: new Date(),
						},
					});
					if (updatedWebInfo) {
						console.log("WebInfo updated");
						res.send(updatedWebInfo);
					} else {
						console.log("WebInfo could not be updated");
						let notificationDescription =
							"Please try again after sometimes. WebInfo was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("WebInfo not found");
					let notificationDescription =
						"Please check if this WebInfo is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("WebInfo remains the same");
			let notificationDescription =
				"Please try again after sometimes. There seems to be some issue with the network connection.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("WebInfo invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

websiteInformationRouter.post("/delete", async (req, res) => {
	const { webInfoId } = req.body;

	if (webInfoId) {
		try {
			const deletedWebInfo = await prisma.websiteInformation.delete({
				where: {
					id: webInfoId,
				},
			});
			console.log(deletedWebInfo);
			res.send(deletedWebInfo);
		} catch (error) {
			console.log("WebInfo could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("WebInfo invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = websiteInformationRouter;
