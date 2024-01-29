require('dotenv').config()

const { App } = require('@slack/bolt');

const bot_user_id = process.env.SLACK_BOT_USER_ID

const threads_ts = {}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

app.event('app_mention', async ({ event, message, say }) => {
  const thread_ts = event.thread_ts ? event.thread_ts : event.ts;

  await say({
    text: `Hello, <@${event.user}>!`,
    thread_ts: thread_ts
  });

  threads_ts[thread_ts] = true
});

app.message(async ({ message, say }) => {
  if (message.thread_ts && threads_ts[message.thread_ts]) {
    await say({
      text: `${message.text}  <@${message.user}>!`,
      thread_ts: message.thread_ts
    });
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
