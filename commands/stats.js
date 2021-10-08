const Discord = require("discord.js");
const { userSchema } = require("../mongodb");
const { msToTime } = require("../utility");

exports.run = async (client, message) => {
  if (message.mentions.members.first()) {
    const member = message.mentions.members.first();

    const userMentioned = await userSchema.findOne({
      id: `${member.user.id}#${message.guild.id}`,
    });

    if (userMentioned) {
      const startSession = client.container.users[member.user.id]?.start;

      const diff = Date.now() - startSession;

      const embed = new Discord.MessageEmbed()
        .setAuthor(member.user.username)
        .setColor("#8966ff")
        .setThumbnail(member.user.avatarURL({ format: "png" }))
        .addField("Total Time", msToTime(userMentioned.time))
        .addField(
          "Total Time",
          msToTime(
            startSession ? userMentioned.time + diff : userMentioned.time
          )
        );
      return message.channel.send({ embeds: [embed] });
    }
  } else {
    const user = await userSchema.findOne({
      id: `${message.author.id}#${message.guild.id}`,
    });

    if (user) {
      const startSession = client.container.users[message.author.id]?.start;

      const diff = Date.now() - startSession;

      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#8966ff")
        .setThumbnail(message.author.avatarURL({ format: "png" }))
        .addField(
          "Total Time",
          msToTime(startSession ? user.time + diff : user.time)
        );

      if (startSession) {
        embed.addField(
          "Session Time",
          Number.isNaN(diff) ? "Invalid!" : msToTime(diff)
        );
      }

      return message.channel.send({ embeds: [embed] });
    }
  }
};
