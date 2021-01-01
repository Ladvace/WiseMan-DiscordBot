const Discord = require("discord.js");
const { userSchema } = require("../mongodb");

exports.run = async (client, message, args) => {
  const member = message.mentions.members.first();

  const perms = message.member.permissions;
  const isAdmin = perms.has("ADMINISTRATOR");

  const userSchemaConfig = {
    id: `${message.author.id}#${message.guild.id}`,
    name: message.author.username,
    messages_count: 0,
    rank: 0,
    discordName: `${message.author.username}#${message.author.discriminator}`,
  };

  if (isAdmin) {
    if (member) {
      member.roles.remove([...member.guild.roles.cache.keyArray()]);
      await userSchema.findOne(
        {
          id: `${member.id}#${message.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          if (!user) {
            if (member.id === client.user.id) return;
            const newUser = new userSchema(userSchemaConfig);
            return newUser.save();
          } else {
            user.messages_count = args[1];
            user.rank = args[1];
            user.save();
          }
        }
      );
    } else {
      message.member.roles.remove([
        ...message.member.guild.roles.cache.keyArray(),
      ]);
      await userSchema.findOne(
        {
          id: `${message.author.id}#${message.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          if (!user) {
            if (message.author.id === client.user.id) return;
            const newUser = new userSchema(userSchemaConfig);
            return newUser.save();
          } else {
            user.messages_count = 0;
            user.rank = 0;
            user.save();
          }
        }
      );
    }
  }
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor("#8966ff")
    .setThumbnail(message.author.avatarURL({ format: "png" }))
    .setDescription("***Your rank has been reset!***");
  return message.channel.send(embed);
};
