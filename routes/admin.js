const { Router } = require('express');
const router = Router();
const actualpath = require('path')
const fetchUser = require('../middelware/finduser.js');
const dbconnection = require("../db.js");
const db = dbconnection();
const fs = require('fs');

//addding a producet to data base;
router.post('/additem', fetchUser, (req, res) => {
   try {
      const sql1 = `select * from users where userId=${req.user}`;
      db.query(sql1, (err, result) => {
         if (err) {
            console.log(err);
            return res.status(500).json({ err });
         } else {
            if (result[0].role == 'admin') {
               const file = req.files.file;
               const { brand, model, price, Quantity, size, category } = JSON.parse(req.body.data);
               const path = actualpath.join(__dirname, '../') + '/image/' + file.name;
               file.mv(path, (err) => {
                  if (err)
                     return res.status(500).send(err);
                  const item_id = Date.now();
                  const sql = `insert into products (admin_id,item_id,brand,model,Price,image,Quantity,size,category,availability) 
                  values (${req.user},${item_id},"${brand}","${model}",${price},
                  "http://localhost:4000/image/${file.name}",${Quantity},${size},"${category}","true")`;
                  db.query(sql, (err, result) => {
                     if (err) {
                        console.log(err);
                        return res.status(500).json({ err });
                     } else {
                        res.json({ status: 200, message: 'Product add  successfully' });
                     }
                  })
               });
            } else {
               return res.status(401).json({ error: "you not have a admin access" });
            }
         }
      })
   } catch (error) {
      res.json({ error: error }).status(401);
   }
})
//get all your listed products
router.get('/yourproducts', fetchUser, (req, res) => {
   try {
      const sql = `select * from products where admin_id=${req.user}`;
      db.query(sql, (err, result) => {
         if (err) {
            return res.status(500).send(err);
         } else {
            return res.json({ data: result, status: 200 }).status(200);
         }

      })
   } catch (error) {
      res.json({ error: error }).status(401);
   }
})
//by this route you can delete your product 
router.post('/deleteitem', fetchUser, (req, res) => {
   try {
      const { item_id, image } = req.body;
      const sql1 = `delete from products where admin_id = ${req.user} and item_id=${item_id}`;
      db.query(sql1, (err, results) => {
         if (err) {
            console.log(err);
            return res.status(500).json({ err });
         } else {
            const sql2 = `delete from cart where item_id=${item_id}`;
            db.query(sql2, (err, results) => {
               if (err) {
                  console.log(err);
                  return res.status(500).json({ err });
               }
            })
            fs.unlinkSync(actualpath.join(__dirname, '../') + `/image${image.split("http://localhost:4000/image")[1]}`);
            return res.json({ status: 200, message: "Remove successfully" });
         }
      })
   } catch (error) {
      console.log("error", error);
      res.json({ status: 400 });
   }
})
//update product item 
router.post('/availabeitem', fetchUser, (req, res) => {
   try {
      const { availability, item_id } = req.body;
      const sql = `UPDATE products SET  availability="${availability}" 
      WHERE admin_id=${req.user} and item_id=${item_id};`
      const sql2 = `UPDATE cart SET  availability="${availability}",isSlected="false" 
      WHERE item_id=${item_id};`
      db.query(sql, (err, result) => {
         if (err) {
            console.log(err);
            return res.status(500).json({ err });
         } else {
            db.query(sql2, (err) => {
               if (err) {
                  console.log(err);
                  return res.status(500).json({ err });
               } else {
                  res.json({ status: 200, message: 'Data Updated successfully' });
               }
            })
         }
      })
   } catch (error) {
      res.json({ error: error }).status(401);
   }
})
//update product item details
router.post("/updatedetails", fetchUser, (req, res) => {
   try {
      const sql1 = `select * from users where userId=${req.user}`;
      db.query(sql1, (err, result) => {
         if (err) {
            console.log(err);
            return res.status(500).json({ err });
         } else {
            if (result[0].role == 'admin') {
               const file = req.files?.file;
               const { brand, model, price, Quantity, size, category, availability, item_id, admin_id, image } = JSON.parse(req.body.data);
               const path = actualpath.join(__dirname, '../') + '/image/' + file?.name;
               const imageurl = file ? `http://localhost:4000/image/${file.name}` : image;
               file?.mv(path, (err) => {
                  if (err)
                     return res.status(500).send(err);
               });
               const sql = `update products set 
               brand="${brand}",
               model="${model}",
               Price=${price},
               image="${imageurl}",
               Quantity=${Quantity},
               size=${size},
               category="${category}",
               availability="${availability}"
               where admin_id=${admin_id} and item_id=${item_id} `
               db.query(sql, (err, result) => {
                  if (err) {
                     console.log(err);
                     return res.status(500).json({ err });
                  } else {
                     const sql2 = `update cart set
                      brand="${brand}",
                      model="${model}",
                      price=${price},
                      image="${imageurl}",
                      actualQuantity=${Quantity},
                      size=${size},
                      category="${category}",
                      availability="${availability}"`
                     db.query(sql2, (err, result) => {
                        if (err) {
                           console.log(err);
                           return res.status(500).json({ err });
                        } else {
                           file ? fs.unlinkSync(actualpath.join(__dirname, '../') + `/image${image.split("http://localhost:4000/image")[1]}`) : null;
                           res.json({ status: 200, message: 'Product details updated successfully' });
                        }
                     })
                  }
               })
            } else {
               return res.status(401).json({ error: "you not have a admin access" });
            }
         }
      })
   } catch (error) {
      res.json({ error: error }).status(401);
   }
})
module.exports = router;