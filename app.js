import { v4 as uuidv4 } from 'uuid';
import  jwt, { decode }  from 'jsonwebtoken';
import { connection } from './db.js'
import { upload} from './multer.js'
import { app} from './express.js'

import fs from 'fs';
import createCsvWriter from 'csv-writer';
// Rest of the code...
import cron from 'node-cron';
import nodemailer from 'nodemailer';






















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



//-------------------- INSERTING ---------------------------//

//add new order
app.post('/addNeworders/', (req, res) => { 
  const form = req.body; 
  if (!form) {
    res.status(400).send("Bad request");
    return;
  }
 // console.log(form);
  let {
  product_name,kind_of_product,type_of_order,state_of_order,
  amount, total_price,paid_price,remain_price,
  fullname,casher_name, phone 
  }
    = form;
  let product_id=0;
  amount = parseInt(amount, 10)
  total_price = parseFloat(total_price)
  paid_price = parseFloat(paid_price)
  remain_price = parseFloat(remain_price)
  let status;
  //console.log(paid_price);

   const SQLquery='select id from products where product_name=?'
  connection.query(SQLquery, [product_name],async (error, results, fields) => {
       //res.json(results)
    if (error) console.log(error);
  //  console.log( results[0].id);
    if (results) { 
      product_id = results[0].id;
      const Query = "INSERT INTO `orders` (`product_id`, `kind_of_product`, `type_of_order`, `state_of_order`, `amount`, `total_price`, `paid_price`,`remain_price`, `status`, `phone`, `full_name`, `casher_name`, `date_of_order`) VALUES (?,?,?,?, ?, ?,?, ?, ?,?,?,?,?)";
     if (state_of_order === 'urgent') {
        const pendingCount = await getNumbersOfPendingStatus();
       // console.log(pendingCount);
        if (pendingCount > 5) {
          status = 'ordered';
        } else {
          status = 'pending';
        }
      } else {
        status = 'ordered';
      }
      
      if (type_of_order == 'home_price') { 
        type_of_order = 'home_made';
      }
      else {
        type_of_order = 'printing'
        
       }
     
      const date_of_order =new Date().toISOString().slice(0, 19).replace("T", " ")
      connection.query(Query, [ product_id, kind_of_product, type_of_order, state_of_order, amount, total_price, paid_price, remain_price, status, phone, fullname, casher_name, date_of_order], (err, results, fields) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error occurred during insertion");
        } else { 
          res.send(results);
        }
      }
      ) 






    }
    })
    
     

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


//------------------ UPDATING --------------------------//
//update completed the  orders
app.post('/update-not-completed-order/:id', (req, res) => {
  const orderId = req.params.id;
  const newStatus = req.body.status.status;
  //res.send("hihi")
  const updateQuery = "UPDATE orders SET status = ? WHERE id = ?";
  //console.log(newStatus);
  connection.query(updateQuery, [newStatus, orderId], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred during update");
    } else if (results.affectedRows === 0) {
      res.status(404).send(`Order ${orderId} not found`);
    } else {
      updateStatusOfOther();
      console.log(`Order ${orderId} updated successfully`);
      res.send(`Order ${orderId} updated successfully`);
    }
  });
});



//chage password
app.post('/addNewchange_password/', (req, res) => { 
  const { curent_password, password,c_password } = req.body[0];
  const username = req.body[1];
  const role = req.body[2]
  //console.log(curent_password,password,c_password,username,role);
  const query = 'UPDATE users SET password = ? WHERE username = ?'
  const queryPrev = 'SELECT password from users WHERE username = ?'
  //validate the confim password
  connection.query(queryPrev, [username], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(401).send("incorrect current password");
    }
    else {
      if (!results[0].password) {
        res.send("incorrect current no user is found");
      }
      else { 
        if (results[0].password !== curent_password) {
          res.send("incorrect current password");
          console.log("incorrect current password");
        }
        else {
          connection.query(query, [password, username], (err, results, fields) => {
            if (err) {
              console.log(err);
              res.status(401).send("Error occurred during updating password");
            } else {
              res.send(results);
              console.log(results);
            }
          })
          

        }

      }
      
      // res.send(results)
    }
  
  }
  )

  
})

app.post('/addNewupdateProfile/', upload.single('profile'), (req, res) => { 
  const image = req.profile;
  //console.log(req.body);
  console.log(image );

  
})


//----------X----------- UPDATING  --------------X----------//

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


////////////////////////////////////////////


