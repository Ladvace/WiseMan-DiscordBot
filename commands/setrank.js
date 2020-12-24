const Discord = require("discord.js");
const { config } = require("../mongodb");
const { prefix } = require("../config.json");

exports.run = async (client, message, args) => {
  const level = args[0];
  const roleId = args[1];

  const RemotePrefix = await config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config(configSettings);

        return newServer.save();
      } else {
        server.customRanks = { ...server.customRanks, [level]: roleId };
        return server.save();
      }
    }
  );

  const roleName = message.guild.roles.cache.get(roleId)?.name;

  if (roleName) {
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
          RemotePrefix.guildPrefix || prefix
        }setrank 7 760437474157522452\`\`\``
      );

    return message.channel.send(embed);
  }
};
