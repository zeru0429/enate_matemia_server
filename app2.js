
// Create a MySQL connection connection

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
const convertToCSV = (data) => {
  const csvFilePath = 'daily_orders.csv';
  const csvWriteStream = fs.createWriteStream(csvFilePath);
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
  }
};

// Function to calculate and store daily analysis
const calculateAndStoreDailyAnalysis = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT SUM(total_price) AS total_credits, SUM(paid_price) AS total_gain, SUM(remain_price) AS total_remaining FROM orders WHERE date_of_order = '${today}'`;

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
  }
};

// Schedule the task to run every 1 minute
setInterval(async () => {
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
}, 6000); // Run every 1 minute (60000 milliseconds)










var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
        user: 'mihiretuhailegiyorgis@gmail.com',
        pass: 'bpvwkysosrlkltpw',
      },
});

var mailOptions = {
  from: 'mihiretuhailegiyorgis@gmail.com',
      to: 'mihiretutigistu@gmail.com',
      subject: 'Daily Orders Report',
      text: 'Attached is the daily orders report CSV file.',
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }

  
});




