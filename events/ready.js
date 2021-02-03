const firebase = require("firebase");
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
  // client.config.rankIncrementin24hCount = {};

  const millisPerHour = 60 * localConfig.minutes * 1000; //1h
  const millisPastTheHour = Date.now() % millisPerHour;
  const millisToTheHour = millisPerHour - millisPastTheHour;

  client.config.serverSettings = {};

  client.guilds.cache.keyArray().map(async (x) => {
    const configSettings = {
      id: x,
      guildPrefix: "!",
      guildNotificationChannelID: null,
      welcomeChannel: null,
      customRanks: {},
      rankTime: null,
      defaultRole: null,
    };

    const serverRef = firebase.firestore().collection("servers").doc(x);

    const server = await serverRef.get();

    if (!server.exists) {
      firebase.firestore().collection("servers").doc(x).set(configSettings);
    }

    // const RemotePrefix = server.data();

    client.config.serverSettings[x] = server.data();
  });

  client.channels.cache.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        const userSchemaConfig = {
          serverName: x.guild.name,
          id: `${y.user.id}#${x.guild.id}`,
          name: y.user.username,
          messages_count: 0,
          rank: 0,
          discordName: `${y.user.username}#${y.user.discriminator}`,
        };

        const userRef = firebase
          .firestore()
          .collection("users")
          .doc(`${y.user.id}#${x.guild.id}`);

        const user = await userRef.get();

        if (!user.exists) {
          firebase
            .firestore()
            .collection("users")
            .doc(`${y.user.id}#${x.guild.id}`)
            .set(userSchemaConfig);
        }

        console.log("user exist");
        client.config.timers[x.guild.id] = {};
        client.config.intervals[x.guild.id] = {};
        client.config.timers[x.guild.id][y.user.id] = setTimeout(async () => {
          console.log("start");

          // client.config.rankIncrementin24hCount[x.guild.id] = {
          //   [y.user.id]: 0,
          // };

          client.config.intervals[x.guild.id][y.user.id] = setInterval(
            async () => {
              // const rankIncrementin24hCount =
              //   client.config.rankIncrementin24hCount[x.guild.id][y.user.id];

              // if (rankIncrementin24hCount === 0) {
              //   await decrementRank(
              //     `${y.user.id}#${x.guild.id}`,
              //     y.user.username,
              //     y.user.discriminator
              //   );
              // }

              // if (user) {
              // client.config.rankIncrementin24hCountrankIncrementin24hCount[
              //   x.guild.id
              // ][y.user.id] += 1;

              await incrementRank(`${y.user.id}#${x.guild.id}`);

              await levelUp(y, x.guild.id, user.data().rank, client);
              // }
            },
            millisPerHour
          );
        }, millisToTheHour);
      });
    }
  });
};
