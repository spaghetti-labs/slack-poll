import { getSlackApp } from "../slack"
import { createPoll } from "./create"
import moment from "moment-timezone"

const app = getSlackApp()

app.view(/.*/, async ({ view, ack, body: { user } }) => {
    if (view.type !== "modal") {
        return
    }

    const optionList = view.state.values.optionList.optionList.value
    const optionTexts = optionList
        .split(/[\r\n]+/gm)
        .map(line => line.trim())
        .filter(line => line.length > 0)

    const channel = view.state.values.channel.channel.selected_conversation

    const userInfo = await app.client.users.info({user: user.id})
    if(!userInfo.ok) {
        return
    }
    
    const deadlineDate = view.state.values.deadlineDate.deadlineDate.selected_date
    const deadlineTime = view.state.values.deadlineTime.deadlineTime.selected_time
    const deadlineUTC = moment.tz(`${deadlineDate} ${deadlineTime}`, userInfo?.user.tz).utc()
    
    if (optionTexts.length < 2) {
        return
    }

    if(moment.utc() > deadlineUTC) {
        return
    }

    await createPoll({
        channelId: channel,
        optionTexts,
        userId: user.id,
        deadlineUTC,
    })

    await ack()
})