const { userSchema } = require("../mongodb");
const { incrementRank, levelUp } = require("../utility");
const localConfig = require("../config.json");

module.exports = async (client, oldState, newState) => {
  const millisPerHour = 60 * localConfig.minutes * 1000; //1h
  const millisPastTheHour = Date.now() % millisPerHour;
  const millisToTheHour = millisPerHour - millisPastTheHour;

  if (newState.channelID && !oldState.channelID) {
    console.log("Someone joined");

    const userSchemaConfig = {
      id: `${newState.id}#${newState.guild.id}`,
      name: newState.member.user.username,
      messages_count: 0,
      rank: 0,
      discordName: `${newState.member.user.username}#${newState.member.user.discriminator}`,
    };

    const user = await userSchema.findOne(
      {
        id: `${newState.id}#${newState.guild.id}`,
      },
      (err, user) => {
        if (err) console.log(err);
        if (!user) {
          if (newState.id === client.user.id) return;
          const newUser = new userSchema(userSchemaConfig);

          return newUser.save();
        }
      }
    );

    console.log("FFF", newState.guild.id, newState.id);

    client.config.timers[newState.guild.id] = {};
    client.config.intervals[newState.guild.id] = {};

    client.config.timers[newState.guild.id][newState.id] = setTimeout(() => {
      client.config.intervals[newState.guild.id][newState.id] = setInterval(
        async () => {
          if (user) {
            await incrementRank(
              `${newState.id}#${newState.guild.id}`,
              newState.member.user.username,
              newState.member.user.discriminator
            );

            const user1 = await userSchema.findOne(
              {
                id: `${newState.id}#${newState.guild.id}`,
              },
              (err, user) => {
                if (err) console.log(err);
                if (!user) {
                  if (newState.id === client.user.id) return;
                  const newUser = new userSchema(userSchemaConfig);

                  return newUser.save();
                }
              }
            );

            await levelUp(
              newState.member,
              newState.guild.id,
              user1.rank,
              client
            );
          }
        },
        millisPerHour
      );
    }, millisToTheHour);
  } else if (oldState.channelID && !newState.channelID) {
    console.log("Someone left");

    try {
      if (
        client.config.timers[newState.guild.id][newState.id] &&
        client.config.intervals[newState.guild.id][newState.id]
      ) {
        console.log("clear");
        clearTimeout(client.config.timers[oldState.guild.id][newState.id]);
        clearInterval(client.config.intervals[oldState.guild.id][newState.id]);
      }
    } catch (e) {
      console.error(e);
    }
  }
};
