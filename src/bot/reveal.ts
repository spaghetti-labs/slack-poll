import { DividerBlock, SectionBlock } from "@slack/bolt"
import { OptionEntity } from "../entities/option"
import { PollEntity } from "../entities/poll"
import { VoteEntity } from "../entities/vote"
import { getSlackApp } from "../slack"

const app = getSlackApp()

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
