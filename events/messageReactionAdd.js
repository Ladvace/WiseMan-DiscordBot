module.exports = async (client, reaction, user) => {
  const userId = user.id;
  const botId = client.user.id;
  const postId = reaction.message.channel.lastMessageID;

  client.config.usersReactions[userId] = {};
  client.config.usersReactions[userId][postId] = {};

  const embedPoll = await reaction.message.channel.messages.fetch(postId);
  const emoji = reaction.emoji.name;
  const emojiId = reaction.emoji.reaction.message.id;
  const votedEmoji = client.config.usersReactions[userId][postId];

  if (Number.isInteger(parseInt(votedEmoji, 10)) && votedEmoji !== emojiId) {
    if (userId !== botId)
      embedPoll.reactions.cache.get(emoji).users.remove(userId);
  } else {
    client.config.usersReactions[userId][postId] = emojiId;
  }

  // client.config.pollAnswers[postId][emoji] = reaction.count - 1;
  client.config.pollAnswers[postId] = {
    ...client.config.pollAnswers[postId],
    [emoji]: reaction.count - 1,
  };

  if (reaction.partial) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }
};
