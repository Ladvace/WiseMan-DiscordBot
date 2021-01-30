const Discord = require("discord.js");
const firebase = require("firebase");

exports.run = async (client, message) => {
  const userSchemaConfig = {
    id: `${message.author.id}#${message.guild.id}`,
    name: message.author.username,
    messages_count: 0,
    rank: 0,
    discordName: `${message.author.username}#${message.author.discriminator}`,
  };

  if (message.mentions.members.first()) {
    const member = message.mentions.members.first();

    const userRef = firebase
      .firestore()
      .collection("users")
      .doc(`${member.user.id}#${message.guild.id}`);

    const userMentioned = await userRef.get();

    if (!userMentioned.exists) {
      userRef.set(userSchemaConfig);
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(member.user.username)
      .setColor("#8966ff")
      .setThumbnail(member.user.avatarURL({ format: "png" }))
      .addField("Rank", userMentioned.data().rank);
    return message.channel.send(embed);
  } else {
    const userRef = firebase
      .firestore()
      .collection("users")
      .doc(`${message.author.id}#${message.guild.id}`);

    const user = await userRef.get();

    if (!user.exists) {
      userRef.set(userSchemaConfig);
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username)
      .setColor("#8966ff")
      .setThumbnail(message.author.avatarURL({ format: "png" }))
      .addField("Rank", user.data().rank);
    return message.channel.send(embed);
  }
};
