const Discord = require("discord.js");
const firebase = require("firebase");

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

    const serverRef = firebase
      .firestore()
      .collection("servers")
      .doc(message.guild.id);

            return message.channel.send({ embeds: [embed] });
          } else {
            const isNull = channelId == "null";

    if (!server.exists) {
      serverRef.set(configSettings);
    }

    if (channelName) {
      serverRef.update({ guildNotificationChannelID: channelId.trim() });

            return message.channel.send({ embeds: [embed] });
          }
        }
      }

      const embed = new Discord.MessageEmbed()
        .setColor("#8966ff")
        .addField("Error", `Id not valid`);

      return message.channel.send(embed);
    }
  }
};
