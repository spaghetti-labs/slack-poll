#!/usr/bin/env node

import Yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { listen } from "./bot/listener"
import { connectDB } from "./db"
import { connectSlack } from "./slack"

async function setup(
    db: string,
    signingSecret: string,
    appToken: string,
    botToken: string,
) {
    await connectDB(db)
    await connectSlack(signingSecret, appToken, botToken)
}

Yargs(hideBin(process.argv))
    .scriptName('slack-poll')
    .completion()
    .help()

    .option('db', {
        default: 'db.sqlite',
        demandOption: true,
    })
    .option('signing-secret', {
        type: 'string',
        demandOption: true,
    })
    .option('bot-token', {
        type: 'string',
        demandOption: true,
    })
    .option('app-token', {
        type: 'string',
        demandOption: true,
    })
    .middleware(argv => setup(
        argv.db,
        argv["signing-secret"],
        argv["app-token"],
        argv["bot-token"],
    ))

    .option('port', {
        default: 3000,
        demandOption: true,
    })

    .command(
        '$0',
        'Run the bot',
        args => args,
        async argv => {
            await listen(argv.port)
        }
    )

    .argv
