const Discord = require("discord.js");
const firebase = require("firebase");

module.exports.run = async (client, message) => {
  const configSettings = {
    id: message.guild.id,
    guildPrefix: "!",
    guildNotificationChannelID: null,
    welcomeChannel: null,
    customRanks: {},
    rankTime: null,
    welcomeMessage: null,
    welcomeTextMessage: null,
    defaultRole: null,
  };

  const welcomeMessage = message.content.split(" ").slice(1).join(" ");

  const serverRef = firebase
    .firestore()
    .collection("servers")
    .doc(message.guild.id);

  const server = await serverRef.get();

  if (!server.exists) {
    serverRef.set(configSettings);
  }

  if (welcomeMessage === "null") {
    serverRef.update({ welcomeMessage: null });

    const embed = new Discord.MessageEmbed()
      .setTitle("Prefix")
      .setColor("#8966ff")
      .setDescription(`text welcome message resetted!`);

    return message.channel.send(embed);
  }

  serverRef.update({ welcomeMessage });

  const embed = new Discord.MessageEmbed()
    .setTitle("Prefix")
    .setColor("#8966ff")
    .setDescription(
      `text welcome message setted to \`\`\`${welcomeMessage}\`\`\``
    );

  return message.channel.send(embed);
};
