const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const bodyParser = require("body-parser");
const projectRouter = require("./routes/projects.js");
const imageRouter = require("./routes/images.js");
const tagRouter = require("./routes/tags.js");
const currencyRouter = require("./routes/currency.js");
const featuredProjectsRouter = require("./routes/featuredProjects.js");
const roleRouter = require("./routes/roles.js");
const transactionCodesRouter = require("./routes/transactionCodes.js");
const adminPanelRouter = require("./routes/adminPanel.js");
const notificationShaderRouter = require("./routes/notificationShader.js");
const transactionMessagesRouter = require("./routes/transactionMessages.js");
const withdrawlRequestsRouter = require("./routes/withdrawlRequests.js");
const referralOfferingsRouter = require("./routes/referralOfferings.js");
const transactionRouter = require("./routes/transaction.js");
const balanceRouter = require("./routes/balance.js");
const paymentRouter = require("./routes/payment.js");
const websiteInformationRouter = require("./routes/websiteInformation.js");
const mailVerificationsRouter = require("./routes/mailVerifications.js");
const registeredMailsRouter = require("./routes/registeredMails.js");
const storeBalanceRouter = require("./routes/storeBalance.js");

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	cors({
		origin: "*",
	})
);

app.use("/admin-panel", adminPanelRouter);
app.use("/auth", authRouter);
app.use("/balances", balanceRouter);
app.use("/currencies", currencyRouter);
app.use("/featured-projects", featuredProjectsRouter);
app.use("/images", imageRouter);
app.use("/mail-verifications", mailVerificationsRouter);
app.use("/notification-shaders", notificationShaderRouter);
app.use("/payment", paymentRouter);
app.use("/projects", projectRouter);
app.use("/referral-offerings", referralOfferingsRouter);
app.use("/registered-mails", registeredMailsRouter);
app.use("/roles", roleRouter);
app.use("/store-balance", storeBalanceRouter);
app.use("/tags", tagRouter);
app.use("/transactions", transactionRouter);
app.use("/transaction-codes", transactionCodesRouter);
app.use("/transaction-messages", transactionMessagesRouter);
app.use("/users", userRouter);
app.use("/website-information", websiteInformationRouter);
app.use("/withdrawl-requests", withdrawlRequestsRouter);

app.get("/", (req, res) => {
	res.send("Assalamu Alaikum from dev Shad Reza.");
});

app.listen(process.env.PORT || 3000);
