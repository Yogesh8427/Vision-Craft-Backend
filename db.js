const mysql = require('mysql2');
const connection=()=>{
    try {
        const connection=mysql.createConnection({
            host:"localhost",
            user:"root",
            password: "1234",
            database : 'visioncraft'  
        });
        return connection;
    } catch (error) {
        console.log("there is an error to connect with database",error);
    }
}

module.exports=connection;