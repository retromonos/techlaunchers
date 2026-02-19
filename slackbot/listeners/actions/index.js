import { db } from '../../app.js';
import { launchTable, participationTable } from '../../schema.js';
import { sampleActionCallback } from './sample-action.js';
import { eq, lt, gte, ne, and } from 'drizzle-orm';

export const register = (app) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('joinPassenger', async ({ ack, client, body, logger, respond }) => {
    await ack()

    const channelId = body.channel.id
    const launchId = body.actions[0].value
    const userId = body.user.id

    try {

      const exists = (await db.select().from(participationTable).where(
        and(eq(participationTable.launchId, launchId), eq(participationTable.userId, userId))))[0] ?? null

      if(exists) {
        await client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          user: userId,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `You have already joined this launch.`,
                "emoji": true
              }
            },
          ]
        })

        return
      }

      const part = (await db.insert(participationTable).values({
        launchId: launchId,
        userId: userId,
        isDriver: false,
        name: body.user.name
      }).returning())[0] ?? null

      const launch = (await db.select().from(launchTable).where(eq(launchTable.id, launchId)))[0] ?? null
      
      // Make sure the action isn't from a view (modal or app home)
      if (body.message && part && launch) {
        const result = await client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `<@${part.userId}> joined ${launch.name} as a passenger!`,
                "emoji": true
              }
            },
          ]
        })
      }
    }
    catch (error) {
      logger.error(error);
    }
  })
  app.action('joinDriver', async ({ ack, client, body, logger, payload }) => {
    await ack()

    const channelId = body.channel.id
    const launchId = body.actions[0].value
    const userId = body.user.id

    try {

      const exists = (await db.select().from(participationTable).where(
        and(eq(participationTable.launchId, launchId), eq(participationTable.userId, userId))))[0] ?? null

      if(exists) {
        await client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          user: userId,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `You have already joined this launch.`,
                "emoji": true
              }
            },
          ]
        })

        return
      }

      const part = (await db.insert(participationTable).values({
        launchId: launchId,
        userId: userId,
        isDriver: true,
        name: body.user.name
      }).returning())[0] ?? null

      const launch = (await db.select().from(launchTable).where(eq(launchTable.id, launchId)))[0] ?? null
      
      // Make sure the action isn't from a view (modal or app home)
      if (body.message && part && launch) {
        const result = await client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          blocks: [
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `<@${part.userId}> joined ${launch.name} as a driver!`,
                "emoji": true
              }
            },
          ]
        })
      }
    }
    catch (error) {
      logger.error(error);
    }
  })
};
