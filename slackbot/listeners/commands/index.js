import { db } from "../../app.js";
import { launchTable } from "../../schema.js";
import { eq, lt, gte, ne } from 'drizzle-orm';

export const register = (app) => {
  app.command('/launch', async ({ command, body, ack, client, say, logger }) => {
    try {
      await ack();

      const userId = command.user_id;
      const channelId = command.channel_id;
      const commandText = command.text;
      const triggerId = body.trigger_id;

      switch(commandText) {
        case "create":
          const result = await client.views.open({
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: triggerId,
            // View payload
            view: {
              type: 'modal',
              // View identifier
              callback_id: 'launch_create',
              title: {
                type: 'plain_text',
                text: 'Create a new Launch'
              },
              blocks: [
                {
                  "type": "input",
                  "block_id": "location",
                  "element": {
                    "type": "plain_text_input",
                    "action_id": "plain_text_input-action"
                  },
                  "label": {
                    "type": "plain_text",
                    "text": "Location",
                    "emoji": true
                  },
                  "optional": false
                },
                {
                  "type": "divider"
                },
                {
                  "type": "input",
                  "block_id": "desc",
                  "element": {
                    "type": "plain_text_input",
                    "action_id": "plain_text_input-action2"
                  },
                  "label": {
                    "type": "plain_text",
                    "text": "Description",
                    "emoji": true
                  },
                  "optional": false
                },
                {
                  "type": "divider"
                },
                {
                  "type": "input",
                  "block_id": "time",
                  "element": {
                    "type": "static_select",
                    "placeholder": {
                      "type": "plain_text",
                      "text": "Select an item",
                      "emoji": true
                    },
                    "options": [
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "11:00am",
                          "emoji": true
                        },
                        "value": "1100"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "11:30am",
                          "emoji": true
                        },
                        "value": "1130"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "12:00pm",
                          "emoji": true
                        },
                        "value": "1200"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "12:30pm",
                          "emoji": true
                        },
                        "value": "1230"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "1:00pm",
                          "emoji": true
                        },
                        "value": "1300"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "1:30pm",
                          "emoji": true
                        },
                        "value": "1330"
                      },
                      {
                        "text": {
                          "type": "plain_text",
                          "text": "2:00pm",
                          "emoji": true
                        },
                        "value": "1400"
                      }
                    ],
                    "action_id": "static_select-action"
                  },
                  "label": {
                    "type": "plain_text",
                    "text": "Time",
                    "emoji": true
                  },
                  "optional": false
                },
                {
                  "type": "divider"
                },
                {
                  "type": "actions",
                  "block_id": "takeBack",
                  "elements": [
                    {
                      "type": "checkboxes",
                      "options": [
                        {
                          "text": {
                            "type": "plain_text",
                            "text": "Take back to the office?",
                            "emoji": true
                          },
                          "description": {
                            "type": "plain_text",
                            "text": "Check this box if we are bringing food back to the office after picking it up.",
                            "emoji": true
                          },
                          "value": "true"
                        }
                      ],
                      "action_id": "actionId-0"
                    }
                  ]
                }
              ],
              submit: {
                type: 'plain_text',
                text: 'Submit'
              }
            }
          });
          break;
        case "list":
          const launches = await db.select().from(launchTable).where(eq(launchTable.date, (new Date()).toISOString().substring(0,10)))
          const launchBlocks = []
          launches.forEach((v) => {
            launchBlocks.push({
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `<@${v.authorId}>: ${v.name} (${v.time})`,
                "emoji": true
              }
            },
            {
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
                  "value": "passenger",
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
                  "value": "driver",
                  "action_id": "joinDriver"
                }
              ]
            })
          })

          const result2 = await client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: channelId,
            blocks: [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "Today's Launches",
                  "emoji": true
                }
              },
              ...launchBlocks
            ]
          })

          logger.info((new Date()).toDateString())
          break;
        default:
          logger.info("bad response")
          break;
      }
      
  
    } catch (error) {
      logger.error('Error handling slash command:', error);
    }
  });
};
