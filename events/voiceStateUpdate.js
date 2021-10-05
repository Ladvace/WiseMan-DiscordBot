const { userSchema } = require("../mongodb");
const logger = require("../modules/logger");
const { assignRankRole } = require("../utility");

module.exports = async (client, oldState, newState) => {
  if (newState.channel?.id && !oldState.channel?.id) {
    logger.log("Someone joined");
    const now = new Date();

    const userSchemaConfig = {
      id: `${newState.member.user.id}#${newState.guild.id}`,
      name: oldState.member.user.username,
      messages_count: 0,
      rank: 0,
      hours: 0,
      lastRankTime: now.getTime(),
      discordName: `${newState.member.user.username}#${newState.member.user.discriminator}`,
    };

    userSchema.findOne(
      {
        id: `${newState.member.user.id}#${newState.guild.id}`,
      },
      (err, user) => {
        if (err) console.log(err);
        if (!user) {
          const newUser = new userSchema(userSchemaConfig);

          return newUser.save();
        } else {
          const diff = user.lastRankTime - Date.now();
          const lastRankTimeSecs = diff / 1000;
          const lastRankTimeMinutes = Math.floor(lastRankTimeSecs / 60);
          const lastRankTimeHours = Math.floor(lastRankTimeMinutes / 60);

          const lessThan48Hours = lastRankTimeHours > 48;

          // const rank = lessThan48Hours ? Math.floor(minutes / 2) : minutes;
          if (lessThan48Hours && user.rank) user.rank = user.rank - 10;
          const rank = user.rank;

          // check for the rank and add a role (default or custom )
          assignRankRole(newState, client, rank);

          user.save();
        }
      }
    );

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
      userSchema.findOne(
        {
          id: `${oldState.id}#${oldState.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);

          if (user) {
            const diff = user.lastRankTime - Date.now();
            const lastRankTimeSecs = diff / 1000;
            const lastRankTimeMinutes = Math.floor(lastRankTimeSecs / 60);
            const lastRankTimeHours = Math.floor(lastRankTimeMinutes / 60);

            const lessThan48Hours = lastRankTimeHours > 48;

            const rank = lessThan48Hours ? Math.floor(minutes / 2) : minutes;

            user.rank = (user.rank ? user.rank : 0) + rank;
            user.lastRankTime = now.getTime();
            user.save();
          }
        }
      );
    }
  }
};
