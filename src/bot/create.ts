import { SectionBlock } from "@slack/types"
import { v4 } from "uuid"
import { OptionEntity } from "../entities/option"
import { PollEntity } from "../entities/poll"
import { VoteRightEntity } from "../entities/vote-right"
import { getSlackApp } from "../slack"

export async function createPoll(
    {
        channelId,
        optionTexts,
        userId,
        deadline
    }: {
        channelId: string,
        optionTexts: string[],
        userId,
        deadline: Date
    }
) {
    const app = getSlackApp()

    const { members } = await app.client.conversations.members({
        channel: channelId,
    })

    const options = optionTexts.map(
        option => OptionEntity.create({
            id: v4(),
            text: option,
        })
    )
    const voteRights = members.map(
        member => VoteRightEntity.create({
            id: v4(),
            userId: member,
        })
    )
    const poll = PollEntity.create({
        id: v4(),
        userId,
        options,
        voteRights,
        deadline,
    })
    await poll.save()

    await app.client.chat.postMessage({
        channel: channelId,
        text: 'Poll',
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `<@${userId}> has started a new poll! Ends on ${deadline.toLocaleDateString("en-US", {weekday: "short", year: "numeric", month:"short", day:"2-digit", hour12 : true, hour: "2-digit", minute: "2-digit", second: "2-digit"})}`
                }
            },
            ...options.map(
                option => ({
                    type: "section",
                    text: {
                        text: option.text,
                        type: "plain_text",
                    },
                    accessory: {
                        type: "button",
                        action_id: `poll/${poll.id}/send`,
                        value: option.id,
                        text: {
                            text: "Vote",
                            type: "plain_text",
                        },
                        confirm: {
                            style: 'primary',
                            title: {
                                text: 'Vote',
                                type: 'plain_text',
                            },
                            text: {
                                text: 'Vote cannot be reverted. Are you sure to send?',
                                type: 'plain_text',
                            },
                            confirm: {
                                text: 'Send vote',
                                type: 'plain_text',
                            },
                            deny: {
                                text: 'Cancel',
                                type: 'plain_text',
                            },
                        },
                    },
                }) as SectionBlock,
            ),
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            text: "Reveal the results",
                            type: "plain_text",
                        },
                        action_id: `poll/${poll.id}/reveal`,
                        value: poll.id,
                        confirm: {
                            style: 'primary',
                            title: {
                                text: 'Reveal',
                                type: 'plain_text',
                            },
                            text: {
                                text: 'The poll results will be visible to all members. Are you sure to reveal?',
                                type: 'plain_text',
                            },
                            confirm: {
                                text: 'Reval the results',
                                type: 'plain_text',
                            },
                            deny: {
                                text: 'Cancel',
                                type: 'plain_text',
                            },
                        },
                    },
                ],
            },
        ],
    })
}