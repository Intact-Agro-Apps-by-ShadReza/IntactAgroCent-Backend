const { Router } = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");

const paymentRouter = Router();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live =
	process.env.SSLCOMMERZ_ACCOUNT_LIVENESS === "true" ? true : false;
const backend_action_base_url = "http://localhost:3000/payment";

paymentRouter.get("/", async (req, res) => {
	try {
		const {
			total_amount,
			currency,
			shipping_method,
			product_name,
			product_category,
			product_profile,
			cus_name,
			cus_email,
			cus_add1,
			cus_add2,
			cus_city,
			cus_state,
			cus_postcode,
			cus_country,
			cus_phone,
			cus_fax,
			ship_name,
			ship_add1,
			ship_add2,
			ship_city,
			ship_state,
			ship_postcode,
			ship_country,
		} = req.body;

		const data = {
			total_amount: 100,
			currency: "USD",
			tran_id: "REF123", // use unique tran_id for each api call
			success_url: `${backend_action_base_url}/success`,
			fail_url: `${backend_action_base_url}/fail`,
			cancel_url: `${backend_action_base_url}/cancel`,
			ipn_url: `${backend_action_base_url}/ipn`,
			shipping_method: "Courier",
			product_name: "Computer.",
			product_category: "Electronic",
			product_profile: "general",
			cus_name: "Customer Name",
			cus_email: "customer@example.com",
			cus_add1: "Dhaka",
			cus_add2: "Dhaka",
			cus_city: "Dhaka",
			cus_state: "Dhaka",
			cus_postcode: "1000",
			cus_country: "Bangladesh",
			cus_phone: "01711111111",
			cus_fax: "",
			ship_name: "Customer Name",
			ship_add1: "Dhaka",
			ship_add2: "Dhaka",
			ship_city: "Dhaka",
			ship_state: "Dhaka",
			ship_postcode: 1000,
			ship_country: "Bangladesh",
		};
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		sslcz.init(data).then((apiResponse) => {
			// Redirect the user to payment gateway
			let GatewayPageURL = apiResponse.GatewayPageURL;
			res.redirect(GatewayPageURL);
		});
	} catch {}
});

//sslcommerz validation

paymentRouter.get("/validate", (req, res) => {
	const data = {
		val_id: "ADGAHHGDAKJ456454", //that you go from sslcommerz response
	};
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	sslcz.validate(data).then((data) => {
		res.send(data);
		//process the response that got from sslcommerz
		// https://developer.sslcommerz.com/doc/v4/#order-validation-api
	});
});

//SSLCommerz initiateRefund

paymentRouter.get("/initiate-refund", (req, res) => {
	const data = {
		refund_amount: 10,
		refund_remarks: "",
		bank_tran_id: "CB5464321445456456",
		refe_id: "EASY5645415455",
	};
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	sslcz.initiateRefund(data).then((data) => {
		res.send(data);
		//process the response that got from sslcommerz
		//https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
	});
});

//SSLCommerz refundQuery

paymentRouter.get("/refund-query", (req, res) => {
	const data = {
		refund_ref_id: "SL4561445410",
	};
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	sslcz.refundQuery(data).then((data) => {
		res.send(data);
		//process the response that got from sslcommerz
		//https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
	});
});

//SSLCommerz transactionQueryByTransactionId
//you also use this as internal method
paymentRouter.get("/transaction-query-by-transaction-id", (req, res) => {
	const data = {
		tran_id: "AKHLAKJS5456454",
	};
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	sslcz.transactionQueryByTransactionId(data).then((data) => {
		res.send(data);
		//process the response that got from sslcommerz
		//https://developer.sslcommerz.com/doc/v4/#by-session-id
	});
});

//SSLCommerz transactionQueryBySessionId
//you also use this as internal method
paymentRouter.get("/transaction-query-by-session-id", (req, res) => {
	const data = {
		sessionkey: "AKHLAKJS5456454",
	};
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	sslcz.transactionQueryBySessionId(data).then((data) => {
		res.send(data);
		//process the response that got from sslcommerz
		//https://developer.sslcommerz.com/doc/v4/#by-session-id
	});
});

module.exports = paymentRouter;
