module.exports = async (client, reaction) => {
  console.log("reaction", client.config.pollAnswers);
  // reaction.message.author.id

  client.config.pollAnswers[reaction.emoji.name] = reaction.count - 1;

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
