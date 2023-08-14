import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { connection } from './db.js';

const port = 8100;
const ip = '192.168.1.250';

export const app = express();

app.use(express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from any origin
        callback(null, true);
    },
    credentials: true // Allow credentials (cookies) to be sent
}));


app.get('/', (req, res) => { 
  res.send("<h1>hi there</h1>");
})
//------------------LOGIN ----------------//
//logout
app.get('/logout',(req, res)=> {
  res.clearCookie('token')
  return res.json({status: 'success'})
})
//check login status
const verifyUser = (req,res,next) => { 
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "no token, so logout" });
  }
  else { 
    jwt.verify(token, 'zerubabel-secret-key', (error, decode) => { 
      if (error) { return res.json({ message: 'authentication error' }); }
      else {
        req.username = decode.username;
        next();
      }
    });
  }
};

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
      return res.json({ status: 'error', message: 'username does not exist' });
    }

    // Compare password with hash using bcrypt
    const user = results[0];
    if (user.password !== pass) {
      return res.json({ status: 'error', message: 'Invalid password' });
    }
    else {
      const token = jwt.sign({ username }, 'zerubabel-secret-key', { expiresIn: '1m' });
      res.cookie('token', token);

      // Set CORS headers for this response based on the incoming request's origin
      res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
      res.setHeader("Access-Control-Allow-Credentials", "true");

      return res.status(200).json({ status: 'success', message: 'successfully log in', role: user.role, username: user.username });
    }
  });
});

app.get('/logincheck', verifyUser, (req, res) => { 
  const query = 'SELECT role FROM users WHERE username = ?';
  connection.query(query, [req.username], (error, results, fields) => {
      if (error) {
        console.log('Error querying database:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
      else {
        const role = results[0].role;
        
        // Set CORS headers for this response based on the incoming request's origin
         res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
        res.setHeader("Access-Control-Allow-Credentials", "true");
        return res.json({ status: 'success', username: req.username, role: role });
      }
  });
});

//------X-----------LOGIN -------X--------//

app.listen(port, () => {
  console.log(`Server is running on http://${ip}:${port}`);
});
