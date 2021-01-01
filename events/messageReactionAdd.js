const { Collection } = require("discord.js");
const reactionCount = new Collection();
// const polls = new Set();

module.exports = async (client, reaction, user) => {
  if (user.id === client.user.id) return;
  const userId = user.id;
  const postId = reaction.message.id;

  const embedPoll = await reaction.message.channel.messages.fetch(postId);
  const currentEmoji = reaction.emoji.name;

  client.config.reactionCount[userId] = {
    ...client.config.reactionCount[userId],
  };

  // console.log(
  //   "pino",
  //   postId,
  //   client.config.reactionCount[userId]
  //   // client.config.reactionCount[userId][postId]
  // );

  const emoji = client.config.reactionCount[userId].hasOwnProperty(postId)
    ? client.config.reactionCount[userId][postId]?.currentEmoji
    : null;

  const { message } = reaction;

  if (!reactionCount.get(message)) reactionCount.set(message, new Collection());

  const userCount = reactionCount.get(message);

  if (emoji && currentEmoji !== emoji) {
    client.config.reactionCount[userId] = {
      [postId]: {
        reactionCount,
        currentEmoji,
      },
    };

    console.log("NON SO", emoji, embedPoll.reactions.cache.get(emoji));

    embedPoll.reactions.cache.get(emoji).users.remove(userId);
  } else {
    userCount.set(user, (userCount.get(user) || 0) + 1);

    client.config.reactionCount[userId] = {
      [postId]: {
        reactionCount,
        currentEmoji,
      },
    };

    client.config.pollAnswers[postId] = {
      ...client.config.pollAnswers[postId],
      [currentEmoji]: reaction.count,
    };
  }

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
