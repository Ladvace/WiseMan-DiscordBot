const Discord = require("discord.js");
const { config } = require("../mongodb");

exports.run = async (client, message, args) => {
  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  const channelId = args[0];

  if (isAdmin) {
    config.findOne(
      {
        id: message.guild.id,
      },
      (err, server) => {
        if (err) console.log(err);
        if (server) {
          const channelName = client.channels.cache.get(channelId)?.name;

          if (channelName) {
            server.welcomeChannel = channelId.trim();
            server.save();
            const embed = new Discord.MessageEmbed()
              .setColor("#8966ff")
              .addField("Welcome channel:", `${channelName}`);

            return message.channel.send({ embeds: [embed] });
          } else {
            const isNull = channelId == "null";

            if (isNull) {
              server.welcomeChannel = null;
              server.save();
            }

            const embed = new Discord.MessageEmbed()
              .setColor("#8966ff")
              .addField("Error", `Id not valid`);

            return message.channel.send({ embeds: [embed] });
          }
        }
      }
    );
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["setWelcomeChannel"],
  permLevel: "User",
};

exports.help = {
  name: "setwelcomechannel",
  category: "System",
  description:
    "You can set the channel to send automatic welcome messages to the new users.",
  usage: "setwelcomechannel CHANNELID",
};
