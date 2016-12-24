require('dotenv').load();

const express = require('express');
const morgan = require('morgan');
const logger = require('./lib/logger');
const bodyParser = require('body-parser');

const slash = require('./routes/slash');
const auth = require('./routes/auth');

if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET || !process.env.SLACK_SLASH_TOKEN) {
  logger.error('Error: Specify SLACK_CLIENT_ID SLACK_CLIENT_SECRET SLACK_SLASH_TOKEN in environment');
  process.exit(1);
}

const app = express();

// Log HTTP requests
app.use(morgan('combined', { 'stream': logger.stream }));

// Parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

// Handle routes

