require('dotenv').config()

const { App } = require('@slack/bolt')
const { OpenAI } = require('openai')

const openai = new OpenAI({"apiKey": process.env.OPENAI_API_KEY})
const redis = require('redis').createClient({url: process.env.REDIS_URL})

const threads_ts = {}
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const postOpenAI = async (messages) => {
  const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
  })
  const message = chatCompletion.choices[0].message
  return message.content
}

app.event('app_mention', async ({ event, say }) => {
  const thread_ts = event.thread_ts ? event.thread_ts : event.ts;
  const message = { role: 'user', content: event.text.substring(15) }
  await redis.connect()
  const text = await postOpenAI([message])
  redis.set(String(thread_ts), JSON.stringify([message, { role: 'assistant', content: text}]), 3600)
  await say({ text: text, thread_ts: thread_ts });
  const v = await redis.get(thread_ts)    
  redis.disconnect()
});

app.message(async ({ message, say }) => {
  if (!message.thread_ts) { return }
  await redis.connect()
  const str = await redis.get(String(message.thread_ts))
  if (!str) { return }
  const messages = JSON.parse(str)
  messages.push({ role: 'user', content: message.text })
  const text = await postOpenAI(messages)
  messages.push({ role: 'assistant', content: text })
  await redis.set(String(message.thread_ts), JSON.stringify(messages), 3600)
  redis.disconnect()
  await say({text: text, thread_ts: message.thread_ts})
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
