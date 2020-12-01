"use strict";
const Discord = require("discord.js");
const { prefix, minutes } = require("./config.json");
// eslint-disable-next-line no-unused-vars
const env = require("dotenv").config();
const client = new Discord.Client();
const mongoose = require("mongoose");
// const tmi = require("tmi.js");
const { config, userSchema } = require("./mongodb");

mongoose.connect(
  "mongodb://localhost:27017/wiseManBot",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) {
      console.log(err);
      return process.exit(22);
    }
    console.log("Connected to the db");
  }
);

let millisPerHour = 60 * minutes * 1000; //1h
let millisPastTheHour = Date.now() % millisPerHour;
let millisToTheHour = millisPerHour - millisPastTheHour;
let pollAnswers = {};

const incrementRank = async (id, name) => {
  console.log("incrementRank", id, name);
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
        console.log("incrementing rank:", id, name, user.rank + 1);
        user.rank = user.rank + 1;
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

const levelUp = async (message, guildId, user, level) => {
  if (message.user.id === client.user.id) return;

  const notificationChannelID = await config.findOne(
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
        });

        return newServer.save();
      }
    }
  );

  if (user.rank > 0 && user.rank % 10 === 0) {
    const Oldrole = message.guild.roles.cache.find(
      (role) => role.name === `Level ${level - 10}`
    );

    const role = message.guild.roles.cache.find(
      (role) =>
        role.name === (user.rank < 500 ? `Level ${level}` : `Level 500+`)
    );

    // const voiceChannel = message.member.voice.channel;

    // const voiceChannel = message.user.member.voice.channel;

    const embed = new Discord.MessageEmbed()
      .setAuthor(message.user.username)
      .setColor("#8966ff")
      .setThumbnail(message.user.avatarURL({ format: "png" }))
      .addField("Rank", `${level}`);

    if (notificationChannelID.guildNotificationChannelID) {
      const channell = client.channels.cache.get(
        notificationChannelID.guildNotificationChannelID
      );

      if (!role) {
        message.guild.roles
          .create({
            data: {
              name: user.rank < 500 ? `Level ${level}` : `Level 500+`,
              color: "#8966ff",
            },
          })
          .then(console.log)
          .catch(console.error);

        // if (notificationChannelID.guildNotificationChannelID) {
        message.roles
          .add(role)
          .then(() => {
            return channell.send(embed);
          })
          .catch(console.error);
        // }
      } else {
        console.log("existing role");
        if (Oldrole) {
          message.roles.remove(Oldrole);
        }
        message.roles
          .add(role)
          .then(() => {
            console.log("ch", channell);
            return channell.send(embed);
          })
          .catch(console.error);
      }
    }
  }
};

// const clientTmi = new tmi.Client({
//   options: { debug: true },
//   connection: {
//     reconnect: true,
//     secure: true,
//   },
//   identity: {
//     username: "wiseManBot",
//     password: process.env.TOKEN,
//   },
//   channels: [],
// });

// clientTmi.connect().catch(console.error);

// clientTmi.on("message", (channel, tags, message, self) => {
//   if (self) return;
//   if (message.toLowerCase() === "!hello") {
//     clientTmi.say(channel, `@${tags.username}, heya!`);
//   }
// });

let timers = {};
let intervals = {};
let polls = {};
let poolSolution = {};

