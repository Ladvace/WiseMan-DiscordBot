const Discord = require("discord.js");
const logger = require("./modules/logger");
const { config } = require("./mongodb");

const incrementRank = async (user, experience, client, member) => {
  const nextLevelExp = 5000 * (Math.pow(2, user.rank) - 1);
  const exp = experience || user.exp;

  if (exp >= nextLevelExp) {
    const nextOwnedExp = exp - nextLevelExp;

    const newRank = user.rank + 1;

    user.rank = newRank;
    user.exp = nextOwnedExp;

    if (nextOwnedExp > 0) {
      await incrementRank(user, nextOwnedExp, client, member);
    } else {
      assignRankRole(user, client, newRank.toString(), 0, member);
    }

    return user.save();
  }
};

const decrementRank = async (user, client, member) => {
  const newRank = (user.rank ? user.rank : 0) - 1;
  user.rank = newRank >= 0 ? newRank : 0;
  assignRankRole(user, client, newRank.toString(), 0, member);
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

const reset = async (user) => {
  user.rank = 1;
  user.exp = 0;
  user.time = 0;
  user.messages_count = 0;
  await user.save();
};

const assignRankRole = async (state, client, level, tryNum = 0, member) => {
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

    if (tryNum < 3) assignRankRole(state, client, level, tryNum + 1, member);
    else return;
  }

  if (channel?.customRanks) {
    const customRankId = channel.customRanks.get(level);

    const previusLevel = level - 1;
    const customPreviusRankId = channel.customRanks.get(
      previusLevel.toString()
    );

    if (customRankId) {
      const customRole = member.guild.roles.cache.get(customRankId);

      member.roles
        .remove(customPreviusRankId)
        .then(() => logger.log(`Role: ${customRole} removed`))
        .catch((e) => logger.error(e));

      member.roles
        .add(customRole)
        .then(() => {
          logger.log(`Role: ${customRole} added`);

          if (channel.notificationChannel) {
            const notificationChannel = member.guild.channels.cache.get(
              channel.notificationChannel
            );

            const embed = new Discord.MessageEmbed()
              .setTitle(`${member.user.username}`)
              .setColor("#8966ff")
              .addField("Rank", level)
              .addField("Role", `${customRole}`);

            notificationChannel.send({ embeds: [embed] });
          }
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
  reset,
  assignRankRole,
  msToTime,
  toProperCase,
};
