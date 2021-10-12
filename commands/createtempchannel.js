const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const name = args[0];
  const time = args[1]?.toLowerCase();
  const parentId = args[2];

  let timeDuration = null;
  const timeDurations = {
    s: "second",
    m: "minute",
    h: "hour",
    d: "day",
  };

  let timeInMilliseconds = 0;

  if (!message.member.permissions.has("ADMINISTRATOR")) return;
  let parsedTime = 1;
  if (time) {
    parsedTime = time.slice(0, time.length - 1);

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
  }
  const channel = await message.guild.channels.create(name, {
    type: "GUILD_VOICE",
    parent: parentId,
    permissionOverwrites: [
      {
        id: message.guild.id,
        allow: ["VIEW_CHANNEL"],
        deny: ["SEND_MESSAGES"],
      },
    ],
  });

  const embed = new Discord.MessageEmbed()
    .setTitle("Temp voice channel")
    .setColor("#8966FF")
    .setDescription(
      `The channel: ${name} is going to be destroyed in ${parsedTime} ${
        parsedTime > 1 ? timeDuration + "s" : timeDuration
      }`
    )
    .setTimestamp();

  message.channel.send({ embeds: [embed] });

  setTimeout(() => {
    channel.delete();
  }, timeInMilliseconds || 3600000);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["createTempChannel"],
  permLevel: "Administrator",
};

exports.help = {
  name: "createtempchannel",
  category: "stats",
  description: "Create a temp channel.",
  usage: "createTempChannel 3m PARENTID",
};
