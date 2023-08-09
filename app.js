import express, { response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import  jwt, { decode }  from 'jsonwebtoken';
import multer from 'multer';

const port = 8100;
const ip = 'localhost';
const app = express();

app.use(cors(
  {
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET","DELETE","PUT"],
    credentials: true
  }
));
app.use(express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  }
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: 'localhost',
  port: '3333',
  user: 'root',
  password: '1234',
  database: 'enate',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database as ID: ' + connection.threadId);
});

//------------------LOGIN ----------------//
app.post('/login', async (req, res) => {
  const { username, pass } = req.body;
  // Check if username and password are provided
  if (!username || !pass) {
    return res.status(400).json({ status: 'error', message: 'Username and password are required' });
  }

  // Query MySQL database for user with matching username
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (error, results, fields) => {
    if (error) {
      console.log('Error querying database:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    if (results.length === 0) {
      // No user found with matching username
      return res.json({ status: 'error', message: 'username not exist ' });
    }

    // Compare password with hash using bcrypt
    const user = results[0];
    if (user.password !== pass) {
      return res.json({ status: 'error', message: 'Invalid password' });
  
    }
    else {      
      const token = jwt.sign({ username }, 'zerubabel-secret-key', { expiresIn: '1m' });
      res.cookie('token',token)
       return res.status(200).json({ status: 'success', message: 'successfully log in', role: user.role, username:  user.username });
      

    }
   
  });
});



//check login status
const verifyUser = (req,res,next) => { 
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "no tooken so logout" })
  }
  else { 
    jwt.verify(token, 'zerubabel-secret-key', (error, decode) => { 
      if (error) { return res.json({ message: 'authentication error' }) }
      else {
        req.username = decode.username;
        next();
      }

    })
  }


}

app.get('/logincheck',verifyUser, (req, res) => { 
  const query = 'SELECT role FROM users WHERE username = ?';
  connection.query(query, [req.username], (error, results, fields) => {
      if (error) {
        console.log('Error querying database:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
      else {
        const role = results[0].role
        console.log(role);
      
    return res.json({ status: 'success',username: req.username,role:role })
      }
})

})

// logout functionality
app.get('/logout',(req, res)=> {
  res.clearCookie('token')
  return res.json({status: 'success'})
})




//------X-----------LOGIN -------X--------//




//geting authentication
app.get('/', (req, res) => { 
  
 res.end("<h1>req.session.username</h1>")
})


// delete product /deleteproducts/

















//-------------------- INSERTING ---------------------------//

//add new order
app.post('/addNewOrder', (req, res) => { 
  const form = req.body; 
  if (!form) {
    res.status(400).send("Bad request");
    return;
  }
  const {
  product_name,
  type_of_order,
  state_of_order,
  amount,
  paid_price,
  fullname,
  phone,
  kind_of_product
}
    = form;
  const total_price = amount * 20
  const remain_price = total_price - paid_price;
  const date_of_order = Date.now("YYYY-MM-DD HH:mm:ss")
  // res.send(form);
  // console.log(form);
  
let query = "INSERT INTO `orders`(product_name,type_of_order,state_of_order,amount,paid_price,name,phone,kind_of_product,total_price,remain_price,date_of_order) VALUES (?,?,?,?, ?, ?,?, ?, ?,?,NOW())";
  connection.query(query, [ product_name,type_of_order,
  state_of_order, amount,
  paid_price,fullname,
  phone,kind_of_product,total_price,remain_price,date_of_order], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred during insertion");
    } else { 
       res.send(results);
    }
  }
  )



})


  //adding new user
