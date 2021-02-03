const Discord = require("discord.js");
const firebase = require("firebase");

exports.run = async (client, message, args) => {
  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  const configSettings = {
    id: message.guild.id,
    guildPrefix: "!",
    guildNotificationChannelID: null,
    welcomeChannel: null,
    customRanks: {},
    rankTime: null,
    defaultRole: null,
  };

  if (isAdmin && args[0]?.length === 1) {
    const serverRef = firebase
      .firestore()
      .collection("servers")
      .doc(message.guild.id);

    const server = await serverRef.get();

    if (!server.exists) {
      serverRef.set(configSettings);
    }

    client.config.serverSettings[message.guild.id] = server.data();

    if (server) {
      serverRef.update({ guildPrefix: args[0].trim() });

      const embed = new Discord.MessageEmbed()
        .setTitle("Prefix")
        .setColor("#8966ff")
        .setDescription(`Prefix setted to \`\`\`${args[0]}\`\`\``);

      return message.channel.send(embed);
    }
  }
};
