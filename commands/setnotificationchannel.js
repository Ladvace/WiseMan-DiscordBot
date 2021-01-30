const Discord = require("discord.js");
const firebase = require("firebase");

exports.run = async (client, message, args) => {
  const configSettings = {
    id: message.guild.id,
    guildPrefix: "!",
    guildNotificationChannelID: null,
    welcomeChannel: null,
    customRanks: {},
    rankTime: null,
    defaultRole: null,
  };

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  const channelId = args[0];

  if (isAdmin) {
    const channelName = client.channels.cache.get(channelId)?.name;

    const serverRef = firebase
      .firestore()
      .collection("servers")
      .doc(message.guild.id);

    const server = await serverRef.get();

    if (!server.exists) {
      serverRef.set(configSettings);
    }

    if (channelName) {
      serverRef.update({ guildNotificationChannelID: channelId.trim() });

      const embed = new Discord.MessageEmbed()
        .setColor("#8966ff")
        .addField("Notification channel:", `${channelName}`);

      return message.channel.send(embed);
    } else {
      const isNull = channelId == "null";

      if (isNull) {
        serverRef.update({ guildNotificationChannelID: null });
      }

      const embed = new Discord.MessageEmbed()
        .setColor("#8966ff")
        .addField("Error", `Id not valid`);

      return message.channel.send(embed);
    }
  }
};
