const { config, userSchema } = require("../mongodb");
const localConfig = require("../config.json");
const { incrementRank, levelUp } = require("../utility");

module.exports = async (client) => {
  console.log("Ready!");

  client.config.timers = {};
  client.config.intervals = {};
  client.config.pollAnswers = {};
  client.config.reactionCount = {};
  client.config.usersReaction = {};
  client.config.polls = {};
  client.config.poolSolution = {};

  const millisPerHour = 60 * localConfig.minutes * 1000; //1h
  const millisPastTheHour = Date.now() % millisPerHour;
  const millisToTheHour = millisPerHour - millisPastTheHour;

  client.guilds.cache.keyArray().map(async (x) => {
    await config.findOne(
      {
        id: x,
      },
      (err, server) => {
        if (err) console.log(err);
        if (!server) {
          const newServer = new config({
            id: x,
            guildPrefix: "!",
            guildNotificationChannelID: null,
            welcomeChannel: null,
            customRanks: {},
            rankTime: null,
          });

          return newServer.save();
        }
      }
    );
  });

  client.channels.cache.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        const userSchemaConfig = {
          id: `${y.user.id}#${x.guild.id}`,
          name: y.user.username,
          messages_count: 0,
          rank: 0,
          discordName: `${y.user.username}#${y.user.discriminator}`,
        };

        await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              if (y.user.id === client.user.id) return;
              const newUser = new userSchema(userSchemaConfig);

              return newUser.save();
            }
          }
        );

        const user = await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              if (y.user.id === client.user.id) return;
              const newUser = new userSchema(userSchemaConfig);

              return newUser.save();
            }
          }
        );

        client.config.timers[x.guild.id] = {};
        client.config.intervals[x.guild.id] = {};
        client.config.timers[x.guild.id][y.user.id] = setTimeout(async () => {
          console.log("start");
          client.config.intervals[x.guild.id][y.user.id] = setInterval(
            async () => {
              if (user) {
                await incrementRank(
                  `${y.user.id}#${x.guild.id}`,
                  y.user.username,
                  y.user.discriminator
                );

                const user1 = await userSchema.findOne(
                  {
                    id: `${y.user.id}#${x.guild.id}`,
                  },
                  (err, user) => {
                    if (err) console.log(err);
                    if (!user) {
                      if (y.user.id === client.user.id) return;
                      const newUser = new userSchema(userSchemaConfig);

                      return newUser.save();
                    }
                  }
                );

                await levelUp(y, x.guild.id, user1.rank, client);
              }
            },
            millisPerHour
          );
        }, millisToTheHour);
      });
    }
  });
};
