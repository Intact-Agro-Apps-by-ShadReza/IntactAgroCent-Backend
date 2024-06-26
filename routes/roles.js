const { Router } = require("express");

const roleRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

roleRouter.get("/", async (req, res) => {
	try {
		const roles = await prisma.role.findMany();
		res.send(roles);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please check if your connection is stable. Please try again within some time.";
		return res.status(500).end(notificationDescription);
	}
});

roleRouter.get("/rolename/:roleName", async (req, res) => {
	try {
		const roleNameFromUrl = req.params.roleName;
		if (roleNameFromUrl && roleNameFromUrl.length) {
			const role = await prisma.role.findFirst({
				where: {
					roleName: roleNameFromUrl,
				},
			});
			if (role) {
				res.send(role);
			} else {
				let notificationDescription =
					"No role found. Please make sure you are searching for the correct one.";
				return res.status(404).end(notificationDescription);
			}
		} else {
			let notificationDescription = "Role Name was not provided.";
			return res.status(500).end(notificationDescription);
		}
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please check if your connection is stable. Please try again within some time.";
		return res.status(500).end(notificationDescription);
	}
});

roleRouter.post("/create", async (req, res) => {
	const { roleName } = req.body;

	if (roleName) {
		try {
			const sameRole = await prisma.role.findFirst({
				where: {
					roleName: roleName,
				},
			});

			if (sameRole) {
				console.log("same role found");
				let notificationDescription = "Another role is having the same title.";
				return res.status(406).end(notificationDescription);
			} else {
				const createdRole = await prisma.role.create({
					data: {
						roleName: roleName,
						updationTime: new Date(),
						creationTime: new Date(),
					},
				});
				if (createdRole) {
					console.log("Role created");
					let notificationDescription = "Role was created successfully.";
					res.send(createdRole);
				} else {
					console.log("Role not created");
					let notificationDescription = "Role could not be created.";
					return res.status(406).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("Role" + error.message);
			let notificationDescription =
				"Role could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Role invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

roleRouter.put("/update", async (req, res) => {
	const { roleId, newRole } = req.body;

	if (roleId && newRole.roleName) {
		try {
			const conflictingRole = await prisma.role.findFirst({
				where: {
					roleName: newRole.title,
				},
			});
			if (conflictingRole) {
				console.log("same role found with the updated title");
				let notificationDescription =
					"Same role exists where the title is as the updated role";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const updatedRole = await prisma.role.update({
						where: {
							id: roleId,
						},
						data: {
							roleName: newRole.roleName,
							updationTime: new Date(),
						},
					});
					if (updatedRole) {
						console.log("Role updated");
						res.send(updatedRole);
					} else {
						console.log("Role could not be updated");
						let notificationDescription =
							"Please try again after sometimes. Role was not updated.";
						return res.status(500).end(notificationDescription);
					}
				} catch (error) {
					console.log("Role not found");
					let notificationDescription =
						"Please check if this Role is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("Role remains the same");
			let notificationDescription =
				"Please check if your connection is stable. Please try again within some time.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Role invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

roleRouter.post("/delete", async (req, res) => {
	const { roleId } = req.body;

	if (roleId) {
		try {
			const deletedRole = await prisma.role.delete({
				where: {
					id: roleId,
				},
			});
			console.log(deletedRole);
			res.send(deletedRole);
		} catch (error) {
			console.log("Role could not delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("Role invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = roleRouter;
