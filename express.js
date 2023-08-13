import express, { response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
const port = 8100;
const ip = 'localhost';

export const app = express();
app.use(cors({
  origin: ['http://192.168.1.250:3000','http://localhost:3000',],
  methods: ["POST", "GET", "DELETE", "PUT"],
  credentials: true
}));

app.use(express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());



app.listen(port,ip, () => {
  console.log(`Server is running on http://${ip}:${port}`);
});
