const { userSchema } = require("../mongodb");
const localConfig = require("../config.json");
const logger = require("../modules/logger");
const { assignRankRole } = require("../utility");

module.exports = async (client, oldState, newState) => {
  if (newState.channel?.id && !oldState.channel?.id) {
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

    console.log("aa", newState.member.user.id, newState.id);

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
          const rank = user.rank;

          console.log("RANK", rank);
          // check for the rank and add a role (default or custom )
          assignRankRole(newState, client, rank);

          user.save();
        }
      }
    );

    logger.log("Someone joined");

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
    const hours = Math.floor(minutes / 60);

    // const userSchemaConfig = {
    //   id: `${oldState.id}#${oldState.guild.id}`,
    //   name: oldState.member.user.username,
    //   messages_count: 0,
    //   rank: 0,
    //   hours: hours,
    //   lastRankTime: now.getTime(),
    //   discordName: `${oldState.member.user.username}#${oldState.member.user.discriminator}`,
    // };

    console.log(
      "TTT",
      difference,
      msToSec,
      minutes,
      !Number.isNaN(minutes),
      !Number.isNaN(hours)
    );
    if (!Number.isNaN(minutes)) {
      userSchema.findOne(
        {
          id: `${oldState.id}#${oldState.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          // if (!user) {
          //   const newUser = new userSchema(userSchemaConfig);

          //   return newUser.save();
          // } else {
          const diff = user.lastRankTime - Date.now();
          const lastRankTimeSecs = diff / 1000;
          const lastRankTimeMinutes = Math.floor(lastRankTimeSecs / 60);
          const lastRankTimeHours = Math.floor(lastRankTimeMinutes / 60);

          const lessThan48Hours = lastRankTimeHours > 48;

          const rank = lessThan48Hours ? Math.floor(minutes / 2) : minutes;

          console.log("TEST", lessThan48Hours, rank);

          user.rank = (user.rank ? user.rank : 0) + rank;
          user.save();
          // }
        }
      );
    }
  }
};
