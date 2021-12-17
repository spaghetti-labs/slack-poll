import { getSlackApp } from "../slack"

const app = getSlackApp()

app.shortcut("poll/create-poll-form", async ({ shortcut, ack }) => {
    if (shortcut.type !== 'shortcut') {
        return
    }

    await app.client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
            title: {
                text: "Start a new poll",
                type: "plain_text",
            },
            type: "modal",
            submit: {
                text: "Start poll",
                type: "plain_text",
            },
            close: {
                text: "Cancel",
                type: "plain_text",
            },
            blocks: [
                {
                    block_id: 'channel',
                    label: {
                        text: "Converstation",
                        type: "plain_text",
                    },
                    type: "input",
                    element: {
                        action_id: 'channel',
                        type: "conversations_select",
                        default_to_current_conversation: true,
                    },
                },
                {
                    block_id: 'optionList',
                    label: {
                        text: "Options, one per line",
                        type: "plain_text",
                    },
                    type: "input",
                    element: {
                        action_id: 'optionList',
                        type: "plain_text_input",
                        multiline: true,
                        initial_value: "Option 1\nOption 2",
                    },
                },
                {
                    block_id: 'deadlineDate',
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Pick a date for the poll deadline."
                    },
                    accessory: {
                        type: "datepicker",
                        initial_date: "2021-12-17",
                        placeholder: {
                            type: "plain_text",
                            text: "Select a date",
                            emoji: true
                        },
                        action_id: "deadlineDate"
                    }
                },
                {
                    block_id: 'deadlineTime',
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Pick time for the poll deadline."
                    },
                    accessory: {
                        type: "timepicker",
                        initial_time: "22:00",
                        placeholder: {
                            type: "plain_text",
                            text: "Select time",
                            emoji: true
                        },
                        action_id: "deadlineTime"
                    }
                }
            ],
        },
    })

    await ack()
})