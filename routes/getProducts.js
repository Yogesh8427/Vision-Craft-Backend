const { Router } = require('express');
const router = Router();
const dbconnection = require("../db.js");
const db = dbconnection();

//get all producets from the database
router.get("/getitems", (req, res) => {
    try {
        const sql = `select * from products `;
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.json({ err }).status(400);
            } else {
                res.json({ products: result }).status(200);
            }
        })
    } catch (error) {
        console.log(error)
    }
});
//get a particular prduct catagory
router.get("/get", (req, res) => {
    try {
        const sql = `select * from products where category="${req.query.category}" `;
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                res.json({ err }).status(400);
            } else {
                res.json({ products: result }).status(200);
            }
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;