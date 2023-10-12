const { Router } = require("express");

const adminPanelRouter = Router();

const { PrismaClient } = require("@prisma/client");
const { filterTheItems } = require("../utils/filterTheItems");
const prisma = new PrismaClient();

adminPanelRouter.get("/", async (req, res) => {
	let startingItemIndex = 0;
	let normalGivingCount = 6;
	let searchables = "";

	try {
		let queryStartingPageNumber = req.query.startingPageNumber;
		let queryPerPageCount = req.query.perPageCount;
		let querySearchables = req.query.searchables;

		let startingPageNumber = 1;
		let perPageCount = 6;

		if (
			queryStartingPageNumber &&
			parseInt(queryStartingPageNumber.toString())
		) {
			startingPageNumber = parseInt(queryStartingPageNumber.toString());
		}

		if (queryPerPageCount && parseInt(queryPerPageCount.toString())) {
			perPageCount = parseInt(queryPerPageCount.toString());
		}

		if (querySearchables) {
			searchables = querySearchables.toString();
		}

		if (startingPageNumber && perPageCount) {
			if (perPageCount < 1) {
				perPageCount = normalGivingCount;
			}
			if (startingPageNumber < 1) {
				startingPageNumber = 1;
			}
			startingItemIndex = (startingPageNumber - 1) * perPageCount;
			normalGivingCount = perPageCount;
		} else {
			startingItemIndex = 0;
			normalGivingCount = 6;
		}
	} catch {
		startingItemIndex = 0;
		normalGivingCount = 6;
	} finally {
		try {
			const adminPanelsCount = await prisma.adminPanel.count();
			if (adminPanelsCount < 1) {
				let notificationDescription =
					"Currently there are no admin member enlisted.";
				return res.status(404).end(notificationDescription);
			} else {
				if (normalGivingCount >= adminPanelsCount) {
					normalGivingCount = adminPanelsCount;
					startingItemIndex = 0;
				} else {
					if (normalGivingCount < 1) {
						normalGivingCount = 1;
					}
					if (startingItemIndex >= adminPanelsCount) {
						startingItemIndex = adminPanelsCount - 1;
					} else if (startingItemIndex < 0) {
						startingItemIndex = 0;
					}
				}
				let adminPanels = [];
				try {
					let filter = "";
					const queryFilter = req.query.filter;
					if (queryFilter && queryFilter.toString()) {
						filter = queryFilter.toString();
					}
					if (filter === "sort-by-created-asc") {
						adminPanels = await prisma.adminPanel.findMany({
							orderBy: {
								creationTime: "asc",
							},
						});
					} else if (filter === "sort-by-created-desc") {
						adminPanels = await prisma.adminPanel.findMany({
							orderBy: {
								creationTime: "desc",
							},
						});
					} else {
						adminPanels = await prisma.adminPanel.findMany();
					}

					const fieldForSearching = "";

					await filterTheItems(
						startingItemIndex,
						normalGivingCount,
						adminPanelsCount,
						adminPanels,
						fieldForSearching,
						searchables
					).then((response) => {
						res.send({
							totalAdminMemberCount: response[1],
							filteredAdminMembers: response[0],
							totalAllInAllAdminMembersCount: adminPanelsCount,
						});
					});
				} catch (error) {
					console.log(error.message);
					let notificationDescription =
						"There were some issues connecting with the server. Please try again after sometimes.";
					return res.status(500).end(notificationDescription);
				}
			}
		} catch {
			let notificationDescription =
				"There were some issues connecting with the server. Please try again after sometimes.";
			return res.status(500).end(notificationDescription);
		}
	}
});

