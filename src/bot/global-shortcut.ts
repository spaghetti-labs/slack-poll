import { getSlackApp } from "../slack"
import moment from "moment-timezone"

const app = getSlackApp()

app.shortcut("poll/create-poll-form", async ({ shortcut, ack, body: { user } }) => {
    if (shortcut.type !== 'shortcut') {
        return
    }

    const userInfo = await app.client.users.info({user: user.id})
    if(!userInfo.ok) {
        return
    }
    
    const momentTomorrowNextHourUTC = moment.tz(userInfo?.user.tz).add(1, "day").add(1, "hour").startOf('hour')
    const initialDateStr = momentTomorrowNextHourUTC.format("YYYY-MM-DD")
    const initialTimeStr = momentTomorrowNextHourUTC.format("HH:mm")

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
                    type: "input",
                    element: {
                        type: "datepicker",
                        initial_date: initialDateStr,
                        placeholder: {
                            type: "plain_text",
                            text: "Select a date",
                            emoji: true,
                        },
                        action_id: "deadlineDate",
                    },
                    label: {
                        type: "plain_text",
                        text: "Deadline date",
                    },
                },
                {
                    block_id: 'deadlineTime',
                    type: "input",
                    element: {
                        type: "timepicker",
                        initial_time: initialTimeStr,
                        placeholder: {
                            type: "plain_text",
                            text: "Select time",
                            emoji: true,
                        },
                        action_id: "deadlineTime",
                    },
                    label: {
                        type: "plain_text",
                        text: "Deadline time",
                    },
                }
            ],
        },
    })

    await ack()
})