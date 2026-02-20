import { db } from "../../app.js";
import { launchTable, participationTable } from "../../schema.js";

export const register = (app) => {
  app.view('launch_create', async ({ ack, body, view, logger, client }) => {
    await ack();

    const user = body.user.id
    const channelId = view.private_metadata

    const location = view.state.values.location['plain_text_input-action'].value;
    const desc = view.state.values.desc['plain_text_input-action2'].value;
    const time = view.state.values.time['static_select-action'].selected_option.value;
    const takeBack = view.state.values.takeBack['actionId-0'].selected_options != []
    const isDriving = view.state.values.isDriving['actionId-111'].selected_options != []

    const hrs = time.substring(0,2)
    const mins = time.substring(2,4)
    const date = new Date()

    date.setHours(parseInt(hrs))
    date.setMinutes(parseInt(mins))
    date.setSeconds(0)

    // date is now processed
    const newLaunch = (await db.insert(launchTable).values({
      name: location,
      desc: desc,
      authorId: user,
      date: date,
      time: hrs+":"+mins,
      takeBack: takeBack
    }).returning())[0] ?? null

    const part = (await db.insert(participationTable).values({
      launchId: newLaunch.id,
      userId: user,
      isDriver: isDriving,
      name: body.user.name
    }).returning())[0] ?? null

    logger.info(newLaunch)

    const launchBlocks = []
    launchBlocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<@${newLaunch.authorId}>: ${newLaunch.name} (${newLaunch.time})`,
      }
    })

    if(newLaunch.desc != "")
    launchBlocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": newLaunch.desc,
      }
    })

    launchBlocks.push({
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "style": "primary",
          "text": {
            "type": "plain_text",
            "text": "Join as Passenger",
            "emoji": true
          },
          "value": newLaunch.id,
          "action_id": "joinPassenger"
        },
        {
          "type": "button",
          "style": "primary",
          "text": {
            "type": "plain_text",
            "text": "Join as Driver",
            "emoji": true
          },
          "value": newLaunch.id,
          "action_id": "joinDriver"
        }
      ]
    })

    const result2 = await client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      link_names: true,
      mrkdwn: false,
      blocks: [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "A new launch has been created!",
            "emoji": true
          }
        },
        ...launchBlocks
      ]
    })
  });

  app.view('launch_list', async ({ ack, body, view, logger }) => {
    await ack();
  });
};
