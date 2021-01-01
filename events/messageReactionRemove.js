module.exports = async (client, reaction, user) => {
  if (user.id === client.user.id) return;
  const userId = user.id;
  const postId = reaction.message.id;

  const reactionCount =
    client.config.reactionCount[userId][postId]?.reactionCount;

  const { message } = reaction;
  const userCount = reactionCount?.get(message);

  if (userCount && reactionCount.get(message).get(user) > 0)
    userCount.set(user, reactionCount.get(message).get(user) - 1);
};
