import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const port = 8100;
const ip = 'localhost';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
      image.path, // Assuming you want to save the image path in the database
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
  console.log(req.params);
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



app.listen(port, ip, () => {
  console.log(`Server is running on http://${ip}:${port}`);
});