const Discord = require("discord.js");
const { config } = require("../mongodb");

exports.run = async (client, message, args) => {
  const configSettings = {
    id: message.guild.id,
    guildPrefix: "!",
    guildNotificationChannelID: null,
    welcomeChannel: null,
    customRanks: {},
    rankTime: null,
  };

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  if (isAdmin) {
    await config.findOne(
      {
        id: message.guild.id,
      },
      (err, server) => {
        if (err) console.log(err);
        if (!server) {
          const newServer = new config(configSettings);
          return newServer.save();
        }
        if (server) {
          const channelName = client.channels.cache.get(args[0])?.name;

          if (channelName) {
            server.guildNotificationChannelID = args[0].trim();
            server.save();
            const embed = new Discord.MessageEmbed()
              .setColor("#8966ff")
              .addField("Notification channel:", `${channelName}`);

            return message.channel.send(embed);
          } else {
            const isNull = args[0] == "null";

            if (isNull) {
              server.guildNotificationChannelID = null;
              server.save();
            }

            const embed = new Discord.MessageEmbed()
              .setColor("#8966ff")
              .addField("Error", `Id not valid`);

            return message.channel.send(embed);
          }
        }
      }
    );
  }
};