client.once("ready", async () => {
  console.log("Ready!");

  client.guilds.cache.keyArray().map(async (x) => {
    console.log("guilds", x);
    await config.findOne(
      {
        id: x,
      },
      (err, server) => {
        if (err) console.log(err);
        if (!server) {
          const newServer = new config({
            id: x,
            guildPrefix: "!",
            guildNotificationChannelID: null,
            welcomeChannel: null,
          });

          return newServer.save();
        }
      }
    );
  });

  client.channels.cache.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              if (y.user.id === "589693244456042497") return;
              const newUser = new userSchema({
                id: `${y.user.id}#${x.guild.id}`,
                name: y.user.username,
                messages_count: 0,
                rank: 0,
              });

              return newUser.save();
            }
          }
        );

        const user = await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              if (y.user.id === "589693244456042497") return;
              const newUser = new userSchema({
                id: `${y.user.id}#${x.guild.id}`,
                name: y.user.username,
                messages_count: 0,
                rank: 0,
              });

              return newUser.save();
            }
          }
        );

        timers[x.guild.id] = {};
        intervals[x.guild.id] = {};
        timers[x.guild.id][y.user.id] = setTimeout(async () => {
          console.log("start");

          intervals[x.guild.id][y.user.id] = setInterval(async () => {
            if (user) {
              await incrementRank(
                `${y.user.id}#${x.guild.id}`,
                y.user.username
              );

              const user1 = await userSchema.findOne(
                {
                  id: `${y.user.id}#${x.guild.id}`,
                },
                (err, user) => {
                  if (err) console.log(err);
                  if (!user) {
                    if (y.user.id === "589693244456042497") return;
                    const newUser = new userSchema({
                      id: `${y.user.id}#${x.guild.id}`,
                      name: y.user.username,
                      messages_count: 0,
                      rank: 0,
                    });

                    return newUser.save();
                  }
                }
              );

              await levelUp(y, x.guild.id, user1, user1.rank);
            }
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.channel === undefined && newState.channel !== undefined) {
    // User join a voice channel
    console.log("joined");
    if (newUserChannel.type === "voice") {
      const user = await userSchema.findOne(
        {
          id: `${newState.id}#${newState.guild.id}`,
        },
        (err, user) => {
          if (err) console.log(err);
          if (!user) {
            if (newState.id === "589693244456042497") return;
            const newUser = new userSchema({
              id: `${newState.id}#${newState.guild.id}`,
              name: y.user.username,
              messages_count: 0,
              rank: 0,
            });

            return newUser.save();
          }
        }
      );

      // User leaves a voice channel

      timers[newState.guild.id] = {};
      intervals[newState.guild.id] = {};

      timers[newState.guild.id][newState.id] = setTimeout(() => {
        intervals[newState.guild.id][newState.id] = setInterval(async () => {
          if (user) {
            await incrementRank(
              `${newState.id}#${newState.guild.id}`,
              y.user.username
            );

            const user1 = await userSchema.findOne(
              {
                id: `${newState.id}#${newState.guild.id}`,
              },
              (err, user) => {
                if (err) console.log(err);
                if (!user) {
                  if (newState.id === "589693244456042497") return;
                  const newUser = new userSchema({
                    id: `${newState.id}#${newState.guild.id}`,
                    name: y.user.username,
                    messages_count: 0,
                    rank: 0,
                  });

                  return newUser.save();
                }
              }
            );

            await levelUp(newMember, newState.guild.id, user1, user1.rank);
          }
        }, millisPerHour);
      }, millisToTheHour);
    }
  } else if (newState.channel === null) {
    // User leaves a voice channel

    console.log("exit", newState.guild.id);

    try {
      if (
        timers[newState.guild.id][newState.id] &&
        intervals[newState.guild.id][newState.id]
      ) {
        console.log("clear");
        clearTimeout(timers[oldState.guild.id][newState.id]);
        clearInterval(intervals[oldState.guild.id][newState.id]);
      }
    } catch (e) {
      console.error(e);
    }
  }
});

client.on("message", async (message) => {
  const input = message.content;
  const args = input.split(" ").slice(1, input.split(" ").length);

  const RemotePrefix = await config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config({
          id: message.author.id,
          guildPrefix: "!",
          guildNotificationChannelID: null,
          welcomeChannel: null,
        });

        return newServer.save();
      }
    }
  );

  const prefx =
    RemotePrefix?.guildPrefix !== prefix ? RemotePrefix?.guildPrefix : prefix;

  console.log("command", prefix, input, args);

  const command =
    input.charAt(0) === prefx ? input.substr(1).split(" ")[0] : input;

  const user = await userSchema.findOne(
    {
      id: `${message.author.id}#${message.guild.id}`,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: `${message.author.id}#${message.guild.id}`,
          name: message.author.username,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
    }
  );

  if (message.author.bot) return;

  if (user) {
    await incrementMessages(
      `${message.author.id}#${message.guild.id}`,
      message.author.username
    );
    if (user.messages_count % 25 === 0) {
      await incrementRank(
        `${message.author.id}#${message.guild.id}`,
        message.author.username
      );
      await levelUp(message.member, message.guild.id, user, user.rank);
    }
  }

  const perms = message.member.permissions;
  const canManageRoles = perms.has("MANAGE_ROLES");
  const isAdmin = perms.has("ADMINISTRATOR");
  if (message.content.charAt(0) === prefx) {
    if (command === "rank") {
      if (message.mentions.members.first()) {
        const member = message.mentions.members.first();
        const userMentioned = await userSchema.findOne(
          {
            id: `${member.user.id}#${message.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              if (member.user.id === "589693244456042497") return;
              const newUser = new userSchema({
                id: `${member.user.id}#${message.guild.id}`,
                name: member.user.username,
                messages_count: 0,
                rank: 0,
              });

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
    } else if (command === "propic") {
      message.channel.send(message.author.avatarURL({ format: "png" }));
    } else if (command === "help") {
      const pollRegex = /--poll\s+(\S+)/gi;
      const pollHelp = input.match(pollRegex);

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
          .addField(
            `\`\`\`--option\`\`\``,
            "you must enter at least two option"
          )
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
          `\`\`\`${RemotePrefix.guildPrefix || prefix}propic\`\`\``,
          "It shows your profile image"
        )
        .addField(
          `\`\`\`${RemotePrefix.guildPrefix || prefix}setPrefix\`\`\``,
          "It allows you to set a new command prefix"
        )
        .addField(
          `\`\`\`${
            RemotePrefix.guildPrefix || prefix
          }setNotificationChannel\`\`\``,
          "It allows you to set a new text channel where the notification will be sent"
        )
        .addField(
          `\`\`\`${RemotePrefix.guildPrefix || prefix}poll\`\`\``,
          "It allows you to create a poll, use --poll to get more information"
        );

      return message.channel.send(embed);
    } else if (command === "github") {
      const embed = new Discord.MessageEmbed()
        .setTitle("GitHub")
        .setColor("#8966FF")
        .setURL("https://github.com/Ladvace/DiscordBot")
        .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
        .setDescription(
          "This is my repository! You can check out more about the wiseman-bot"
        );

      return message.channel.send(embed);
    }
    // else if (command === "createRole") {
    //   // Check if a member has a specific permission on the guild!

    //   if (canManageRoles) {
    //     message.guild.roles
    //       .create({
    //         data: {
    //           name: args[0],
    //           color: args[1],
    //         },
    //       })
    //       .then(console.log, message.channel.send(`${args[0]} role Created!`))
    //       .catch(console.error, `ther was a problem when creating your role!`);
    //   }
    // }
    else if (command === "assignRole") {
      let role = message.guild.roles.cache.find(
        (role) => role.name === args[0]
      );
      let member = message.mentions.members.first();

      if (canManageRoles) {
        member.roles
          .add(role)
          .then(
            message.channel.send(
              `**${args[0]}** role assigned to **${member.user.username}**`
            )
          )
          .catch(console.error);
      }
    }
    // else if (command === "reset") {
    //   let member = message.mentions.members.first();

    //   if (isAdmin) {
    //     if (member) {
    //       member.roles.remove([...member.guild.roles.cache.keyArray()]);

    //       await userSchema.findOne(
    //         {
    //           id: `${member.id}#${message.guild.id}`,
    //         },
    //         (err, user) => {
    //           if (err) console.log(err);
    //           if (!user) {
    //             if (member.id === "589693244456042497") return;
    //             const newUser = new userSchema({
    //               id: `${member.id}#${message.guild.id}`,
    //               name: member.user.username,
    //               messages_count: 0,
    //               rank: 0,
    //             });

    //             return newUser.save();
    //           } else {
    //             user.messages_count = args[1];
    //             user.rank = args[1];

    //             user.save();
    //           }
    //         }
    //       );
    //     } else {
    //       message.member.roles.remove([
    //         ...message.member.guild.roles.cache.keyArray(),
    //       ]);

    //       await userSchema.findOne(
    //         {
    //           id: `${message.author.id}#${message.guild.id}`,
    //         },
    //         (err, user) => {
    //           if (err) console.log(err);

    //           if (!user) {
    //             if (message.author.id === "589693244456042497") return;
    //             const newUser = new userSchema({
    //               id: `${message.author.id}#${message.guild.id}`,
    //               name: message.author.username,
    //               messages_count: 0,
    //               rank: 0,
    //             });

    //             return newUser.save();
    //           } else {
    //             user.messages_count = 0;
    //             user.rank = 0;

    //             user.save();
    //           }
    //         }
    //       );
    //     }
    //   }

    //   return message.channel.send("Your rank has been reset!");
    // }
    else if (command === "setPrefix") {
      if (isAdmin && args[0].length === 1) {
        await config.findOne(
          {
            id: message.guild.id,
          },
          (err, server) => {
            if (err) console.log(err);
            if (!server) {
              const newServer = new config({
                id: message.guild.id,
                guildPrefix: "!",
                guildNotificationChannelID: null,
                welcomeChannel: null,
              });

              return newServer.save();
            }

            if (server) {
              server.guildPrefix = args[0].trim();
              server.save();
              return message.channel.send(`prefix setted to ${args[0]}`);
            }
          }
        );
      }
    } else if (command === "setNotificationChannel") {
      if (isAdmin) {
        await config.findOne(
          {
            id: message.guild.id,
          },
          (err, server) => {
            if (err) console.log(err);
            if (!server) {
              const newServer = new config({
                id: message.guild.id,
                guildPrefix: "!",
                guildNotificationChannelID: null,
                welcomeChannel: null,
              });

              return newServer.save();
            }
            if (server) {
              server.guildNotificationChannelID = args[0].trim();
              server.save();
              return message.channel.send(
                `notification channel setted to ${args[0]}`
              );
            }
          }
        );
      }
    } else if (command === "poll") {
      const timeoutRegex = /--timeout\s+(\S+)/gi;
      const optionRegex = /--option\s+(\S+)/gi;
      const questionRegex = /--question\s+(\S+)/gi;

      if (!input.match(optionRegex) || !input.match(questionRegex))
        return message.channel.send("Command not Valid");

      const optionValues = input
        .match(optionRegex)
        ?.map((x) => x.replace(/\s\s+/g, " ").split(" ")[1]);

      const question = input
        .match(questionRegex)[0]
        .replace(/\s\s+/g, " ")
        .split(" ")[1];

      const timeOut =
        input.match(timeoutRegex) &&
        input.match(timeoutRegex)[0].replace(/\s\s+/g, " ").split(" ")[1];

      if (optionValues.length < 2 || !question)
        return message.channel.send(
          "You need to provide at least two options and a question in order to male a poll!"
        );

      if (optionValues.length >= 10)
        return message.channel.send("You can enter a maximum of 10 option.");

      const emoji = [
        "0️⃣",
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "9️⃣",
        "🔟",
      ];

      const date = Date.now();
      const hoursToMinutes =
        60 * (timeOut && typeof Number(timeOut) === "number" ? timeOut : 60);
      const hoursToMilliseconds = 60 * hoursToMinutes * 1000;
      const datePlusHour =
        timeOut && typeof Number(timeOut) === "number"
          ? date + hoursToMilliseconds
          : date + 3600000;

      if (optionValues.length === 0 || !question)
        return message.channel.send("Command not valid!");
      if (optionValues.length >= 10) return;

      const embed = new Discord.MessageEmbed()
        .setTitle("Poll")
        .addField(question, "\u200B")
        .setColor("#8966FF")
        .addField(
          "React to this message with the corresponding emoji to vote for that option.",
          "\u200B"
        )
        .addFields(
          ...optionValues
            .map((x, i) => {
              console.log(x);
              if (x !== "--option" && x !== "--question") {
                return {
                  name: `${emoji[i]} :  ${x}`,
                  value: "\u200B",
                  inline: false,
                };
              }
            })
            .filter((x) => x)
        )
        .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
        .setTimestamp(datePlusHour)
        .setFooter("Ends", null);

      const embedMessage = await message.channel.send(embed);

      await Promise.all(
        optionValues.map(async (x, i) => {
          if (x !== "--option" && x !== "--question")
            await embedMessage.react(emoji[i]);
        })
      );

      const sumReducer = (accumulator, currentValue) =>
        accumulator + currentValue;

      const scoreTest = (answer, questions) => {
        let score = (answer / questions) * 100;
        return score;
      };

      polls[message.guild.id] = {};
      const dateTimeStamp = +new Date();
      polls[message.guild.id][dateTimeStamp] = {
        ended: false,
        timer: setTimeout(() => {
          Object.entries(pollAnswers).map((x) => {
            const sum = Object.values(pollAnswers).reduce(sumReducer);

            poolSolution[x[0]] = sum > 0 ? Math.floor(scoreTest(x[1], sum)) : 0;
          });
          console.log(
            "pool",
            hoursToMilliseconds,
            message.guild.id,
            dateTimeStamp,
            polls[message.guild.id][dateTimeStamp]
          );
          polls[message.guild.id][dateTimeStamp].ended = true;
          clearTimeout(polls[message.guild.id][dateTimeStamp].timer);

          let newEmbed = new Discord.MessageEmbed()
            .setTitle("Poll Ended")
            .addField(question, "\u200B")
            .setColor("#8966FF")
            .addField(
              "React to this message with the corresponding emoji to vote for that option.",
              "\u200B"
            )
            .addFields(
              ...Object.entries(pollAnswers).map((x) => {
                return {
                  name: `${x[0]} :  ${poolSolution[x[0]] || 0}%`,
                  value: "\u200B",
                  inline: false,
                };
              })
            )
            .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
            .setTimestamp(+new Date())
            .setFooter("Ended", null);

          embedMessage.edit(newEmbed);
        }, hoursToMilliseconds),
      };
    }
  }
});

client.on("messageReactionAdd", async (reaction) => {
  // When we receive a reaction we check if the reaction is partial or not
  pollAnswers[reaction.emoji.name] = reaction.count - 1;

  if (reaction.partial) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  // const channel = member.guild.channels.cache.find(
  //   (ch) => ch.name === "general"
  // );

  // const channel = member.guild.channels.cache.get(

  // );

  console.log("guildMemberAdd", member.guild.channels.cache);
  const server = await config.findOne(
    {
      id: member.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config({
          id: x,
          guildPrefix: "!",
          guildNotificationChannelID: null,
          welcomeChannel: null,
        });

        return newServer.save();
      }
    }
  );

  if (!server.welcomeChannel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !participate`
  );
});

client.login(process.env.TOKEN);
