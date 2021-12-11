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

    var { members }: any = await app.client.conversations.members({
      // Getting conversation's members list
      channel: channelId,
    })
  
    const users = await app.client.users.list() // Getting all users list
    const allUsers = users.members.map((m) => m.id) // Getting all user's ID list
    const allUsersIsBot = users.members.map((m) => m.is_bot) // Getting all users's is_bot parameters
  
    var verifiedUsers = []
    var conversationMembers = []
  
    for (let i = 0; i < allUsersIsBot.length; i++) {
      // Getting users which is not bot with query is_bot: false
      if (allUsersIsBot[i] == false) {
        verifiedUsers.push(allUsers[i]) // Adding results to verifiedUsers array
      }
    }
  
    for (let x = 0; x < members.length; x++) {
      // Eliminating users which is not in the conversation
      for (let i = 0; i < verifiedUsers.length; i++) {
        // It is necessary because conversations.members API method is not giving conversation's is_bot info
        if (members[x] == verifiedUsers[i]) {
          conversationMembers.push(members[x]) // Adding results to conversationMembers array
        }
      }
    }

    var conversationMembers = conversationMembers.filter(item => item !== "USLACKBOT") // Removing "USLACKBOT" item from array because It is fake bot

    var members: any = conversationMembers // Changing members variable with updated and filtered one

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
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `<@${userId}> has started a new poll!`
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