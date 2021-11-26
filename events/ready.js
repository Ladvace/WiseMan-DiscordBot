const logger = require("../modules/logger");

module.exports = async (client) => {
  logger.log("Ready!");

  client.container.users = {};
  client.config.pollAnswers = {};
  client.config.poolSolution = {};
};
