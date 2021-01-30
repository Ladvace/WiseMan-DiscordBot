const Discord = require("discord.js");
const firebase = require("firebase");

const incrementRank = async (id) => {
  const users = firebase.firestore().collection("users").doc(id);

  const user = await users.get();

  if (user.exists) {
    firebase
      .firestore()
      .collection("users")
      .doc(id)
      .update({ rank: (user.data().rank && 0) + 1 });
  }
};

const decrementRank = async (id) => {
  const users = firebase.firestore().collection("users").doc(id);

  const user = await users.get();

  if (user.exists) {
    firebase
      .firestore()
      .collection("users")
      .doc(id)
      .update({ rank: (user.data().rank && 0) - 1 });
  }
};

const incrementMessages = async (id) => {
  const users = firebase.firestore().collection("users").doc(id);

  const user = await users.get();

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
  console.log("level up");

  const users = firebase.firestore().collection("servers").doc(guildId);

  const user = await users.get();
  const channel = await user.data();

  const hasCustomRank = channel.customRanks.hasOwnProperty(level);

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.user.username)
    .setColor("#8966ff")
    .setThumbnail(message.user.avatarURL({ format: "png" }))
    .addField("Rank", `${level}`);

  const notificationChannel = client.channels.cache.get(
    channel.guildNotificationChannelID
  );

  const customRankId = channel.customRanks[level];
  const roleExist = message.guild.roles.cache.has(customRankId);
  if (hasCustomRank && roleExist) {
    const customRole = message.guild.roles.cache.get(customRankId);

    console.log("customRole", customRole);

    message.roles
      .add(customRole)
      .then(() => {
        console.log("guildNotificationChannelID", notificationChannel);
        if (channel.guildNotificationChannelID)
          return notificationChannel.send(embed);
      })
      .catch((e) => console.error("error", e));
  }
};

module.exports = { incrementRank, decrementRank, incrementMessages, levelUp };
