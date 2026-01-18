const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const routes = require('./routes');
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
