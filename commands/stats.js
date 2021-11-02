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
      const nextLevelExp = 5000 * (Math.pow(2, userMentioned.rank) - 1);
      const startSession = client.container.users[member.user.id]?.start;

      const diff = Date.now() - startSession;

      const embed = new Discord.MessageEmbed()
        .setAuthor(member.user.username)
        .setColor("#8966ff")
        .setThumbnail(member.user.avatarURL({ format: "png" }))
        .addField("Rank", userMentioned.rank.toString())
        .addField("Experience", `${userMentioned.exp}/${nextLevelExp}`)
        .addField(
          "Total Time",
          msToTime(
            startSession ? userMentioned.time + diff : userMentioned.time
          )
        )
        .addField("N. Messages", userMentioned.messages_count.toString());
      return message.channel.send({ embeds: [embed] });
    }
  } else {
    const user = await userSchema.findOne({
      id: `${message.author.id}#${message.guild.id}`,
    });

    if (user) {
      const nextLevelExp = 5000 * (Math.pow(2, user.rank) - 1);
      const startSession = client.container.users[message.author.id]?.start;

      const diff = Date.now() - startSession;

      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#8966ff")
        .setThumbnail(message.author.avatarURL({ format: "png" }))
        .addField("Rank", user.rank.toString())
        .addField("Experience", `${user.exp}/${nextLevelExp}`)
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

      embed.addField("N. Messages", user.messages_count.toString());
      return message.channel.send({ embeds: [embed] });
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
  name: "stats",
  category: "stats",
  description:
    "You can get the stats about you or another memeber (ex: time spent in a voice channles).",
  usage: "stats or stats @user",
};
