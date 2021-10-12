const Discord = require("discord.js");
const { config } = require("../mongodb");

exports.run = async (client, message, args) => {
  const level = args[0];
  const roleId = args[1];

  const roleName = message.guild.roles.cache.get(roleId)?.name;

  const server = await config.findOne({
    id: message.guild.id,
  });

  if (roleName && level && Number.isInteger(parseInt(level, 10))) {
    if (server) {
      server.customRanks.set(level.toString(), roleId);
      await server.save();
    }

    const embed = new Discord.MessageEmbed()
      .setTitle("Custom Rank")
      .setColor("#8966ff")
      .addField("Rank", `${roleName}`);

    return message.channel.send({ embeds: [embed] });
  } else {
    const embed = new Discord.MessageEmbed()
      .setTitle("Custom Rank")
      .setColor("#8966ff")
      .setDescription("Command not valid, you must enter a level and a role id")
      .addField(
        "Example:",
        `\`\`\`${client.config.prefix}setrank 7 760437474157522452\`\`\``
      );

    return message.channel.send({ embeds: [embed] });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "setrank",
  category: "ranking",
  description: "you can set a custom role for a specific rank",
  usage: "setrank RANKLEVEL ROLEID",
};