app.get('/api/subdivisions', (req, res) => {
  connection.query('SELECT * FROM subdivisions', (error, results) => {
    if (error) {
      console.error('Error retrieving subdivisions:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/product', (req, res) => {
  connection.query('SELECT * FROM product', (error, results) => {
    if (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/product', (req, res) => {
  const { name, description } = req.body;

  // Insert the product into the database
  connection.query(
    'INSERT INTO product (name, description) VALUES (?, ?)',
    [name, description],
    (error, results) => {
      if (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ message: 'Product created successfully' });
      }
    }
  );
});

app.post('/api/orders', (req, res) => {
  const { customerId, productId, quantity } = req.body;

  // Check if the product exists
  connection.query('SELECT * FROM product WHERE id = ?', [productId], (error, results) => {
    if (error) {
      console.error('Error checking product:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else if (results.length === 0) {
      res.status(400).json({ error: 'Product not found' });
    } else {
      // Insert the order into the database
      connection.query(
        'INSERT INTO orders (customerId, productId, quantity) VALUES (?, ?, ?)',
        [customerId, productId, quantity],
        (error, results) => {
          if (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.json({ message: 'Order created successfully' });
          }
        }
      );
    }
  });
});


/// -------------------- Email Service ------------------////
//////////////////////////////////////////////////////////////

// Function to fetch daily orders from the database
const fetchDailyOrders = async () => {
  const today = new Date().toISOString().split('T')[0];
const query = `SELECT * FROM orders WHERE DATE(date_of_order) = '${today}'`;
  console.log(query);

  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Function to convert the orders data to CSV format
const convertToCSV = async (data) => {
  const csvFilePath = 'daily_orders.csv';

  try {
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'product_id', title: 'product_id' },
        { id: 'type_of_order', title: 'type_of_order' },
        { id: 'state_of_order', title: 'state_of_order' },
        { id: 'amount', title: 'amount' },
        { id: 'total_price', title: 'total_price' },
         { id: 'paid_price', title: 'paid_price' },
        { id: 'remain_price', title: 'remain_price' },
        { id: 'status', title: 'status' },
        { id: 'phone', title: 'phone' },
        { id: 'full_name', title: 'full_name' },
        { id: 'casher_name', title: 'casher_name' },
        { id: 'date_of_order', title: 'date_of_order' },
      ],
    });

    await csvWriter.writeRecords(data);

    return csvFilePath;
  } catch (error) {
    console.error('Error converting data to CSV:', error);
    throw error;
  }
};

// Function to send email with the CSV file attachment
const sendEmailWithAttachment = async (csvFilePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mihiretuhailegiyorgis@gmail.com',
        pass: 'bpvwkysosrlkltpw',
      },
    });

    const mailOptions = {
      from: 'mihiretuhailegiyorgis@gmail.com',
      to: 'mihiretutigistu@gmail.com',
      subject: 'Daily Orders Report',
      text: 'Attached is the daily orders report CSV file.',
      attachments: [
        {
          filename: 'daily_orders.csv',
          path: csvFilePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to calculate and store daily analysis
const calculateAndStoreDailyAnalysis = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT SUM(total_price) AS total_credits, SUM(paid_price) AS total_gain, SUM(remain_price) AS total_remaining FROM orders`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          const { total_credits, total_gain, total_remaining } = results[0];

          const insertQuery = `INSERT INTO analysis (date, total_credits, total_gain, total_remaining) VALUES ('${today}', ${total_credits}, ${total_gain}, ${total_remaining})`;

          connection.query(insertQuery, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error storing daily analysis:', error);
    throw error;
  }
};

// Schedule the task to run every 1 minute
setInterval(async () => {
  console.log('Running daily orders report task...');

  try {
    // Fetch daily orders from the database
    const dailyOrders = await fetchDailyOrders();

    // Convert the orders data to CSV format
    const csvFilePath = await convertToCSV(dailyOrders);

    // Send email with the CSV file attachment
    await sendEmailWithAttachment(csvFilePath);

    // Delete the CSV file after sending the email
    fs.unlinkSync(csvFilePath);

    // Calculate and store daily analysis
    await calculateAndStoreDailyAnalysis();

    console.log('Daily orders report task completed!');
  } catch (error) {
    console.error('Error executing daily orders report task:', error);
  }
}, 60000*60*4); // Run every 1 minute (60000 milliseconds) *60min *4 hour
///////////////////////////////////////////////////////////////
/// ----X--------------- Email Service --------X---------////

//function to 
async function getNumbersOfPendingStatus() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT COUNT(*) AS pending_count FROM orders WHERE status = 'pending'";
    connection.query(sql, (error, results, fields) => {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }
      resolve(parseInt(results[0].pending_count));
    });
  });
}


async function updateStatusOfOther() { 
  const pendingCount = await getNumbersOfPendingStatus();
  if (pendingCount < 5) { 
    const sql = "UPDATE orders SET status = 'pending' WHERE status = 'ordered' ORDER BY date_of_order ASC LIMIT 1;"
    connection.query(sql, (error, results, fields) => {
      if (error) {
        console.error(error);
      }
    });
  }
  
  return true;
}

