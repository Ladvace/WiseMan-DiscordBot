const Discord = require("discord.js");
const { config } = require("../mongodb");

exports.run = async (client, message) => {
  const RemotePrefix = await config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config(configSettings);

        return newServer.save();
      }
    }
  );

  const input = message.content;
  const pollHelp = input.includes("--poll");
  const setRankHelp = input.includes("--setRank");
  const embed = new Discord.MessageEmbed();
  if (pollHelp) {
    embed
      .setTitle("Poll")
      .setThumbnail("https://i.imgur.com/AtmK18i.png")
      .setColor("#8966FF")
      .addField(
        `\`\`\`${RemotePrefix.guildPrefix || prefix}poll\`\`\``,
        "\u200B"
      )
      .addFields({
        name: `Arguments`,
        value: "\u200B",
        inline: false,
      })
      .addField(`\`\`\`--option\`\`\``, "you must enter at least two option")
      .addField(
        `\`\`\`--question\`\`\``,
        "you must enter at least one question"
      )
      .addField(
        `\`\`\`--timeout\`\`\``,
        "this is the time in hours the poll will last, the default value it's 1h"
      )
      .addField(
        "Example:",
        `\`\`\`${
          RemotePrefix.guildPrefix || prefix
        }poll --option option1 --option option2 --option option3 --question is this a question? --timeout 3\`\`\``
      );
    return message.channel.send(embed);
  } else if (setRankHelp) {
    embed
      .setTitle("setRank")
      .setThumbnail("https://i.imgur.com/AtmK18i.png")
      .setColor("#8966FF")
      .addField(
        `\`\`\`${RemotePrefix.guildPrefix || prefix}setRank\`\`\``,
        "\u200B"
      )
      .addFields({
        name: `Arguments`,
        value: "\u200B",
        inline: false,
      })
      .addField(
        "you must enter as **first** argument the level you want the role to be setted and as **second** argumnet the role id",
        "\u200B"
      )
      .addField(
        "Example:",
        `\`\`\`${RemotePrefix.guildPrefix || prefix}setRank 7 idRank\`\`\``
      );
    return message.channel.send(embed);
  }
  embed
    .setTitle("Commands")
    .setThumbnail("https://i.imgur.com/AtmK18i.png")
    .setColor("#8966FF")
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}rank\`\`\``,
      "It shows you the  rank"
    )
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}github\`\`\``,
      "It gives you the link of the github repo"
    )
    .addField(
      ` \`\`\`${RemotePrefix.guildPrefix || prefix}help\`\`\``,
      `probably you already know that 😄`
    )
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}setPrefix\`\`\``,
      "It allows you to set a new command prefix"
    )
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}setRank\`\`\``,
      "It allows you to set a custom role for each level, use --setRank to get more information"
    )
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}setNotificationChannel\`\`\``,
      "It allows you to set a new text channel where the notification will be sent"
    )
    .addField(
      `\`\`\`${RemotePrefix.guildPrefix || prefix}poll\`\`\``,
      "It allows you to create a poll, use --poll to get more information"
    );
  return message.channel.send(embed);
};
