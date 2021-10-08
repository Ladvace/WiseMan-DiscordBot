const Discord = require("discord.js");

exports.run = async (client, message) => {
  const embed = new Discord.MessageEmbed()
    .setTitle("GitHub")
    .setColor("#8966FF")
    .setURL("https://github.com/Ladvace/DiscordBot")
    .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
    .setDescription(
      "This is my repository! You can check out more about the wiseman-bot"
    );
  return message.channel.send({ embeds: [embed] });
};
