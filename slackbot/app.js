import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { registerListeners } from './listeners/index.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js'
import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import { eq, lt, gte, ne, and } from 'drizzle-orm';

config();

export const db = drizzle(process.env.DATABASE_URL, {schema});

/** Initialization */
export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

const expr = express()
expr.use(cors({origin: "*", methods: "GET"}))

expr.get('/list', async (req, res) => {
  const launches = await db.select().from(schema.launchTable).where(eq(schema.launchTable.date, (new Date()).toISOString().substring(0,10)))
  const participants = await db.select({
    id: schema.participationTable.id,
    launchId: schema.participationTable.launchId,
    userId: schema.participationTable.userId,
    isDriver: schema.participationTable.isDriver,
    name: schema.participationTable.name,
  }).from(schema.participationTable)
  .innerJoin(schema.launchTable, eq(schema.participationTable.launchId, schema.launchTable.id))
  .where(eq(schema.launchTable.date, (new Date()).toISOString().substring(0,10)))

  res.send(JSON.stringify({
    launches: launches,
    participants: participants
  }))
})

expr.listen(3000, ()=> {
  console.log("Express running on 3000")
})

/** Register Listeners */
registerListeners(app);

/** Start the Bolt App */
(async () => {
  try {
    await app.start();
    app.logger.info('⚡️ Bolt app is running!');
  } catch (error) {
    app.logger.error('Failed to start the app', error);
  }
})();
