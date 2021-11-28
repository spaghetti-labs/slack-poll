import { DividerBlock, SectionBlock } from "@slack/types";
import { v4 } from "uuid";
import { OptionEntity } from "../entities/option";
import { PollEntity } from "../entities/poll";
import { VoteEntity } from "../entities/vote";
import { VoteRightEntity } from "../entities/vote-right";
import { getSlackApp } from "../slack";

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
        } else {
            const { members } = await app.client.conversations.members({
                channel: shortcut.channel.id,
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
                userId: shortcut.user.id,
                options,
                voteRights,
            })
            await poll.save()

            await say({
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

            await ack()
        }
    })

    app.action(/^poll\/.*\/send$/, async ({ action, ack, body: { user } }) => {
        if (action.type !== 'button') {
            return
        }
        
        const optionId = action.value
        const userId = user.id

        const option = await OptionEntity.findOne(optionId, {relations: ['poll']})
        if (option == null) {
            return
        }
        
        const poll = option.poll

        const voteRight = await VoteRightEntity.findOne({
            where: {
                poll,
                userId,
            },
            relations: ['vote'],
        })

        if (voteRight == null) {
            return
        }

        const vote = VoteEntity.create({
            voteRight,
            option,
        })
        await VoteEntity.save(vote)

        await ack()
    })

    app.action(/^poll\/.*\/reveal$/, async ({ action, ack, body: { user, channel } }) => {
        if (action.type !== 'button') {
            return
        }
        
        const pollId = action.value
        const userId = user.id

        const poll = await PollEntity.findOne(pollId)
        if (poll == null) {
            return
        }
        
        if (poll.userId !== userId) {
            return
        }

        const options = await OptionEntity.find({
            where: {
                poll,
            },
        })
        const counts: {option: OptionEntity, voteCount: number}[] = []
        for (const option of options) {
            const voteCount = await VoteEntity.count({
                where: {
                    option,
                },
            })
            counts.push({
                option,
                voteCount,
            })
        }
        counts.sort((a, b) => b.voteCount - a.voteCount)
        const totalVoteCount = counts.reduce(
            (total, {voteCount}) => total + voteCount,
            0,
        )

        await app.client.chat.postMessage({
            channel: channel.id,
            text: 'Poll results',
            blocks: [
                {
                    type: "section",
                    text: {
                        text: `Poll results with ${totalVoteCount} vote${totalVoteCount === 1 ? '' : 's'}`,
                        type: 'mrkdwn',
                    },
                },
                ...counts.flatMap(
                    ({option, voteCount}) => [
                        {
                            type: "divider",
                        } as DividerBlock,
                        {
                            type: "section",
                            text: {
                                text: `*${voteCount} Vote${voteCount === 1 ? '' : 's'}*: _${option.text}_`,
                                type: 'mrkdwn',
                            }
                        } as SectionBlock,
                    ]
                ),
            ],
        })

        await ack()
    })

    await app.start(port)
    console.log('⚡️ Slack-Poll is running!');
}
