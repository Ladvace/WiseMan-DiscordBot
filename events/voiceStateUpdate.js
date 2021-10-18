const { userSchema } = require("../mongodb");
const logger = require("../modules/logger");
const { assignRankRole, incrementRank } = require("../utility");

module.exports = async (client, oldState, newState) => {
  if (newState.channel?.id && !oldState.channel?.id) {
    logger.log("Someone joined");
    const now = new Date();

    const userSchemaConfig = {
      id: `${newState.member.user.id}#${newState.guild.id}`,
      name: oldState.member.user.username,
      messages_count: 0,
      rank: 0,
      time: 0,
      guildId: newState.guild.id,
      lastRankTime: now.getTime(),
      discordName: `${newState.member.user.username}#${newState.member.user.discriminator}`,
    };

    const user = await userSchema.findOne({
      id: `${newState.member.user.id}#${newState.guild.id}`,
    });

    if (!user) {
      const newUser = new userSchema(userSchemaConfig);
      await newUser.save();
    } else {
      const rank = user.rank;

      const nextLevelExp = 5000 * (Math.pow(2, rank) - 1);

      const exp = user.time;

      if (exp >= nextLevelExp) {
        await incrementRank(user);
      }

      user.save();
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
    // const hours = Math.floor(minutes / 60);

    if (!Number.isNaN(minutes)) {
      const user = await userSchema.findOne({
        id: `${oldState.id}#${oldState.guild.id}`,
      });
      if (user) {
        const diff = Date.now() - user.lastRankTime;
        const lastRankTimeSecs = diff / 1000;
        const lastRankTimeMinutes = Math.floor(lastRankTimeSecs / 60);
        const lastRankTimeHours = Math.floor(lastRankTimeMinutes / 60);

        const lessThan48Hours = lastRankTimeHours > 48;

        if (lessThan48Hours && user.rank) user.rank = user.rank - 20;

        user.lastRankTime = now.getTime();
        user.time = user.time + difference;
        await user.save();
      }

      client.container.users[newState.member.user.id] = {
        start: null,
      };
    }
  }
};
