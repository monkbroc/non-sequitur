const express = require('express');
const got = require('got');
const Account = require('../adapters/account');
const URI = require('urijs');
const logger = require('../lib/logger');

module.exports = function (config) {
  const auth = express();

  /* Redirect to Slack OAuth login page */
  auth.get('/login', (req, res, next) => {
    res.redirect(getAuthorizeURL());
  });

  /* Save new team */
  auth.get('/oauth', (req, res, next) => {
    const code = req.query.code;
    let auth;

    oauth_access({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code
    })
    .then(_auth => {
      auth = _auth;
      return auth_test({ token: auth.access_token });
    })
    .then(identity => {
      logger.info(`Added team ${identity.team_id}`);

      return Account.findOrCreate(identity.team_id, {
        teamId: identity.team_id,
        createdBy: identity.user_id,
        name: identity.team,
        apiToken: auth.access_token,
      });
    })
    .then(() => {
      res.redirect(getSuccessUrl());
    })
    .catch(err => {
      logger.error(`Failed to authorize team ${err}\n${err.stack}`);
      res.redirect(getFailureUrl());
    });
  });

  function call_api(command, options) {
    const url = `https://slack.com/api/${command}`;
    logger.debug(`** API CALL: ${url}`);
    return got.post(url, {
      body: options
    })
    .then((response) => {
      if(response.statusCode == 200) {
        const json = JSON.parse(response.body);
        if(json.ok) {
          return json;
        } else {
          throw new Error(json.error);
        }
      } else {
        throw new Error(`Slack API error ${response.statusCode}`);
      }
    });
  }

  // get a team url to redirect the user through oauth process
  function getAuthorizeURL() {
    const url = URI('https://slack.com/oauth/authorize')
      .query({
        client_id: config.clientId,
        scope: config.scopes
      });
    return url.toString();
  }

  function getSuccessUrl() {
    return "/added";
  }

  function getFailureUrl() {
    return "/failed";
  }

  function oauth_access(options) {
    return call_api('oauth.access', options);
  }

  function auth_test(options) {
    return call_api('auth.test', options);
  }

  return auth;
};

