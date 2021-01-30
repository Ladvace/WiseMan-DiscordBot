const Discord = require("discord.js");
const { config } = require("../mongodb");

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
          server.guildPrefix = args[0].trim();
          server.save();

          const embed = new Discord.MessageEmbed()
            .setTitle("Prefix")
            .setColor("#8966ff")
            .setDescription(`Prefix setted to \`\`\`${args[0]}\`\`\``);

          return message.channel.send(embed);
        }
      }
    );
  }
};
