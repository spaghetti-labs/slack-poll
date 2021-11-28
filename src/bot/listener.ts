import { MessageBlock } from "@slack/web-api/dist/response/ChatPostMessageResponse";
import { v4 } from "uuid";
import { getSlackApp } from "../slack";
import { Poll } from "./memory-poll";

export async function listen(
    port: number,
) {
    const app = getSlackApp()

    app.shortcut("poll/create-poll", async ({ shortcut, ack, say }) => {
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

        const options = blocks.filter(
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

        if (options.length < 2) {
            return
        } else {
            const poll = Poll.createPoll()
            for (const option of options) {
                poll.addOption(option)
            }

            await say({
                text: 'Poll',
                blocks: [
                    {
                        type: "section",
                        text: {
                            text: "Poll:",
                            type: "plain_text",
                        },
                    },
                    {
                        label: {
                            text: "Choice",
                            type: "plain_text",
                        },
                        type: "input",
                        element: {
                            type: "radio_buttons",
                            options: poll.options.map(
                                option => ({
                                    text: {
                                        text: option.text,
                                        type: 'plain_text',
                                    }
                                })
                            )
                        }
                    },
                ],
            })

            await ack()
        }
    })

    await app.start(port)
    console.log('⚡️ Slack-Poll is running!');
}
