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
    }: {
        channelId: string,
        optionTexts: string[],
        userId,
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
    })
    await poll.save()

    await app.client.chat.postMessage({
        channel: channelId,
        text: 'Poll',
        blocks: [
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