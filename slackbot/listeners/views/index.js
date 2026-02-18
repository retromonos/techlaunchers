import { db } from "../../app.js";
import { launchTable } from "../../schema.js";

export const register = (app) => {
  app.view('launch_create', async ({ ack, body, view, logger }) => {
    await ack();

    const user = body.user.id

    const location = view.state.values.location['plain_text_input-action'].value;
    const desc = view.state.values.desc['plain_text_input-action2'].value;
    const time = view.state.values.time['static_select-action'].selected_option.value;
    const takeBack = view.state.values.takeBack['actionId-0'].selected_options != []

    const hrs = time.substring(0,2)
    const mins = time.substring(2,4)
    const date = new Date()

    date.setHours(parseInt(hrs))
    date.setMinutes(parseInt(mins))
    date.setSeconds(0)

    // date is now processed
    const newLaunch = await db.insert(launchTable).values({
      name: location,
      desc: desc,
      authorId: user,
      date: date,
      time: hrs+":"+mins,
      takeBack: takeBack
    }).returning()

    logger.info(newLaunch)
  });
};
