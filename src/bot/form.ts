import { getSlackApp } from "../slack"
import { createPoll } from "./create"

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
    
    if (optionTexts.length < 2) {
        return
    }

    await createPoll({
        channelId: channel,
        optionTexts,
        userId: user.id,
    })

    await ack()
})