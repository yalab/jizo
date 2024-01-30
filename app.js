require('dotenv').config()

const { App } = require('@slack/bolt')
const { OpenAI } = require('openai')

const openai = new OpenAI({"apiKey": process.env.OPENAI_API_KEY})

const threads_ts = {}
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const postOpenAI = async (content) => {
  const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: content }],
      model: 'gpt-3.5-turbo',
  })
  const message = chatCompletion.choices[0].message
  return message.content
}

app.event('app_mention', async ({ event, say }) => {
  const thread_ts = event.thread_ts ? event.thread_ts : event.ts;
  const message = event.text.substring(15)
  const text = await postOpenAI(message)
  await say({ text: text, thread_ts: thread_ts });
  threads_ts[thread_ts] = true
});

app.message(async ({ message, say }) => {
  if (message.thread_ts && threads_ts[message.thread_ts]) {
    const text = await postOpenAI(message.text)
    await say({
      text: text,
      thread_ts: message.thread_ts
    });
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
