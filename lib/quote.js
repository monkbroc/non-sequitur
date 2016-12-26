// A Slack command to return a random quote by a person

const got = require('got');
const logger = require('./logger');
const URI = require('urijs');
const quips = require('./quips.json');

module.exports = quote = function (args) {
  return Promise.resolve()
  .then(() => {
    const token = args.apiToken;
    const message = args.message;

    const [users, words] = extractUsersAndWords(message);

    if (message === "help" || (users.length == 0 && words.length == 0)) {
      return 'Try `/quote @name`, `/quote word` or `/quote @name word`';
    }

    const query = [...users.map(u => `from:${u}`), words].join(' ');

    return countMessages(query, token)
    .then(response => {
      const result = JSON.parse(response.body);
      const count = result.messages && result.messages.total;

      if (!count) {
        return shrug();
      }

      // RANDOM!
      const messageNumber = Math.floor(Math.random() * count);

      return getMessageBlock(messageNumber, query, token)
      .then(response => {
        const result = JSON.parse(response.body);
        // filter public messages
        const messages = result.messages.matches.filter(message => message.channel.id.startsWith('C'));

        if (messages.length == 0) {
          return shrug();
        }

        const n = Math.floor(Math.random() * messages.length);
        const message = messages[n];

        const text = `${sample(quips)}\n${message.permalink}`;
        return {
          response_type: 'in_channel',
          text: text,
          unfurl_links: true
        };
      });
    });
  });
};

quote.requiredOAuthScopes = "search:read";

function extractUsersAndWords(message) {
  const userRegex = /@\S+/g;
  const users = [];
  const words = message
    .replace(userRegex, user => {
      users.push(user);
      return '';
    })
    .replace(/^\s*/, '').replace(/\s*$/, '');

  return [users, words];
}

function countMessages(query, token) {
  const url = URI('https://slack.com/api/search.messages')
    .query({
      token,
      query,
      count: 1
    }).toString();
  return got(url);
}

// Hack: Slack only allows getting up to page 100 so ask for 1000 items
// per page and filter in memory ¯\_(ツ)_/¯
const perPage = 1000;
function getMessageBlock(messageNumber, query, token) {
  const url = URI('https://slack.com/api/search.messages')
    .query({
      token,
      query,
      count: perPage,
      page: Math.ceil(messageNumber / perPage)
    }).toString();
  return got(url);
}

function shrug() {
  return 'Nobody ever talked about that ¯\\_(ツ)_/¯';
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}
