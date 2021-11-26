const { userSchema, config } = require("../mongodb");
const logger = require("../modules/logger");
const { incrementRank, decrementRank } = require("../utility");

module.exports = async (client, oldState, newState) => {
  if (newState.channel?.id && !oldState.channel?.id) {
    logger.log("Someone joined");

    const now = new Date();

    const userSchemaConfig = {
      id: `${newState.member.user.id}#${newState.guild.id}`,
      name: oldState.member.user.username,
      guildId: newState.guild.id,
      lastRankTime: now.getTime(),
      discordName: `${newState.member.user.username}#${newState.member.user.discriminator}`,
    };

    const configSettings = {
      id: newState.guild.id,
      customRanks: {},
    };

    const server = await config.findOne({
      id: newState.guild.id,
    });

    if (!server) {
      const newServer = new config(configSettings);
      await newServer.save();
    }

    const user = await userSchema.findOne({
      id: `${newState.member.user.id}#${newState.guild.id}`,
    });

    if (!user) {
      const newUser = new userSchema(userSchemaConfig);
      await newUser.save();
    } else {
      const channel = newState.guild.channels.cache.get(
        server.notificationChannel
      );
      await incrementRank(user, null, client, channel, newState.member);
    }

    client.container.users[newState.member.user.id] = {
      start: now.getTime(),
    };
  } else if (oldState.channel?.id && !newState.channel?.id) {
    logger.log("Someone left");

    const startTimestamp =
      client.container.users[oldState.member.user.id]?.start;
    const now = new Date();

    const difference = now.getTime() - startTimestamp;
    const msToSec = difference / 1000;
    const minutes = Math.floor(msToSec / 60);

    if (!Number.isNaN(minutes)) {
      const user = await userSchema.findOne({
        id: `${oldState.id}#${oldState.guild.id}`,
      });

      if (user) {
        const diff = Date.now() - user.lastRankTime;
        const lastRankTimeSecs = diff / 1000;
        const lastRankTimeMinutes = Math.floor(lastRankTimeSecs / 60);
        const lastRankTimeHours = Math.floor(lastRankTimeMinutes / 60);

        // if the user hasn't been activer for at least 2 weeks he is going to lose some ranks
        const lessThan2WeeksHours = lastRankTimeHours > 336;

        if (lessThan2WeeksHours && user.rank)
          decrementRank(user, client, newState.member);

        user.lastRankTime = now.getTime();
        user.time = user.time + difference;
        user.exp = user.exp + difference;
        await user.save();
      }

      client.container.users[newState.member.user.id] = {
        start: null,
      };
    }
  }
};
