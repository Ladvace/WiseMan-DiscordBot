const logger = require("../modules/logger");

module.exports = async (client) => {
  logger.log("Ready!");

  client.container.users = {};
  client.config.pollAnswers = {};
  // client.config.reactionCount = {};
  // client.config.usersReaction = {};
  // client.config.polls = {};
  client.config.poolSolution = {};
};
