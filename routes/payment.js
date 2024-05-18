require("dotenv").config();
const crypto = require("crypto");
const { Router } = require('express');
const router = Router();
const fetchUser = require('../middelware/finduser.js');
const dbconnection = require("../db.js");
const Razorpay = require("razorpay");
const db = dbconnection();
const instance = new Razorpay({
    key_id: 'rzp_test_IPlBJJm3ECVvDc',
    key_secret: 'ckgZ7bYa7Ghwl9XZGSiCs4Wv',
});
//1 Online payment routes;
router.post("/orders", async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_order_74394",
        };
        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error occured");
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});
router.post("/success", async (req, res) => {
    try {
        // getting the details back from our font-end
        const { data, products, userid, admin_id ,address} = req.body;
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = data;
        const shasum = crypto.createHmac("sha256", "ckgZ7bYa7Ghwl9XZGSiCs4Wv");
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });
        let datetime = new Date().toLocaleString();
        datetime = datetime.split(',');
        const sql1 = `insert into Orders(
                order_id,
                payment_id,
                payment_mode,
                Date,
                Time,
                order_status,
                userid,
                admin_id,
                Quantity,
                payment_status,
                address
            ) values(
                "${razorpayOrderId}",
                "${razorpayPaymentId}",
                "Online",
                "${datetime[0]}",
                "${datetime[1]}",
                "Processing",
                ${userid},
                ${admin_id},
                ${products.length},
                "Success",
                "${address}"
            )`;
        db.query(sql1, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error });
            } else {
                products.map((item => {
                    const sqlnew = `insert into order_details(
                            order_id,
                            item_id,
                            Quantity
                        ) values(
                            "${razorpayOrderId}",
                            ${item.item_id},
                            ${item.Quantity}
                        )`;
                    db.query(sqlnew, (error, result) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({ error });
                        } else {
                            const sql2 = `delete from cart where userid=${userid} and item_id=${item.item_id}`;
                            db.query(sql2, (error, result) => {
                                if (error) {
                                    console.log(error);
                                    return res.status(500).json({ error });
                                } else {
                                    const sql3 = `update products set 
                                    Quantity=${item.actualQuantity - item.Quantity} 
                                    where item_id=${item.item_id}`;
                                    const sql4 = `update products set 
                                    Quantity=${item.actualQuantity - item.Quantity},
                                    availability="false" 
                                    where item_id=${item.item_id}`;
                                    const sql = item.actualQuantity - item.Quantity == 0 ? sql4 : sql3;
                                    db.query(sql, (err, result) => {
                                        if (error) {
                                            console.log(error);
                                            return res.status(500).json({ error });
                                        } else {
                                            return res.json({
                                                msg: "success",
                                                orderId: razorpayOrderId,
                                                paymentId: razorpayPaymentId,
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })

                }))
            }
        })


    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
// cash on delivery route
router.post("/cod", (req, res) => {
    try {
        const { products, userid, admin_id ,address} = req.body;
        const order = "order_" + Date.now();
        let datetime = new Date().toLocaleString();
        datetime = datetime.split(',');
        const sql1 = `insert into Orders(
            order_id,
            payment_id,
            payment_mode,
            Date,
            Time,
            order_status,
            userid,
            admin_id,
            Quantity,
            payment_status,
            address
        )values(
            "${order}",
            null,
            "COD",
            "${datetime[0]}",
            "${datetime[1]}",
            "Processing",
            ${userid},
            ${admin_id},
            ${products.length},
            "Pending",
            "${address}"
        )`;
        db.query(sql1, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error });
            } else {
                products.map((item => {
                    const sqlnew = `insert into order_details(
                        order_id,
                        item_id,
                        Quantity
                    ) values(
                        "${order}",
                        ${item.item_id},
                        ${item.Quantity}
                    )`;
                    db.query(sqlnew, (error, result) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({ error });
                        } else {
                            const sql2 = `delete from cart where userid=${userid} and item_id=${item.item_id}`;
                            db.query(sql2, (error, result) => {
                                if (error) {
                                    console.log(error);
                                    return res.status(500).json({ error });
                                } else {
                                    const sql3 = `update products 
                                    set Quantity=${item.actualQuantity - item.Quantity} 
                                    where item_id=${item.item_id}`;
                                    const sql4 = `update products 
                                    set Quantity=${item.actualQuantity - item.Quantity},
                                    availability="false" 
                                    where item_id=${item.item_id}`;
                                    const sql = item.actualQuantity - item.Quantity == 0 ? sql4 : sql3;
                                    db.query(sql, (err, result) => {
                                        if (error) {
                                            console.log(error);
                                            return res.status(500).json({ error });
                                        } else {
                                            return res.json({
                                                msg: "success",
                                                orderId: order,
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })

                }))
            }
        })

    } catch (error) {
        console.log(error);
        res.json({ status: 400 });
    }
})

module.exports = router;