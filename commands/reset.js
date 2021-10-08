const Discord = require("discord.js");
const firebase = require("firebase");

exports.run = async (client, message) => {
  const member = message.mentions.members.first();

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  if (isAdmin) {
    if (member) {
      member.roles.remove([...member.guild.roles.cache.keyArray()]);
      userSchema.findOne(
        {
          id: `${member.id}#${message.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          if (user) {
            user.messages_count = 0;
            user.rank = 0;
            user.save();
          }
        }
      );
    } else {
      message.member.roles.remove([
        ...message.member.guild.roles.cache.keyArray(),
      ]);
      await userSchema.findOne(
        {
          id: `${message.author.id}#${message.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          if (user) {
            user.messages_count = 0;
            user.rank = 0;
            user.save();
          }
        }
      );
    }
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor("#8966ff")
    .setThumbnail(message.author.avatarURL({ format: "png" }))
    .setDescription("***Your rank has been reset!***");

  return message.channel.send({ embeds: [embed] });
};
