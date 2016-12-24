const express = require('express');
const Account = require('../adapters/account');
const scmp = require('scmp');
const logger = require('../lib/logger');

function verifyAuthentic(msg, token) {
  // Safe constant-time comparison of token
  return scmp(msg.token, token);
}

function mapSlackMessage(msg) {
  return {
    raw: msg,
    apiToken: null,
    message: msg.text,
    teamId: msg.team_id,
    currentUserId: msg.user_id,
    channelId: msg.channel_id
  };
}

function addTeamToPayload(payload) {
  return Account.find(payload.teamId)
  .then(account => {
    if (account) {
      payload.account = account;
      payload.apiToken = account.apiToken;
    }
    return payload;
  });
}

function teamNotFoundError(host) {
  return `Non Sequitur was not added to your team. Add it at https://${host}`;
}

module.exports = function (config) {
  const handler = config.handler;
  const slash = express();

  /* Inbound slash command */
  slash.post('/', (req, res, next) => {
    if(!verifyAuthentic(req.body, config.token)) {
      logger.error('Called with wrong verification token');
      res.status(403).send('Not called by Slack');
      return;
    }

    const payload = mapSlackMessage(req.body);

    addTeamToPayload(payload)
    .then(() => {
      if(!payload.account) {
        logger.error('Called for non-existent team');
        return res.send(teamNotFoundError(req.hostname));
      }
      logger.info(`Quoting for team ${payload.account.name} (${payload.teamId})`);

      if(handler) {
        /* Run the actual logic of the slash command */
        return handler(payload)
        .then(reply => {
          if (typeof reply === 'string') {
            res.send(reply);
          } else {
            res.json(reply);
          }
          payload.account.actionPerformed();
        });
      } else {
        res.send("OK");
      }
    })
    .catch(err => {
      next(err);
    });
  });

  return slash;
};

