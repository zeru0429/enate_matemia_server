import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2'

//constants
const port = 8190;
const ip = '192.168.1.11';

// Set up a MySQL database connection pool
const connection = mysql.createConnection({
  ////Free MySQL Hosting
  // host: 'sql7.freemysqlhosting.net',
  // port: '3306',
  // user: "sql7636185",
  // password: "RPJ7CEKBk8",
  // database: "sql7636185",

 // //FreeDB Free Database Panel
  // host: 'sql.freedb.tech',
  // port: '3306',
  // user: "freedb_enatmatemiya",
  // password: "fRcMbfT@w6A@#X7",
  // database: "freedb_enatematemiya",


  ////localhost
  host: 'localhost',
  port: '3333',
  user: "root",
  password: "1234",
  database: "enate",

})
connection.connect((error) => {
  if (error) console.error(error);
  else {
    console.log("db Connected sucessfully");
  }
});




// Set up an Express app
const app = express();

// Use middleware to parse incoming HTTP request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Use middleware to enable CORS in your app
app.use(cors());


// Set up a simple route that responds with a message
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

//users selection
app.get('/users', (req, res) => {
    const SQLquery='SELECT * FROM users INNER JOIN profile ON users.id = profile.user_id'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.json(results);
    })
   
  });

//adding new user
app.post("/addNewUser", (req, res) => {
  const form = req.body.form;
  if (!form) {
    res.status(400).send("Bad request");
    return;
  } else {
    const { f_name, m_name, l_name, phone, role, profile, username, password, c_password } = form;
    let user_id;

    let query = "INSERT INTO `users`(`username`, `password`, `role`) VALUES (?, ?, ?);";
    let query2 = "INSERT INTO `profile`(`user_id`, `f_name`, `m_name`, `l_name`, `phone`, `image_url`) VALUES (?, ?, ?, ?, ?, ?);";

    connection.query(query, [username, password, role], (err, results, fields) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error occurred during insertion");
      } else {
        user_id = results.insertId;
        connection.query(query2, [user_id, f_name, m_name, l_name, phone, profile], (err, results, fields) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error occurred during insertion");
          } else {
            res.send(results);
          }
        });
      }
    });
  }
});
  
//delete user
app.delete('/deleteusers/:id', (req, res) => {
  const userId = req.params.id;
  // Delete the related records from the `profile` table first
  const profileQuery = 'DELETE FROM `profile` WHERE `user_id` = ?';
  connection.query(profileQuery, [userId], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(404).send("Error occurred during deletion");
    } else {
      // If the deletion from the `profile` table was successful, delete the user record from the `users` table
      const userQuery = 'DELETE FROM `users` WHERE `id` = ?';
      connection.query(userQuery, [userId], (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(404).send("Error occurred during deletion");
        } else {
          res.send("Deletion successful");
          console.log("Deletion successful");
        }
      });
    }
  });
});


  //products selection
  app.get('/products', (req, res) => {
    const SQLquery='select *from products'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.send(results);
    })
   
  });


//products selection
  app.get('/price', (req, res) => {
    const SQLquery='select home_price,out_price from products'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.send(results);
    })
   
  });

// delete product /deleteproducts/
app.delete('/deleteproducts/:id:name', (req, res) => {
  const productId = req.params.id;
  const productName = req.params.name;
  console.log(productId);
  console.log(productName);
  // Delete the related records from the `orders` table first
  const ordersQuery = "DELETE FROM `orders` WHERE `product_name` = ?";
  connection.query(ordersQuery, [productName], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(404).send("Error occurred during deletion");
    } else {
      // If the deletion from the `orders` table was successful
      const productsQuery = 'DELETE FROM `products` WHERE `id` = ?';
      connection.query(productsQuery, [productId], (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(404).send("Error occurred during deletion");
        } else {
          res.send("Deletion successful");
          console.log("Deletion successful");
        }
      });
    }
  });
});

  //orders selection
  app.get('/orders', (req, res) => {
    const SQLquery='select *from orders'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        res.json(results);
    })
   
  });

//delete order /deleteorders/
app.delete('/deleteorders/:id', (req, res) => {
  const userId = req.params.id;
  // Delete the related records from the `orders` table first
  const ordersQuery = 'DELETE FROM `orders` WHERE `id` = ?';
  connection.query(ordersQuery, [userId], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(404).send("Error occurred during deletion");
    } else {
      // If the deletion from the `orders` table was successful
      res.send("Deletion successful");
      console.log("Deletion successful");
    }
  });
});



//daly paiyed 
app.get('/day', (req, res) => {
    const SQLquery="SELECT SUM(paid_price) AS total_paid_price FROM orders WHERE DATE(date_of_order) = '2023-07-23'"
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.json(results);
    })
    
    });


  //weekly paiyed 
  app.get('/week', (req, res) => {
    const SQLquery="SELECT SUM(paid_price) AS total_paid_price FROM orders WHERE YEARWEEK(date_of_order, 1) = YEARWEEK('2023-07-23', 1)"
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.json(results);
    })
   
  });
  // Month paiyed 
  app.get('/MONTH', (req, res) => {
    const SQLquery="SELECT SUM(paid_price) AS total_paid_price FROM orders WHERE YEAR(date_of_order) = YEAR('2023-07-23') AND MONTH(date_of_order) = MONTH('2023-07-23')"
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.json(results);
    })
   
  });

  
//completed orederas



// Start the server and listen on port 3000
app.listen(port,ip ,() => {
  console.log(`Server listening on http://${ip}:${port}`);
});