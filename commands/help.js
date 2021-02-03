const Discord = require("discord.js");
// const firebase = require("firebase");

exports.run = async (client, message) => {
  // const configSettings = {
  //   id: message.guild.id,
  //   guildPrefix: "!",
  //   guildNotificationChannelID: null,
  //   welcomeChannel: null,
  //   customRanks: {},
  //   rankTime: null,
  //   defaultRole: null,
  // };

  // const users = firebase
  //   .firestore()
  //   .collection("servers")
  //   .doc(message.guild.id);

  // const user = await users.get();

  // const serverSettings = user.data();

  // if (!user.exists) {
  //   users.set(configSettings);
  // }

  const serverSettings = client.config.serverSettings[message.guild.id];
  const embed = new Discord.MessageEmbed();

  const input = message.content;

  const args = input
    .slice(serverSettings?.guildPrefix.length || client.config.prefix.length)
    .trim()
    .split(/ +/g);

  console.log("help", args);

  switch (args[1]) {
    case "poll": {
      embed
        .setTitle("Poll")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addFields({
          name: `Description`,
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
            serverSettings.guildPrefix || prefix
          }poll --option option1 --option option2 --option option3 --question is this a question? --timeout 3\`\`\``
        );
      return message.channel.send(embed);
    }
    case "rank": {
      embed
        .setTitle("Ranking")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addFields(
          { name: "rank", value: "\u200B" },

          {
            name: "Description",
            value:
              "if you don't pass anything as argument your rank will be return, otherwise the mentioned user's rank will be showed",
          },
          {
            name: "Example",
            value: `\`\`\`${
              serverSettings.guildPrefix || prefix
            }rank @userName\`\`\``,
          },

          { name: "\u200B", value: "\u200B" },
          { name: "setrank", value: "\u200B" },
          {
            name: "Description",
            value:
              "you must enter as **first** argument the level you want the role to be setted and as **second** argumnet the role id",
          },
          {
            name: "Example",
            value: `\`\`\`${
              serverSettings.guildPrefix || prefix
            }setrank 7 idRank\`\`\``,
          }
        );
      return message.channel.send(embed);
    }
    case "music": {
      embed
        .setTitle("Music")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addFields(
          { name: "play", value: "\u200B" },
          {
            name: "Description",
            value:
              "you can search and play a music, if a song is already playing it will be added to the queue",
          },
          {
            name: "Example",
            value: `\`\`\`${
              serverSettings.guildPrefix || prefix
            }play <title of a song>\`\`\``,
          },

          { name: "\u200B", value: "\u200B" },
          { name: "stop", value: "\u200B" },
          {
            name: "Description",
            value: "you can stop a music from playing",
          },
          {
            name: "Example",
            value: `\`\`\`${serverSettings.guildPrefix || prefix}stop\`\`\``,
          },
          { name: "\u200B", value: "\u200B" },
          { name: "skip", value: "\u200B" },
          {
            name: "Description",
            value: "you can skip a song",
          },
          {
            name: "Example",
            value: `\`\`\`${serverSettings.guildPrefix || prefix}skip\`\`\``,
          },
          { name: "\u200B", value: "\u200B" },
          { name: "pause", value: "\u200B" },
          {
            name: "Description",
            value: "you can pause a playing song",
          },
          {
            name: "Example",
            value: `\`\`\`${serverSettings.guildPrefix || prefix}pause\`\`\``,
          },
          { name: "\u200B", value: "\u200B" },
          { name: "resume", value: "\u200B" },
          {
            name: "Description",
            value: "you can resume a paused song",
          },
          {
            name: "Example",
            value: `\`\`\`${serverSettings.guildPrefix || prefix}resume\`\`\``,
          },
          { name: "\u200B", value: "\u200B" },
          { name: "queue", value: "\u200B" },
          {
            name: "Description",
            value: "you can see the queue",
          },
          {
            name: "Example",
            value: `\`\`\`${serverSettings.guildPrefix || prefix}queue\`\`\``,
          }
        );
      return message.channel.send(embed);
    }
    // case "giveaway": {

    // }
    case "list": {
      embed
        .setTitle("categories")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}help rank\`\`\``,
          "\u200B"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}help music\`\`\``,
          "\u200B"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}help poll\`\`\``,
          "\u200B"
        );
      return message.channel.send(embed);
    }
    default: {
      embed
        .setTitle("Commands")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}rank\`\`\``,
          "It shows you the  rank"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}github\`\`\``,
          "It gives you the link of the github repo"
        )
        .addField(
          ` \`\`\`${serverSettings.guildPrefix || prefix}help\`\`\``,
          `probably you already know that 😄`
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}setprefix\`\`\``,
          "It allows you to set a new command prefix"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}setrank\`\`\``,
          "It allows you to set a custom role for each level, use --setRank to get more information"
        )
        .addField(
          `\`\`\`${
            serverSettings.guildPrefix || prefix
          }setnotificationchannel\`\`\``,
          "It allows you to set a new text channel where the notification will be sent"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}poll\`\`\``,
          "It allows you to create a poll, use --poll to get more information"
        )
        .addField(
          `\`\`\`${
            serverSettings.guildPrefix || prefix
          }setwelcomechannel\`\`\``,
          "It allows you to a channel where welcome custom messages will be sent, if not setted the messages will be sent nowhere"
        )
        .addField(
          `\`\`\`${
            serverSettings.guildPrefix || prefix
          }setwelcomemessage\`\`\``,
          "You can set the text message in the welcome message when a new user join the server"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}setwelcome\`\`\``,
          "You can set the message inside the custom image when a new user join the server"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}play\`\`\``,
          "You can use this command to ban an user"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}stop\`\`\``,
          "You can use this command to ban an user"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}skip\`\`\``,
          "You can use this command to ban an user"
        )
        .addField(
          `\`\`\`${serverSettings.guildPrefix || prefix}stats\`\`\``,
          "Get some stats on the bot"
        );
      return message.channel.send(embed);
    }
  }
};
