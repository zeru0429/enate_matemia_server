import mysql from 'mysql2';
export const connection = mysql.createConnection({
  host: 'localhost',
  port: '3333',
  user: 'root',
  password: '1234',
  database: 'enate',
});