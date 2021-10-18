const Discord = require("discord.js");
const { config } = require("../mongodb");
const logger = require("../modules/logger");

module.exports.run = async (client, message) => {
  const welcomeMessage = message.content.split(" ").slice(1).join(" ");

  config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) logger.error(err);

      if (server) {
        if (welcomeMessage === "null") {
          server.welcomeMessage = null;

          const embed = new Discord.MessageEmbed()
            .setTitle("Prefix")
            .setColor("#8966ff")
            .setDescription(`welcome message resetted!`);

          return message.channel.send({ embeds: [embed] });
        }
        server.welcomeMessage = welcomeMessage;
        server.save();

        const embed = new Discord.MessageEmbed()
          .setTitle("Prefix")
          .setColor("#8966ff")
          .setDescription(
            `welcome message set to \`\`\`${welcomeMessage}\`\`\``
          );

        return message.channel.send({ embeds: [embed] });
      }
    }
  );
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["setwelcomemessage"],
  permLevel: "User",
};

exports.help = {
  name: "setWelcome",
  category: "System",
  description:
    "You can set a custom welcome message for the new user who joins the server for the first time, use [user] as a placeholder to be replaced by the new user's name",
  usage: "setwelcome Hello [user]",
};
