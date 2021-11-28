import { getSlackApp } from "../slack"
import { createPoll } from "./create"

const app = getSlackApp()

app.shortcut("poll/create-poll", async ({ shortcut, ack }) => {
    if (shortcut.type !== 'message_action') {
        return
    }
    
    const message = shortcut.message
    if (message.type !== 'message') {
        return
    }

    const blocks = message.blocks
    if (!message.blocks) {
        return
    }

    const optionTexts: string[] = blocks.filter(
        block => block.type === 'rich_text'
    ).flatMap(
        block => block.elements
    ).filter(
        element => element.type === 'rich_text_list'
    ).flatMap(
        element => element.elements
    ).filter(
        element => element.type === 'rich_text_section'
    ).map(
        element => element.elements[0]
    ).filter(
        element => element.type === 'text'
    ).map(
        element => element.text
    )

    if (optionTexts.length < 2) {
        return
    }
    
    await createPoll({
        channelId: shortcut.channel.id,
        optionTexts,
        userId: shortcut.user.id,
    })

    await ack()
})