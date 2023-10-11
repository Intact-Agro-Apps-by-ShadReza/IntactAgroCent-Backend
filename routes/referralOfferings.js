const { Router } = require("express");

const referralOfferingsRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

referralOfferingsRouter.get("/", async (req, res) => {
	try {
		const referralOfferings = await prisma.referralOfferings.findMany();
		res.send(referralOfferings);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please check if your connection is stable. Please try again within some time.";
		return res.status(500).end(notificationDescription);
	}
});

referralOfferingsRouter.post("/create", async (req, res) => {
	const {
		referralName,
		rewardType,
		rewardAmount,
		rewardDescription,
		referralFromId,
	} = req.body;

	if (
		referralName &&
		rewardType &&
		rewardAmount &&
		rewardDescription &&
		referralFromId
	) {
		try {
			const sameReferralOffering = await prisma.referralOfferings.findFirst({
				where: {
					referralName: referralName,
					rewardType: rewardType,
					rewardAmount: rewardAmount,
					referralFromId: referralFromId,
				},
			});

			if (sameReferralOffering) {
				console.log("same Referral Offering found");
				let notificationDescription =
					"Another Referral Offering is having the same title and application.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdReferralOffering = await prisma.referralOfferings.create({
					data: {
						referralName: referralName,
						rewardType: rewardType,
						rewardAmount: rewardAmount,
						rewardDescription: rewardDescription,
						referralFromId: referralFromId,
						creationTime: new Date(),
						updationTime: new Date(),
					},
				});
				if (createdReferralOffering) {
					console.log("Referral Offering created");
					let notificationDescription =
						"Referral Offering was created successfully.";
					res.send(createdReferralOffering);
				} else {
					console.log("Referral Offering not created");
					let notificationDescription =
						"Referral Offering could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("Referral Offering" + error.message);
			let notificationDescription =
				"Referral Offering could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Referral Offering invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

referralOfferingsRouter.put("/update", async (req, res) => {
	const { referralOfferingId, newReferralOffering } = req.body;

	if (
		referralOfferingId &&
		newReferralOffering.referralName &&
		newReferralOffering.rewardType &&
		newReferralOffering.rewardAmount &&
		newReferralOffering.rewardDescription &&
		newReferralOffering.referralFromId
	) {
		try {
			const conflictingReferralOffering =
				await prisma.referralOfferings.findFirst({
					where: {
						referralName: newReferralOffering.referralName,
						rewardType: newReferralOffering.rewardType,
						rewardAmount: newReferralOffering.rewardAmount,
						referralFromId: newReferralOffering.referralFromId,
					},
				});
			if (conflictingReferralOffering) {
				console.log(
					"same Referral Offering found with the updated title and application"
				);
				let notificationDescription =
					"Same Referral Offering exists where the title and application is as the updated Referral Offering";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedReferralOffering = await prisma.referralOfferings.update(
						{
							where: {
								id: referralOfferingId,
							},
							data: {
								referralName: newReferralOffering.referralName,
								rewardType: newReferralOffering.rewardType,
								rewardAmount: newReferralOffering.rewardAmount,
								referralFromId: newReferralOffering.referralFromId,
								rewardDescription: newReferralOffering.rewardDescription,
								updationTime: new Date(),
							},
						}
					);
					if (updatedReferralOffering) {
						console.log("Referral Offering updated");
						res.send(updatedReferralOffering);
					} else {
						console.log("Referral Offering could not be updated");
						let notificationDescription =
							"Please try again after sometimes. Referral Offering was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("Referral Offering not found");
					let notificationDescription =
						"Please check if this Referral Offering is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("Referral Offering remains the same");
			let notificationDescription =
				"Please check if your connection is stable. Please try again within some time.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Referral Offering invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

referralOfferingsRouter.delete("/delete", async (req, res) => {
	const { referralOfferingId } = req.body;

	if (referralOfferingId) {
		try {
			const deletedReferralOffering = await prisma.referralOfferings.delete({
				where: {
					id: referralOfferingId,
				},
			});
			console.log(deletedReferralOffering);
			res.send(deletedReferralOffering);
		} catch (error) {
			console.log("Referral Offering could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Referral Offering invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = referralOfferingsRouter;
