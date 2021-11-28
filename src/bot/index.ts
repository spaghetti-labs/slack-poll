import { getSlackApp } from "../slack"

export async function listen() {
    const app = getSlackApp()

    await import("./global-shortcut")
    await import("./message-shortcut")
    await import("./form")
    await import("./send")
    await import("./reveal")

    await app.start()
    console.log('⚡️ Slack-Poll bot is running!');
}
