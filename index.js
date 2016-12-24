require('dotenv').load();

const express = require('express');
const morgan = require('morgan');
const logger = require('./lib/logger');
const bodyParser = require('body-parser');
require('./adapters/_init');

const slash = require('./routes/slash');
const auth = require('./routes/auth');
const quote = require('./lib/quote');

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
app.use('/slack/receive', slash({
  handler: quote,
  token: process.env.SLACK_SLASH_TOKEN
}));
app.use('/slack', auth({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: quote.requiredOAuthScopes
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('Not Found');
});

// error handlers
app.use(function(err, req, res, next) {
  logger.error(`Error: ${err}\n${err.stack}`);
  res.status(err.status || 500).send('Non Sequitur crashed :boom:');
});

module.exports = app;