adminPanelRouter.get("/user-mail", async (req, res) => {
	try {
		const { adminMembersIds } = req.query;
		if (adminMembersIds) {
			try {
				const adminMemberInDetailsMail = await prisma.registeredMail.findFirst({
					where: {
						id: adminMembersIds.toString(),
					},
				});
				if (adminMemberInDetailsMail) {
					res.send(adminMemberInDetailsMail.email);
				} else {
					let notificationDescription =
						"Invalid Member Id. No such email found for the member.";
					return res.status(404).end(notificationDescription);
				}
			} catch (error) {
				console.log("admin panel member could not delete");
				let notificationDescription =
					"Please check the credentials passed for the deletion.";
				return res.status(500).end(notificationDescription);
			}
		} else {
			console.log("admin panel member invalid params");
			let notificationDescription =
				"Please provide correct id for the request.";
			return res.status(400).end(notificationDescription);
		}
	} catch (error) {
		console.log("admin panel member invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

adminPanelRouter.get("/details", async (req, res) => {
	try {
		const { adminMembersIds, rolesIds } = req.query;
		if (adminMembersIds && rolesIds) {
			const adminMembersIdsString = Array.isArray(adminMembersIds)
				? adminMembersIds.join(",")
				: adminMembersIds;

			const rolesIdsString = Array.isArray(rolesIds)
				? rolesIds.join(",")
				: rolesIds;

			// @ts-ignore
			const parsedAdminMembersIds = JSON.parse(adminMembersIdsString);
			// @ts-ignore
			const parsedRolesIds = JSON.parse(rolesIdsString);

			if (!Array.isArray(parsedAdminMembersIds)) {
				console.log("Invalid admin members ids parameter.");
				let notificationDescription = "Invalid admin members ids parameter.";
				return res.status(500).end(notificationDescription);
			}
			if (!Array.isArray(parsedRolesIds)) {
				console.log("Invalid roles ids parameter.");
				let notificationDescription = "Invalid roles ids parameter.";
				return res.status(500).end(notificationDescription);
			}

			try {
				const adminMembersInDetailsMails = await prisma.registeredMail.findMany(
					{
						where: {
							id: {
								in: parsedAdminMembersIds,
							},
						},
					}
				);
				const adminMembersInDetailsRoles = await prisma.role.findMany({
					where: {
						id: {
							in: parsedRolesIds,
						},
					},
				});
				res.send({
					adminMembersMails: adminMembersInDetailsMails,
					adminMembersRoles: adminMembersInDetailsRoles,
				});
			} catch (error) {
				console.log("admin panel member could not delete");
				let notificationDescription =
					"Please check the credentials passed for the deletion.";
				return res.status(500).end(notificationDescription);
			}
		} else {
			console.log("admin panel member invalid params");
			let notificationDescription =
				"Please provide correct id for the request.";
			return res.status(400).end(notificationDescription);
		}
	} catch (error) {
		console.log("admin panel member invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

adminPanelRouter.get("/userIds", async (req, res) => {
	try {
		const userFromRegisteredMail = await prisma.registeredMail.findMany();
		const userIdsFromRegisteredMail = userFromRegisteredMail.map((userId) => {
			const newUser = {
				id: userId.id,
				email: userId.email,
			};
			return newUser;
		});

		const userIdsFromAdminPanel = await prisma.adminPanel.findMany();
		const userIdsThatAreAlreadyInAdminPanel = userIdsFromAdminPanel.map(
			(userId) => userId.userId
		);

		const userIdsNotInAdminPanel = userIdsFromRegisteredMail.filter(
			(value) => !userIdsThatAreAlreadyInAdminPanel.includes(value.id)
		);

		if (userIdsNotInAdminPanel && userIdsNotInAdminPanel.length) {
			res.send(userIdsNotInAdminPanel);
		} else {
			let notificationDescription =
				"No User Ids Found! Admin Attention required.";
			res.status(404).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

adminPanelRouter.get("/roleIds", async (req, res) => {
	try {
		const roles = await prisma.role.findMany({
			where: {
				roleName: "admin",
			},
		});
		const roleIds = roles.map((roleId) => {
			const newRole = {
				id: roleId.id,
				roleName: roleId.roleName,
			};
			return newRole;
		});

		if (roleIds && roleIds.length) {
			res.send(roleIds);
		} else {
			let notificationDescription =
				"No Role Ids Found! Admin Attention required.";
			res.status(404).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

adminPanelRouter.get("/verify/:userId", async (req, res) => {
	const userId = req.params.userId;
	try {
		const adminPanelMember = await prisma.adminPanel.findFirst({
			where: {
				userId: userId,
			},
		});
		const adminRole = await prisma.role.findFirst({
			where: {
				roleName: "admin",
			},
		});
		if (
			adminPanelMember &&
			adminPanelMember.userId === userId &&
			adminPanelMember.roleId === adminRole?.id
		) {
			let notificationDescription = "Admin Access Granted !";
			res.status(200).end(notificationDescription);
		} else {
			let notificationDescription = "Unautorized Access !";
			res.status(404).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"There were some issues connecting with the server. Please try again after sometimes.";
		return res.status(500).end(notificationDescription);
	}
});

adminPanelRouter.post("/create", async (req, res) => {
	const { userId, roleId } = req.body;

	if (userId && roleId) {
		try {
			const sameAdminPanelMember = await prisma.adminPanel.findFirst({
				where: {
					userId: userId,
				},
			});

			if (sameAdminPanelMember) {
				console.log("same admin panel member found");
				let notificationDescription =
					"Another admin panel member is already with another duty.";
				return res.status(406).end(notificationDescription);
			} else {
				const userIdAvailableInRegisteredMail =
					await prisma.registeredMail.findFirst({
						where: {
							id: userId,
						},
					});

				const roleIdAvailable = await prisma.role.findFirst({
					where: {
						id: roleId,
					},
				});

				if (userIdAvailableInRegisteredMail && roleIdAvailable) {
					const createdAdminPanelMember = await prisma.adminPanel.create({
						data: {
							userId: userId,
							roleId: roleId,
							creationTime: new Date(),
							updationTime: new Date(),
						},
					});
					if (createdAdminPanelMember) {
						console.log("admin panel member created");
						let notificationDescription =
							"Admin panel member was created successfully.";
						res.send(createdAdminPanelMember);
					} else {
						console.log("admin panel member not created");
						let notificationDescription =
							"Admin panel member could not be created.";
						return res.status(406).end(notificationDescription);
					}
				} else {
					console.log("invalid ids");
					let notificationDescription =
						"Provided Ids are not valid. Please try again with valid ones.";
					return res.status(500).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("admin panel member" + error.message);
			let notificationDescription =
				"admin panel member could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("admin panel member invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

adminPanelRouter.put("/update", async (req, res) => {
	const { adminPanelId, newAdminPanel } = req.body;

	if (
		adminPanelId &&
		newAdminPanel &&
		newAdminPanel.userId &&
		newAdminPanel.roleId
	) {
		try {
			const conflictingAdminPanel = await prisma.adminPanel.findFirst({
				where: {
					userId: newAdminPanel.userId,
					roleId: newAdminPanel.roleId,
				},
			});
			if (conflictingAdminPanel) {
				console.log("same admin panel member found with the updated role");
				let notificationDescription =
					"Same admin panel member exists where the roles is as the updated admin panel member";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const member = await prisma.adminPanel.findFirst({
						where: {
							userId: newAdminPanel.userId,
						},
					});
					const memberId = member ? member.id : "";
					const updatedAdminPanel = await prisma.adminPanel.update({
						where: {
							id: memberId,
						},
						data: {
							roleId: newAdminPanel.roleId,
							updationTime: new Date(),
						},
					});
					if (updatedAdminPanel) {
						console.log("admin panel updated");
						res.send(updatedAdminPanel);
					} else {
						console.log("admin panel member could not be updated");
						let notificationDescription =
							"Please try again after sometimes. Admin Panel was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("admin panel member not found");
					let notificationDescription =
						"Please check if this admin panel is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("admin panel member remains the same");
			let notificationDescription =
				"Please check if your connection is stable. Please try again within some time.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("admin panel member invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

adminPanelRouter.post("/delete", async (req, res) => {
	const { adminPanelId } = req.body;
	if (adminPanelId) {
		try {
			const adminMembersInDetails = await prisma.adminPanel.delete({
				where: {
					id: adminPanelId,
				},
			});
			console.log("Member Deleted From Admin", adminMembersInDetails);
			res.send(adminMembersInDetails);
		} catch (error) {
			console.log("admin panel member could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("admin panel member invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = adminPanelRouter;
