const Discord = require("discord.js");
const { userSchema } = require("../mongodb");
const { msToTime } = require("../utility");

exports.run = async (client, message) => {
  const leaderBoard = await userSchema
    .find({
      guildId: message.guild.id,
    })
    .sort({ time: -1 })
    .limit(10);

  if (leaderBoard) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Leaderboard")
      .setColor("#8966ff");

    leaderBoard.forEach((user, i) => {
      if (user.userId !== "589693244456042497")
        embed.addField(
          `${i + 1}.  ${user.name} (${user.rank})`,
          msToTime(user.time)
        );
    });

    return message.channel.send({ embeds: [embed] });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "leaderboard",
  category: "Stats",
  description: "Leaderboard based on the time spent in vocal channels",
  usage: "leaderboard",
};
