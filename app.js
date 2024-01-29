require('dotenv').config()

const { App } = require('@slack/bolt');

const bot_user_id = process.env.SLACK_BOT_USER_ID

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const mention = new RegExp(`^<@${bot_user_id}>`)

app.message(mention, async ({ event, message, say }) => {
  const threadTs = event.thread_ts ? event.thread_ts : event.ts;

  await say({
	text: `Hello, <@${event.user}>!`,
	thread_ts: threadTs
  });
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
