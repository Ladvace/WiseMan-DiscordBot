const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const user = args[0];

  if (args.length < 2) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username)
      .setColor("#8966ff")
      .setDescription(
        "***Please mention the user you want to ban and specify a ban reason.***"
      );

    return message.channel.send({ embeds: [embed] });
  }

  if (!user) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username)
      .setColor("#8966ff")

      .setDescription(
        "***Please use a proper mention if you want to ban someone.***"
      );

    return message.channel.send({ embeds: [embed] });
  }

  const reason = args.slice(1).join(" ");
  try {
    await message.guild.members.ban(user, { reason });
  } catch (error) {
    return message.channel.send(`Failed to ban **${user.tag}**: ${error}`);
  }
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor("#8966ff")
    .setDescription(
      `***Successfully banned **${user.tag}** from the server!***`
    );

  return message.channel.send({ embeds: [embed] });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Administrator",
};

exports.help = {
  name: "ban",
  category: "System",
  description: "ban who users who doesn't follow the rules",
  usage: "ban @user reason",
};
