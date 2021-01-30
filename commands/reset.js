const Discord = require("discord.js");
const firebase = require("firebase");

exports.run = async (client, message) => {
  const member = message.mentions.members.first();

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  if (isAdmin) {
    if (member) {
      member.roles.remove([...member.guild.roles.cache.keyArray()]);

      const userSchemaConfig = {
        id: `${message.author.id}#${message.guild.id}`,
        name: message.author.username,
        messages_count: 0,
        rank: 0,
        discordName: `${member.id}#${message.guild.id}`,
      };

      const userRef = firebase
        .firestore()
        .collection("users")
        .doc(`${member.id}#${message.guild.id}`);

      const user = await userRef.get();

      if (!user.exists) {
        userRef.set(userSchemaConfig);
      }
    } else {
      message.member.roles.remove([
        ...message.member.guild.roles.cache.keyArray(),
      ]);

      const userSchemaConfig = {
        id: `${message.author.id}#${message.guild.id}`,
        name: message.author.username,
        messages_count: 0,
        rank: 0,
        discordName: `${message.author.username}#${message.author.discriminator}`,
      };

      const userRef = firebase
        .firestore()
        .collection("users")
        .doc(`${message.author.id}#${message.guild.id}`);

      const user = await userRef.get();

      userRef.update({ messages_count: 0, rank: 0 });

      if (!user.exists) {
        userRef.set(userSchemaConfig);
      }
    }
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor("#8966ff")
    .setThumbnail(message.author.avatarURL({ format: "png" }))
    .setDescription("***Your rank has been reset!***");
  return message.channel.send(embed);
};
