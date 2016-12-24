# Non Sequitur

Random quotes from your Slack team

## Deploy app

Commands **L** are local on your laptop, **R** are remote on the Digital Ocean droplet.

- **L** Create a Slack app at https://api.slack.com/apps
- **L** Create a Dokku droplet on Digital Ocean
- **L** Access the IP address of your droplet in a browser and click Finish Setup
- **L** SSH to your droplet as `root`
- **R** Install the Dokku MongoDB plugin
`dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo`
- **R** Create a MongoDB database
`dokku mongo:create mongo`
- **R** Create a Dokku app
`dokku apps:create non-sequitur`
- **R** Link the database with the app
`dokku mongo:link mongo non-sequitur`
- **R** Add your Slack credentials from https://api.slack.com/apps (you don't have `SLACK_SLASH_TOKEN` yet, so leave it set to a junk value)
`dokku config non-sequitur SLACK_CLIENT_ID=xx.xx SLACK_CLIENT_SECRET=yy SLACK_SLASH_TOKEN=TBD`
- **R** Configure root domain
```
dokku domains:add non-sequitur non-sequitur.info
dokku domains:remove non-sequitur non-sequitur.non-sequitur.info
```
- **L** Clone the GitHub repository
- **L** Add the remote to your checked out repo
`git remote add dokku dokku@non-sequitur.info:non-sequitur`
- **L** Deploy
`git push dokku master`
- **R** Install Let's Encrypt Dokku plugin
`sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git`
- **R** Enable SSL
```
dokku config:set --no-restart non-sequitur DOKKU_LETSENCRYPT_EMAIL=a@b.com
dokku letsencrypt non-sequitur
dokku letsencrypt:cron-job --add
```
- At this point you should see the app at https://non-sequitur.info
- **L** Create a slash command for the Slack app (it's necessary for the app to be up for this)
Command: `/quote`
Request URL: https://non-sequitur.info/slack/receive
Description: Random quote from someone on your team
Usage hint: @user amazing
- **R** Add your Slack slash token
`dokku config non-sequitur SLACK_SLASH_TOKEN=zz`
- **L** Configure the redirect URL for the Slack app to https://non-sequitur.info/slack/oauth
