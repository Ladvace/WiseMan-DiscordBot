const Discord = require("discord.js");
const firebase = require("firebase");

const incrementRank = async (id) => {
  const userRef = firebase.firestore().collection("users").doc(id);

  const user = await userRef.get();

  if (user.exists) {
    userRef.update({ rank: (user.data().rank && 0) + 1 });
  }
};

const decrementRank = async (id) => {
  const userRef = firebase.firestore().collection("users").doc(id);

  const user = await userRef.get();

  if (user.exists) {
    userRef.update({ rank: (user.data().rank && 0) - 1 });
  }
};

const incrementMessages = async (id) => {
  const userRef = firebase.firestore().collection("users").doc(id);

  const user = await userRef.get();

  if (user.exists) {
    firebase
      .firestore()
      .collection("users")
      .doc(id)
      .update({ messages_count: user.data().messages_count + 1 });
  }
};

const levelUp = async (message, guildId, level, client) => {
  if (message.user.id === client.user.id) return;

  const serverRef = firebase.firestore().collection("servers").doc(guildId);

  const server = await serverRef.get();
  const serverSettings = await server.data();

  const hasCustomRank = serverSettings.customRanks.hasOwnProperty(level);

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.user.username)
    .setColor("#8966ff")
    .setThumbnail(message.user.avatarURL({ format: "png" }))
    .addField("Rank", `${level}`);

  const notificationChannel = client.channels.cache.get(
    serverSettings.guildNotificationChannelID
  );

  const customRankId = serverSettings.customRanks[level];
  const roleExist = message.guild.roles.cache.has(customRankId);
  if (hasCustomRank && roleExist) {
    const customRole = message.guild.roles.cache.get(customRankId);

    message.roles
      .add(customRole)
      .then(() => {
        if (serverSettings.guildNotificationChannelID)
          return notificationChannel.send(embed);
      })
      .catch((e) => console.error("error", e));
  }
};

module.exports = { incrementRank, decrementRank, incrementMessages, levelUp };
