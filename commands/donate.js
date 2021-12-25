const Discord = require("discord.js");

exports.run = async (client, message) => {
  const embed = new Discord.MessageEmbed()
    .setTitle("Donate")
    .setColor("#8966FF")
    .setURL("https://ko-fi.com/ladvace")
    .setThumbnail("https://i.imgur.com/et6QQbt.png", "")
    .setDescription(
      "This bot is open source, consider donation to support it, If you are interested in any other way, just DM me. Any type of support it's always appreciated."
    );
  return message.channel.send({ embeds: [embed] });
};

exports.conf = {
  enabled: false,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "donate",
  category: "infos",
  description: "More info on how to support this bot",
  usage: "donate",
};
