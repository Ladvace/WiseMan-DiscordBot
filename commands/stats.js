const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = (client, message) => {
  const duration = moment
    .duration(client.uptime)
    .format(" D [days], H [hrs], m [mins], s [secs]");

  const embed = new Discord.MessageEmbed();

  embed
    .setTitle("Stats")
    .setColor("#8966FF")
    .addField(
      "Mem Usage",
      `\`\`\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2
      )} MB \`\`\``
    )
    .addField("Uptime", `\`\`\`${duration} \`\`\``)
    .addField(
      "Servers",
      `\`\`\`${client.guilds.cache.size.toLocaleString()} \`\`\``
    )
    .addField(
      "Channels",
      `\`\`\`${client.channels.cache.size.toLocaleString()} \`\`\``
    );
  message.channel.send(embed);
};