app.post("/addNewusers", upload.single('profile'), (req, res) => {
  const form = req.body;
  
  if (!form) {
    res.status(400).send("Bad request");
    return;
  } else {
    console.log(form);
    
 const image = req.file;
    const { f_name, m_name, l_name, phone, role, username, password, c_password} = form;
    let user_id;
   
    // console.log(f_name, m_name, l_name, phone, role, username, password, c_password);
    // console.log(image);
 
    let query = "INSERT INTO `users`(`username`, `password`, `role`) VALUES (?, ?, ?);";
    connection.query(query, [username, password, role], (err, results, fields) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error occurred during insertion");
      } else {
        user_id = results.insertId;
        let query2 = "INSERT INTO `profile`(`user_id`, `f_name`, `m_name`, `l_name`, `phone`, `image_url`) VALUES (?, ?, ?, ?, ?, ?);";
        connection.query(query2, [user_id, f_name, m_name, l_name, phone, image.filename], (err, results, fields) => {
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


// adding new products

app.post('/addNewproducts/', upload.single('profile'), (req, res) => {
  const {
    product_name,
    measurement_units,
    kind_of_product,
    home_price,
    out_price
  } = req.body;
  const image = req.file;

  // Process the uploaded image as needed
  console.log('Uploaded image:', image);

  // Save the product details to the database
  const sql =
    'INSERT INTO products (`product_name`, `kind_of_product`, `measurement_units`, `image_url`, `home_price`, `out_price`, `date_of_update`) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(
    sql,
    [
      product_name,
      kind_of_product,
      measurement_units,
      image.filename, // Assuming you want to save the image path in the database
      home_price,
      out_price,
      new Date() // Assuming `date_of_update` is a timestamp field
    ],
    (err, result) => {
      if (err) {
        console.error('Error adding new product: ' + err);
        res.status(500).json({ error: 'Failed to add new product' });
        return;
      }
      res.json({ success: true });
    }
  );
});




//--------X---------- INSERTING --------------X------------//


//--------X---------- UPDATING --------------X------------//
//update completed the  orders
//         /updatenot-completed-oreder:4
app.post('/update-not-completed-order/:id', (req, res) => {
  const orderId = req.params.id;
  const newStatus = req.body.status;
  const updateQuery = "UPDATE orders SET status = ? WHERE id = ?";
  console.log(orderId);
  // connection.query(updateQuery, [newStatus, orderId], (err, results, fields) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).send("Error occurred during update");
  //   } else if (results.affectedRows === 0) {
  //     res.status(404).send(`Order ${orderId} not found`);
  //   } else {
  //     console.log(`Order ${orderId} updated successfully`);
  //     res.send(`Order ${orderId} updated successfully`);
  //   }
  // });
});




app.post('/addNewchange_password/', (req, res) => { 
  const form = req.body;
  console.log(form);
 // res.send("")
})

app.post('/addNewupdateProfile/', (req, res) => { 
  console.log(req.body);
  
})


//------------------ UPDATING  -------------------------//

//-------------------- SELECTING ---------------------------//

// select all users
app.get('/users', (req, res) => {
    const SQLquery='SELECT users.id,users.username,users.password,users.role,profile.f_name,profile.m_name,profile.phone,profile.image_url FROM users INNER JOIN profile ON users.id = profile.user_id'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.json(results);
    })
   
  });

//select price of all products
  app.get('/price', (req, res) => {
    const SQLquery='select *from products'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        
        res.send(results);
    })
   
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


//selection All orders
  app.get('/orders', (req, res) => {
    const SQLquery='select *from orders'
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        res.json(results);
    })
   
  });
//selecting  completed orders
 app.get('/completed-oreder', (req, res) => {
    const SQLquery="select *from orders where status='completed' order by date_of_order asc"
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        res.json(results);
    })
   
 });
  
// selecting not completed orders
 app.get('/not-completed-oreder', (req, res) => {
    const SQLquery="select *from orders where status !='completed'order by status desc, date_of_order asc"
    connection.query(SQLquery,(error,results,fields)=>{
        //res.json(results)
        if(error) console.log(error);
        res.json(results);
    })
   
  });


// selecting profile 
app.get('/profile/:name', (req, res) => {
  const username = req.params.name;
  const SQLquery = `SELECT users.username, users.role, profile.f_name, profile.m_name, profile.l_name, profile.phone, profile.image_url
FROM users
INNER JOIN profile ON users.id = profile.user_id
WHERE username='${username}';`;
  console.log(username);
  connection.query(SQLquery, (error, results, fields) => {
    //res.json(results)
    if (error) console.log(error);
    res.json(results);
  })
})
//-------------X----------- SELECTing  ----------------X--------//



//------------------- DELETE --------------------------//

//delete users
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
//delete Orders
app.delete('/deleteorders/:id', (req, res) => {
  const userId = req.params.id;
  // Delete the related records from the `orders` table first
  const ordersQuery = 'DELETE FROM `orders` WHERE `id` = ?';
  console.log(userId);
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

//delete Products
app.delete('/deleteproducts/:id', (req, res) => {
  const productId = req.params.id;
  console.log(productId);
  // Delete the related records from the `orders` table first
  const ordersQuery = "DELETE FROM `orders` WHERE `id` = ?";
  connection.query(ordersQuery, [productId], (err, results, fields) => {
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

//--------X---------- DELETE --------------X------------//

app.listen(port, ip, () => {
  console.log(`Server is running on http://${ip}:${port}`);
});