require('dotenv').config()

const { App } = require('@slack/bolt');

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

app.message(async ({ message, say }) => {
  // イベントがトリガーされたチャンネルに say() でメッセージを送信します
    console.log(message)
    console.log(say)
  await say(`hello`);
});

(async () => {
  // アプリを起動します
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();
