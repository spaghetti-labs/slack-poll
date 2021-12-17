import { OptionEntity } from "../entities/option"
import { VoteEntity } from "../entities/vote"
import { VoteRightEntity } from "../entities/vote-right"
import { getSlackApp } from "../slack"

const app = getSlackApp()

app.action(/^poll\/.*\/send$/, async ({ action, ack, body }) => {
    if (action.type !== 'button' || !('message' in body)) {
        return
    }

    const optionId = action.value
    const userId = body.user.id

    const option = await OptionEntity.findOne(optionId, {relations: ['poll']})
    if (option == null) {
        return
    }
    
    const poll = option.poll

    if(new Date() > poll.deadline) {
        body.message.blocks = [body.message.blocks[0], {
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": "DEADLINED!",
					"emoji": true
				}
			]
		}, body.message.blocks[body.message.blocks.length - 1]]

        await app.client.chat.update({
            channel: body.channel.id,
            ...body.message,
        })
    
        await ack()
        return
    }

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

    const totalVoteCount = await VoteEntity.count({
        where: {
            option: {
                poll,
            },
        },
        relations: ['option'],
    })

    const revealButton = body.message.blocks[body.message.blocks.length - 1].elements[0]
    revealButton.text.text = `Reveal the results of ${totalVoteCount} vote${totalVoteCount === 1 ? '' : 's'}`

    await app.client.chat.update({
        channel: body.channel.id,
        ...body.message,
    })

    await ack()
})