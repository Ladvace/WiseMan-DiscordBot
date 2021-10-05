const Discord = require("discord.js");
const { userSchema } = require("../mongodb");

exports.run = async (client, message) => {
  console.log("AAA");
  if (message.mentions.members.first()) {
    const member = message.mentions.members.first();

    const userMentioned = await userSchema.findOne({
      id: `${member.user.id}#${message.guild.id}`,
    });
    if (userMentioned) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(member.user.username)
        .setColor("#8966ff")
        .setThumbnail(member.user.avatarURL({ format: "png" }))
        .addField("Rank", userMentioned.rank);
      return message.channel.send({ embeds: [embed] });
    }
  } else {
    const user = await userSchema.findOne({
      id: `${message.author.id}#${message.guild.id}`,
    });

    if (user) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#8966ff")
        .setThumbnail(message.author.avatarURL({ format: "png" }))
        .addField("Rank", user.rank.toString());

      return message.channel.send({ embeds: [embed] });
    }
  }
};
