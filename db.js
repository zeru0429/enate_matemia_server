import mysql from 'mysql2';
export const connection = mysql.createConnection({
  host: '192.168.1.250',
  port: '3333',
  user: 'enate',
  password: 'enate',
  database: 'enate',
});
//192.168.1.250  enate enate;
/*192.168.1.250 enatepassword enatmatemiy*/