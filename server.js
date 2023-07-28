import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2'

//constants
const port = 8100

// Set up a MySQL database connection pool
const connection =mysql.createConnection ({
  host: 'localhost',
  port: '3333',
  user: "root",
  password: "1234",
  database: "enate",

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

  //orders selection
  app.get('/orders', (req, res) => {
    const SQLquery='select *from orders'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        res.json(results);
    })
   
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
app.listen(port, () => {
  console.log('Server listening on port 8100');
});