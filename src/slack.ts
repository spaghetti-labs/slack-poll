import { App } from "@slack/bolt";

let app: App;

export async function connectSlack(
    signingSecret: string,
    appToken: string,
    botToken: string,
) {
    app = new App({
        signingSecret,
        appToken,
        token: botToken,
        socketMode: true,
    })
    await app.client.api.test()
}

export function getSlackApp(): App {
    return app
}
