const Discord = require("discord.js");
const firebase = require("firebase");
const { prefix } = require("../config.json");

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

  const level = args[0];
  const roleId = args[1];

  const roleName = message.guild.roles.cache.get(roleId)?.name;

  const serverRef = firebase
    .firestore()
    .collection("servers")
    .doc(message.guild.id);

  const server = await serverRef.get();
  const serverData = await server.data();

  if (!server.exists) {
    serverRef.set(configSettings);
  }

  if (roleName && level && Number.isInteger(parseInt(level, 10))) {
    serverRef.update({ [level]: roleId });

    const embed = new Discord.MessageEmbed()
      .setTitle("Custom Rank")
      .setColor("#8966ff")
      .addField("Rank", `${roleName}`);

    return message.channel.send(embed);
  } else {
    const embed = new Discord.MessageEmbed()
      .setTitle("Custom Rank")
      .setColor("#8966ff")
      .setDescription("Command not valid, you must enter a level and a role id")
      .addField(
        "Example:",
        `\`\`\`${
          serverData.guildPrefix || prefix
        }setrank 7 760437474157522452\`\`\``
      );

    return message.channel.send(embed);
  }
};
