const Discord = require("discord.js");
const logger = require("./modules/logger");
const { userSchema, config } = require("./mongodb");

const incrementRank = async (id, name, discriminator) => {
  await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          name: name,
          messages_count: 0,
          rank: 0,
          discordName: `${name}#${discriminator}`,
        });

        return newUser.save();
      } else {
        console.log(
          "incrementing rank:",
          user.discordName,
          user.rank,
          user.rank + 1
        );
        user.rank = (user.rank ? user.rank : 0) + 1;
        user.save();
      }
    }
  );
};

const decrementRank = async (id, name, discriminator) => {
  await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          name: name,
          messages_count: 0,
          rank: 0,
          discordName: `${name}#${discriminator}`,
        });

        return newUser.save();
      } else {
        console.log(
          "decrement rank:",
          user.discordName,
          user.rank,
          user.rank - 1
        );
        user.rank = user.rank === 0 ? 0 : user.rank - 1;
        user.save();
      }
    }
  );
};

const incrementMessages = async (id, name) => {
  await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          name: name,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
      if (user) {
        user.messages_count = user.messages_count + 1;
        user.save();
      }
    }
  );
};

const levelUp = async (message, guildId, level, client) => {
  if (message.user.id === client.user.id) return;
  console.log("level up");

  const channel = await config.findOne(
    {
      id: guildId,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config({
          id: guildId,
          guildPrefix: "!",
          guildNotificationChannelID: null,
          welcomeChannel: null,
          customRanks: {},
          rankTime: null,
          defaultRole: null,
        });

        return newServer.save();
      }
    }
  );

  const hasCustomRank = channel.customRanks.hasOwnProperty(level);

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.user.username)
    .setColor("#8966ff")
    .setThumbnail(message.user.avatarURL({ format: "png" }))
    .addField("Rank", `${level}`);

  const notificationChannel = client.channels.cache.get(
    channel.guildNotificationChannelID
  );

  const customRankId = channel.customRanks[level];
  const roleExist = message.guild.roles.cache.has(customRankId);
  if (hasCustomRank && roleExist) {
    const customRole = message.guild.roles.cache.get(customRankId);

    console.log("customRole", customRole);

    message.roles
      .add(customRole)
      .then(() => {
        console.log("guildNotificationChannelID", notificationChannel);
        if (channel.guildNotificationChannelID)
          return notificationChannel.send(embed);
      })
      .catch((e) => console.error("test", e));
  }
};

const assignRankRole = async (state, client, level, tryNum = 0) => {
  if (state.member.user.id === client.user.id) return;

  const guildId = state.guild.id;

  const channel = await config.findOne({
    id: guildId,
  });

  if (!channel) {
    const newServer = new config({
      id: guildId,
      guildPrefix: "!",
      guildNotificationChannelID: null,
      welcomeChannel: null,
      customRanks: {},
      rankTime: null,
      defaultRole: null,
    });

    await newServer.save();

    if (tryNum < 3) assignRankRole(state, client, level, tryNum + 1);
    else return;
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor(state.member.user.username)
    .setColor("#8966ff")
    .setThumbnail(state.member.user.avatarURL({ format: "png" }))
    .addField("Rank", `${level}`);

  const notificationChannel = client.channels.cache.get(
    channel?.guildNotificationChannelID
  );

  if (channel?.customRanks) {
    const customRankId = channel.customRanks.get(level);

    if (customRankId) {
      const customRole = state.guild.roles.cache.get(customRankId);

      message.roles
        .add(customRole)
        .then(() => {
          if (channel?.guildNotificationChannelID)
            return notificationChannel.send(embed);
        })
        .catch((e) => logger.error(e));
    }
    // else {
    //   const customRankId = await state.guild.roles.create({
    //     name: `Level ${level}`,
    //     color: "#738AD6",
    //     reason: `${level} role missing`,
    //   });

    //   console.log("ROLE", customRankId.id, level);
    //   channel.customRanks.set(level.toString(), customRankId.id);
    // }
  }
};

module.exports = {
  incrementRank,
  decrementRank,
  incrementMessages,
  levelUp,
  assignRankRole,
};
