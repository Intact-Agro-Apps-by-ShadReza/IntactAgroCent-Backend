const { Router } = require("express");

const currencyRouter = Router();

const { PrismaClient } = require("@prisma/client");
const { default: axios } = require("axios");

const prisma = new PrismaClient();

currencyRouter.get("/", async (req, res) => {
	try {
		const currencies = await prisma.currency.findFirst();
		if (currencies) {
			const currentTime = new Date();
			if (currencies.expiredAt > currentTime) {
				res.send(currencies);
			} else {
				const currencyInfo = await axios.get(
					`${process.env.CURRENCY_EXCHANGE_URL}`,
					{
						params: {
							access_key: process.env.CURRENCY_EXCHANGE_ACCESS_KEY,
						},
					}
				);

				if (currencyInfo.data["success"]) {
					await prisma.currency
						.deleteMany()
						.then(async () => {
							const dbTTL = 24 * 60;
							const newCurrenciesinDB = await prisma.currency.create({
								data: {
									baseTime: new Date(),
									expirationTimeInMinutes: dbTTL,
									expiredAt: new Date(new Date().getTime() + dbTTL * 60000),
									baseCurrency: currencyInfo.data["base"],
									convertionRates: currencyInfo.data["rates"],
									creationTime: new Date(),
								},
							});
							if (newCurrenciesinDB) {
								res.send(newCurrenciesinDB);
							} else {
								console.log("failure 11");

								res.set({
									notificationTitle: "Network Error",
									notificationDescription:
										"Please check if your connection is stable. Please try again within some time.",
								});
								return res.status(500).end();
							}
						})
						.catch((error) => {
							console.log(error.message);
							res.set({
								notificationTitle: "Network Error",
								notificationDescription:
									"Please check if your connection is stable. Please try again within some time.",
							});
							return res.status(500).end();
						});
				} else {
					console.log("failure 12");
					res.set({
						notificationTitle: "Network Error",
						notificationDescription:
							"Please check if your connection is stable. Please try again within some time.",
					});
					return res.status(500).end();
				}
			}
		} else {
			const currencyInfo = await axios.get(
				`${process.env.CURRENCY_EXCHANGE_URL}`,
				{
					params: {
						access_key: process.env.CURRENCY_EXCHANGE_ACCESS_KEY,
					},
				}
			);

			if (currencyInfo) {
				// console.log('success 2')
				const dbTTL = 24 * 60;
				const newCurrenciesinDB = await prisma.currency.create({
					data: {
						baseTime: new Date(),
						expirationTimeInMinutes: dbTTL,
						expiredAt: new Date(new Date().getTime() + dbTTL * 60000),
						baseCurrency: currencyInfo.data.base,
						convertionRates: currencyInfo.data.rates,
						creationTime: new Date(),
					},
				});
				if (newCurrenciesinDB) {
					res.send(newCurrenciesinDB);
				} else {
					console.log("failure 21");
					res.set({
						notificationTitle: "Network Error",
						notificationDescription:
							"Please check if your connection is stable. Please try again within some time.",
					});
					return res.status(500).end();
				}
			} else {
				console.log("failure 22");
				res.set({
					notificationTitle: "Network Error",
					notificationDescription:
						"Please check if your connection is stable. Please try again within some time.",
				});
				return res.status(500).end();
			}
		}
	} catch (error) {
		console.log(error.message);
		res.set({
			notificationTitle: "Network Error",
			notificationDescription:
				"Please check if your connection is stable. Please try again within some time.",
		});
		return res.status(500).end();
	}
});

module.exports = currencyRouter;
