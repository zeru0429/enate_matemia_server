import mysql from 'mysql2';
export const connection = mysql.createConnection({
  host: '192.168.1.250',
  port: '3333',
  user: 'enate',
  password: 'enate',
  database: 'enate',
});



connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database as ID: ' + connection.threadId);
});


//192.168.1.250  enate enate;
/*192.168.1.250 enatepassword enatmatemiy*/