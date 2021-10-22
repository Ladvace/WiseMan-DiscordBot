const Discord = require("discord.js");
const logger = require("./modules/logger");
const { config } = require("./mongodb");

const incrementRank = async (user, experience, client, channel) => {
  const nextLevelExp = 5000 * (Math.pow(2, user.rank) - 1);
  const exp = experience || user.exp;

  if (exp >= nextLevelExp) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(user.name)
      .setDescription("Levele up!")
      .setColor("#8966ff")
      // .setThumbnail(member.user.avatarURL({ format: "png" }))
      .addField("Rank", (user.rank + 1).toString());

    user.rank = user.rank + 1;
    if (channel) channel.send({ embeds: [embed] });
    // assignRankRole(user, client, newRank);
    return user.save();
  }
};

const decrementRank = async (user, client) => {
  const newRank = (user.rank ? user.rank : 0) - 1;
  user.rank = newRank >= 0 ? newRank : 0;
  // assignRankRole(user, client, newRank);
  return user.save();
};

const incrementMessages = async (user) => {
  user.messages_count = user.messages_count + 1;
  await user.save();
};

const incrementExp = async (user, expAmount = 1) => {
  const newExp = user.exp + expAmount;
  user.exp = newExp;
  await user.save();
  return newExp;
};

const assignRankRole = async (state, client, level, tryNum = 0) => {
  if (state.userId === client.user.id) return;

  const guildId = state?.guildId;

  const channel = await config.findOne({
    id: guildId,
  });

  if (!channel) {
    const newServer = new config({
      id: guildId,
      guildPrefix: "!",
      customRanks: {},
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
    channel?.notificationChannel
  );

  if (channel?.customRanks) {
    const customRankId = channel.customRanks.get(level);

    if (customRankId) {
      const customRole = state.guild.roles.cache.get(customRankId);

      message.roles
        .add(customRole)
        .then(() => {
          if (channel?.notificationChannel)
            return notificationChannel.send({ embeds: [embed] });
        })
        .catch((e) => logger.error(e));
    }
  }
};

const msToTime = (duration) => {
  let milliseconds = Math.floor((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
};

const toProperCase = (string) => {
  return string.replace(
    /([^\W_]+[^\s-]*) */g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

module.exports = {
  incrementRank,
  incrementExp,
  decrementRank,
  incrementMessages,
  assignRankRole,
  msToTime,
  toProperCase,
};
