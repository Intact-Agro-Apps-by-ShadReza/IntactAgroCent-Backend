const { Router } = require("express");

const featuredProjectsRouter = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

featuredProjectsRouter.get("/", async (req, res) => {
	try {
		const featuredProjects = await prisma.featuredProjects.findMany();
		res.send(featuredProjects);
	} catch (error) {
		console.log(error.message);
		let notificationDescription =
			"Please check if your connection is stable. Please try again within some time.";
		return res.status(500).end(notificationDescription);
	}
});

featuredProjectsRouter.post("/create", async (req, res) => {
	const { featuredProjectsCount, projectsIdList } = req.body;

	if (featuredProjectsCount && projectsIdList && projectsIdList.length > 0) {
		try {
			const createdFeaturedProjects = await prisma.featuredProjects.create({
				data: {
					featuredProjectsCount: featuredProjectsCount,
					projectsIdList: projectsIdList,
					creationTime: new Date(),
					updationTime: new Date(),
				},
			});
			if (createdFeaturedProjects) {
				console.log("featured project created");
				let notificationDescription =
					"Featured Project was created successfully.";
				res.send(notificationDescription);
			} else {
				console.log("Featured Project not created");
				let notificationDescription = "Featured Project could not be created.";
				return res.status(406).end(notificationDescription);
			}
		} catch (error) {
			console.log("featured projects " + error.message);
			let notificationDescription =
				"featured projects could not be created. Please try again after some times.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("featured projects invalid params");
		let notificationDescription =
			"Please provide all the parameters correctly.";
		return res.status(400).end(notificationDescription);
	}
});

featuredProjectsRouter.put("/update", async (req, res) => {
	const { newFeaturedProject } = req.body;

	if (
		newFeaturedProject.featuredProjectsCount &&
		newFeaturedProject.projectsIdList
	) {
		try {
			const conflictingFeaturedProjects =
				await prisma.featuredProjects.findFirst({
					where: {
						featuredProjectsCount: newFeaturedProject.featuredProjectsCount,
						projectsIdList: newFeaturedProject.projectsIdList,
					},
				});
			if (conflictingFeaturedProjects) {
				console.log(
					"same featured projects found with the updated count and lists"
				);
				let notificationDescription =
					"Same Featured Project exists where the count and the lists are as the updated Featured Project";
				return res.status(403).end(notificationDescription);
			} else {
				try {
					const featuredProject = await prisma.featuredProjects.findFirst();
					if (featuredProject && featuredProject.id) {
						const featuredProjectId = featuredProject.id;
						const updatedFeaturedProjects =
							await prisma.featuredProjects.update({
								where: {
									id: featuredProjectId,
								},
								data: {
									featuredProjectsCount:
										newFeaturedProject.featuredProjectsCount,
									projectsIdList: newFeaturedProject.projectsIdList,
								},
							});
						if (updatedFeaturedProjects) {
							console.log("featured projects updated");
							res.send(updatedFeaturedProjects);
						} else {
							console.log("featured projects could not be updated");
							let notificationDescription =
								"Please try again after sometimes. Featured projects was not updated.";
							return res.status(500).end(notificationDescription);
						}
					} else {
						const createdFeaturedProjects =
							await prisma.featuredProjects.create({
								data: {
									featuredProjectsCount:
										newFeaturedProject.featuredProjectsCount,
									projectsIdList: newFeaturedProject.projectsIdList,
									creationTime: new Date(),
									updationTime: new Date(),
								},
							});
						if (createdFeaturedProjects) {
							console.log("featured project created");
							let notificationDescription =
								"Featured Project was created successfully.";
							res.send(notificationDescription);
						} else {
							console.log("Featured Project not created");
							let notificationDescription =
								"Featured Project could not be created.";
							return res.status(406).end(notificationDescription);
						}
					}
				} catch (error) {
					console.log("featured projects not found");
					let notificationDescription =
						"Please check if this featured projects is there or not.";
					return res.status(403).end(notificationDescription);
				}
			}
		} catch (error) {
			console.log("featured projects remains the same");
			let notificationDescription =
				"Please check if your connection is stable. Please try again within some time.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("featured projects invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

featuredProjectsRouter.delete("/delete", async (req, res) => {
	const { featureProjectId } = req.body;
	if (featureProjectId) {
		try {
			const deletedFeaturedProject = await prisma.featuredProjects.delete({
				where: {
					id: featureProjectId,
				},
			});
			console.log(deletedFeaturedProject);
			res.send(deletedFeaturedProject);
		} catch (error) {
			console.log("featured projects could not be delete");
			let notificationDescription =
				"Please check the credentials passed for the deletion.";
			return res.status(500).end(notificationDescription);
		}
	} else {
		console.log("featured projects invalid params");
		let notificationDescription = "Please provide correct id for the request.";
		return res.status(400).end(notificationDescription);
	}
});

module.exports = featuredProjectsRouter;
