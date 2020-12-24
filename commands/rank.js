const Discord = require("discord.js");
const { userSchema } = require("../mongodb");

exports.run = async (client, message) => {
  const userSchemaConfig = {
    id: `${message.author.id}#${message.guild.id}`,
    name: message.author.username,
    messages_count: 0,
    rank: 0,
    discordName: `${message.author.username}#${message.author.discriminator}`,
  };

  const user = await userSchema.findOne(
    {
      id: `${message.author.id}#${message.guild.id}`,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema(userSchemaConfig);

        return newUser.save();
      }
    }
  );

  if (message.mentions.members.first()) {
    const member = message.mentions.members.first();

    const userSchemaConfig = {
      id: `${message.author.id}#${message.guild.id}`,
      name: message.author.username,
      messages_count: 0,
      rank: 0,
      discordName: `${message.author.username}#${message.author.discriminator}`,
    };

    const userMentioned = await userSchema.findOne(
      {
        id: `${member.user.id}#${message.guild.id}`,
      },
      (err, user) => {
        if (err) console.log(err);
        if (!user) {
          if (member.user.id === botId) return;
          const newUser = new userSchema(userSchemaConfig);
          return newUser.save();
        }
      }
    );
    if (userMentioned) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(member.user.username)
        .setColor("#8966ff")
        .setThumbnail(member.user.avatarURL({ format: "png" }))
        .addField("Rank", userMentioned.rank);
      return message.channel.send(embed);
    }
  } else {
    if (user) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username)
        .setColor("#8966ff")
        .setThumbnail(message.author.avatarURL({ format: "png" }))
        .addField("Rank", user.rank);
      return message.channel.send(embed);
    }
  }
};
