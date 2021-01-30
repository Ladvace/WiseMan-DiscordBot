const firebase = require("firebase");
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

    const users = firebase
      .firestore()
      .collection("users")
      .doc(`${newState.id}#${newState.guild.id}`);

    const user = await users.get();

    if (!user.exists) {
      firebase.firestore().collection("users").doc(id).set(userSchemaConfig);
    }

    client.config.timers[newState.guild.id] = {};
    client.config.intervals[newState.guild.id] = {};

    client.config.timers[newState.guild.id][newState.id] = setTimeout(() => {
      client.config.intervals[newState.guild.id][newState.id] = setInterval(
        async () => {
          if (user.exists) {
            // client.config.rankIncrementin24hCount[newState.guild.id][
            //   newState.id
            // ] += 1;

            await incrementRank(`${newState.id}#${newState.guild.id}`);

            await levelUp(
              newState.member,
              newState.guild.id,
              user.data().rank,
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
