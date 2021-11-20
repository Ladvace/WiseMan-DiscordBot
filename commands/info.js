const Discord = require("discord.js");

exports.run = async (client, message) => {
  const memberCount = client.guilds.cache.get(message.guild.id).memberCount;
  const embed = new Discord.MessageEmbed()
    .setAuthor("Bot Infos")
    .setColor("#8966ff")
    .addField("This bot has been developed by:", "Ladvace#1909")
    .addField(
      "Number of servers the bot is in:",
      client.guilds.cache.size.toString()
    )
    .addField("Members in this server:", memberCount.toString());

  return message.channel.send({ embeds: [embed] });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "infos",
  category: "stats",
  description: "You can get the bot infos.",
  usage: "infos",
};
