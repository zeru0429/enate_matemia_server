import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2'
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

//constants
const port = 8100;
const ip = 'localhost';
const app = express();

app.use(
  cors({
    origin: '*',
  methods: ['POST', 'GET'],
    credentials: true,
  })
);

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 1 * 1, // Set the maximum age of the cookie in milliseconds (e.g., 1 day)
    httpOnly: true, // Ensures that the cookie is only accessible through HTTP(S) requests and not through JavaScript
    secure: false, // Set this to true if your application uses HTTPS
  },
}));

// Use middleware to parse incoming HTTP request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.json())


const connection = mysql.createConnection({
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


app.get('/', (req, res) => {
  res.send('Hello, world!');
});


//login 
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
      return res.json({ status: 'error', message: 'Invalid username [user not exist]' });
    }

    // Compare password with hash using bcrypt
    const user = results[0];
    if (user.password !== pass) {
      return res.json({ status: 'error', message: 'Invalid password' });
  
    }
    else {
      const sessionId = uuidv4();
      
      req.session.sessionId = sessionId; 
      res.set('Set-Cookie', `session=${sessionId}`)

      return res.status(200).json({ status: 'success', message: 'successfully log in', role: user.role, username: sessionId });

    }
   
  });
});

// Check if the user is already logged in using the sessionId cookie
app.get('/checkLoginStatus', (req, res) => {
  console.log(req.session);
  console.log();
console.log(req.session.userId);
  if (req.session && req.session.userId) {
    // User is logged in
    
    res.status(200).json({ loggedIn: true, userId: req.session.userId });
  } else {
    // User is not logged in
    res.status(401).json({ loggedIn: false });
  }
});

app.listen(port,ip ,() => {
  console.log(`Server listening on http://${ip}:${port}`);
});
