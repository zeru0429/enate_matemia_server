
// host: 'localhost',
//   port: '3333',
//   user: 'root',
//   password: '1234',
//   database: 'enate',


/*

// Function to fetch daily orders from the database
const fetchDailyOrders = () => {
  const today = new Date().toISOString().split('T')[0];
  const query = `SELECT * FROM orders WHERE order_date = '${today}'`;
  console.log(query);

  return pool.query(query).then((result) => result[0]);
};

// Function to convert the orders data to CSV format
const convertToCSV = (data) => {
  const csvFilePath = 'daily_orders.csv';
  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: 'order_id', title: 'Order ID' },
      { id: 'customer_name', title: 'Customer Name' },
      { id: 'order_date', title: 'Order Date' },
      { id: 'product_details', title: 'Product Details' },
    ],
  });

  csvWriter.writeRecords(data);

  return csvFilePath;
};

// Function to send email with the CSV file attachment
const sendEmailWithAttachment = async (csvFilePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mihiretg29@gmail.com',
        pass: 'Tsi@mt14',
      },
    });

    const mailOptions = {
      from: 'mihiretg29@gmail.com',
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
  }
};

// Function to calculate and store daily analysis
const calculateAndStoreDailyAnalysis = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT SUM(total_price) AS total_credits, SUM(paid_price) AS total_gain, SUM(remain_price) AS total_remaining FROM orders WHERE date_of_order = '${today}'`;

    const [result] = await pool.query(query);
    const { total_credits, total_gain, total_remaining } = result[0];

    const insertQuery = `INSERT INTO analysis (date, total_credits, total_gain, total_remaining) VALUES ('${today}', ${total_credits}, ${total_gain}, ${total_remaining})`;

    await pool.query(insertQuery);
    console.log('Daily analysis stored successfully!');
  } catch (error) {
    console.error('Error storing daily analysis:', error);
  }
};

// Schedule the task to run every 1 minute
cron.schedule('* * * * *', async () => {
  console.log('Running daily orders report task...');

  try {
    // Fetch daily orders from the database
    const [dailyOrders] = await fetchDailyOrders();

    // Convert the orders data to CSV format
    const csvFilePath = convertToCSV(dailyOrders);

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
});













// Function to fetch daily orders from the database
const fetchDailyOrders = () => {
  const today = new Date().toISOString().split('T')[0];
    const query = `SELECT * FROM orders WHERE order_date = '${today}'`;
    console.log(query);

  return connection.query(query).then((result) => result.rows);
};

// Function to convert the orders data to CSV format
const convertToCSV = (data) => {
  const csvFilePath = 'daily_orders.csv';
  const csvWriteStream = fs.createWriteStream(csvFilePath);
  const csvWriter = csv.writer({ headers: ['Order ID', 'Customer Name', 'Order Date', 'Product Details'] });

  csvWriter.pipe(csvWriteStream);

  data.forEach((order) => {
    csvWriter.write([
      order.order_id,
      order.customer_name,
      order.order_date,
      order.product_details,
    ]);
  });

  csvWriter.end();

  return csvFilePath;
};

// Function to send email with the CSV file attachment
const sendEmailWithAttachment = async (csvFilePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mihiretg29@gmail.com',
        pass: 'Tsi@mt14',
      },
    });

    const mailOptions = {
      from: 'mihiretg29@gmail.com',
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
  }
};

// Function to calculate and store daily analysis
const calculateAndStoreDailyAnalysis = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT SUM(total_price) AS total_credits, SUM(paid_price) AS total_gain, SUM(remain_price) AS total_remaining FROM orders WHERE date_of_order = '${today}'`;

    const result = await connection.query(query);
    const { total_credits, total_gain, total_remaining } = result.rows[0];

    const insertQuery = `INSERT INTO analysis (date, total_credits, total_gain, total_remaining) VALUES ('${today}', ${total_credits}, ${total_gain}, ${total_remaining})`;

    await connection.query(insertQuery);
    console.log('Daily analysis stored successfully!');
  } catch (error) {
    console.error('Error storing daily analysis:', error);
  }
};

// Schedule the task to run at 2:00 PM every day
cron.schedule('0 14 * * *', async () => {
  console.log('Running daily orders report task...');

  try {
    // Fetch daily orders from the database
    const dailyOrders = await fetchDailyOrders();

    // Convert the orders data to CSV format
    const csvFilePath = convertToCSV(dailyOrders);

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
});





*/