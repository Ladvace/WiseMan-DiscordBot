const Discord = require("discord.js");
const { userSchema } = require("../mongodb");
const logger = require("../modules/logger");
const { reset } = require("../utility");

exports.run = async (client, message, args) => {
  const member = message.mentions.members.first();

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  if (isAdmin) {
    if (member) {
      userSchema.findOne(
        {
          id: `${member.id}#${message.guild.id}`,
        },
        (err, user) => {
          if (err) logger.error(err);
          if (user) {
            reset(user);
          }
        }
      );
      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#8966ff")
        .setThumbnail(member.avatarURL({ format: "png" }))
        .setDescription(`**${member.user.username}\'s rank has been reset!**`);

      return message.channel.send({ embeds: [embed] });
    } else {
      if (args[0]) {
        const arg = args[0].trim();

        if (arg === "all") {
          const res = await userSchema.updateMany(
            { guildId: message.guild.id },
            { rank: 1, exp: 0, time: 0, messages_count: 0 }
          );

          const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .setColor("#8966ff")
            .setDescription(
              `**${res.modifiedCount} users rank has been reset!**`
            );

          return message.channel.send({ embeds: [embed] });
        }
      }
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "reset",
  category: "System",
  description: "An admin can reset somebody's rank",
  usage: "reset @user",
};
