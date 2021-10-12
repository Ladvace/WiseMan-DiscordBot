const Discord = require("discord.js");
const logger = require("../modules/logger");
const { config } = require("../mongodb");

exports.run = async (client, message, args) => {
  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  if (isAdmin && args[0]?.length === 1) {
    config.findOne(
      {
        id: message.guild.id,
      },
      (err, server) => {
        if (err) logger.error(err);

        if (server) {
          server.guildPrefix = args[0].trim();
          server.save();

          const embed = new Discord.MessageEmbed()
            .setTitle("Prefix")
            .setColor("#8966ff")
            .setDescription(`Prefix set to \`\`\`${args[0]}\`\`\``);

          return message.channel.send({ embeds: [embed] });
        }
      }
    );
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "eval",
  category: "System",
  description: "Evaluates arbitrary javascript.",
  usage: "eval [...code]",
};
