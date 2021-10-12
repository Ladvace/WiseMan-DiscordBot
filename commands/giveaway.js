const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const errorEmbed = new Discord.MessageEmbed()
    .setColor("#8966ff")
    .addField("Error", `Please enter a duration and a price`);
  if (args.length < 2) return message.channel.send({ embeds: [errorEmbed] });

  const time = args[0].toLowerCase();
  // const winnersCount = args[1].toLowerCase();

  let timeDuration = null;
  const timeDurations = {
    s: "second",
    m: "minute",
    h: "hour",
    d: "day",
  };

  let timeInMilliseconds = 0;
  const prize = message.content.split(" ").slice(2).join(" ");

  if (!message.member.permissions.has("ADMINISTRATOR")) return;

  const parsedTime = time.slice(0, time.length - 1);

  switch (time[time.length - 1]) {
    case "s":
      timeInMilliseconds = parsedTime * 1000;
      timeDuration = timeDurations["s"];
      break;
    case "m":
      timeInMilliseconds = parsedTime * 60000;
      timeDuration = timeDurations["m"];
      break;
    case "h":
      timeInMilliseconds = parsedTime * 3600000;
      timeDuration = timeDurations["h"];
      break;
    case "d":
      timeInMilliseconds = parsedTime * 86400000;
      timeDuration = timeDurations["d"];
      break;
    default:
      return null;
  }

  if (timeInMilliseconds && timeInMilliseconds > 0) {
    console.log("time", time, parsedTime);
    const embed = new Discord.MessageEmbed()
      .setTitle(`${prize}`)
      .setColor("#8966FF")
      .setDescription(
        `React with 🎉 to enter!\nTime duration: **${parsedTime}** ${
          parsedTime > 1 ? timeDuration + "s" : timeDuration
        }\nHosted by: ${message.author}`
      )
      .setTimestamp(Date.now() + timeInMilliseconds)
      .setFooter("Ends at");
    let embedMessage = await message.channel.send({
      content: ":tada: **GIVEAWAY** :tada:",
      embeds: [embed],
    });
    await embedMessage.react("🎉");

    setTimeout(() => {
      embedMessage.reactions.cache.get("🎉").users.remove(client.user.id);
      embedMessage.reactions.cache.get("🎉").users.remove(message.author.id);

      setTimeout(() => {
        const winner = embedMessage.reactions.cache
          .get("🎉")
          .users.cache.random();
        // .filter((x) => x !== undefined && x.id !== message.author.id);

        console.log(
          "winner",

          winner,
          // winner.filter((x) => x !== undefined && x.id !== message.author.id),

          embedMessage.reactions.cache.get("🎉").users.cache
        );

        if (embedMessage.reactions.cache.get("🎉").users.cache.size < 1) {
          const winnerEmbed = new Discord.MessageEmbed()
            .setTitle(`${prize}`)
            .setColor("#8966FF")
            .setDescription(
              `No one entered the giveaway.\nHosted by: ${message.author}`
            )
            .setTimestamp()
            .setFooter("Ended at");
          embedMessage.edit({
            content: ":tada: **GIVEAWAY ENDED** :tada:",
            embeds: [winnerEmbed],
          });
        }
        if (!embedMessage.reactions.cache.get("🎉").users.cache.size < 1) {
          const winnerEmbed = new Discord.MessageEmbed()
            .setTitle(`${prize}`)
            .setColor("#8966FF")
            .setDescription(`Winner:\n${winner}\nHosted by: ${message.author}`)
            .setTimestamp()
            .setFooter("Ended at");
          embedMessage.edit({
            content: ":tada: **GIVEAWAY ENDED** :tada:",
            embeds: [winnerEmbed],
          });
        }
        embedMessage.reactions.cache
          .get("🎉")
          .users.cache.map((userId) =>
            embedMessage.reactions.cache.get("🎉").users.remove(userId)
          );
      }, 1000);
    }, timeInMilliseconds);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "giveaway",
  category: "Utility",
  description: "You can run a giveaway in your server.",
  usage: "giveaway 3m title of the giveaway",
};
