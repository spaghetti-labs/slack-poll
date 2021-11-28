import { SectionBlock } from "@slack/types";
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
                        }) as SectionBlock
                    ),
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
            },
            relations: ['vote'],
        })

        if (voteRight == null) {
            return
        }

        if (voteRight.vote != null) {
            return
        }

        const vote = VoteEntity.create({
            voteRight,
            option,
        })
        await VoteEntity.save(vote)

        await ack()
    })

    await app.start(port)
    console.log('⚡️ Slack-Poll is running!');
}
