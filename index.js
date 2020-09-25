"use strict";
const Discord = require("discord.js");
const { prefix, minutes } = require("./config.json");
const env = require("dotenv").config();
const client = new Discord.Client();
const Sequelize = require("sequelize");
const mongoose = require("mongoose");
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

const incrementRank = async (id) => {
  await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
      if (user) {
        user.rank = user.rank + 1;
        user.save();
        console.log("increment2");
      }
    }
  );
};

const incrementMessages = async (id) => {
  await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
      if (user) {
        user.messages_count = user.messages_count + 1;
        user.save();
        console.log("incrementMessage");
      }
    }
  );
};

const getUserInfo = async (id) => {
  const user = await userSchema.findOne(
    {
      id: id,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: id,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
      if (user) {
        user.messages_count = user.messages_count + 1;
        user.save();
        console.log("incrementMessage");
      }
    }
  );
  return user;
};

const levelUp = async (message, guildId, user, level) => {
  if (message.user.id === client.user.id) return;
  // if (message.user.id === "589693244456042497") return;

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
        });

        return newServer.save();
      }
    }
  );
  console.log(
    "dd",
    // client.channels.cache.filter((x) => x.type === "text"),
    guildId,
    notificationChannelID.guildNotificationChannelID
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

    console.log("level Up", role);
    let embed = new Discord.MessageEmbed()
      .setAuthor(message.user.username)
      .setColor("#8966ff")
      .setThumbnail(message.user.avatarURL({ format: "png" }))
      .addField("Rank", `${level}`);

    const newRole = message.guild.roles.cache.find((role) =>
      role.name === user.rank < 500 ? `Level ${level}` : `Level 500+`
    );

    const ch = client.channels.cache.get(
      notificationChannelID.guildNotificationChannelID
    );
    if (!role) {
      console.log("CreatingRole");

      message.guild.roles
        .create({
          name: user.rank < 500 ? `Level ${level}` : `Level 500+`,
          color: "#8966ff",
        })
        .then(console.log)
        .catch(console.error);

      if (notificationChannelID.guildNotificationChannelID) {
        console.log("CH", ch);

        message.roles
          .add(newRole)
          .then((x) => {
            return ch.send(embed);
          })
          .catch(console.error);
      }
    } else {
      console.log("existing role");
      if (Oldrole) {
        message.roles.remove(Oldrole);
      }
      message.roles
        .add(newRole)
        .then((x) => {
          return ch.send(embed);
        })
        .catch(console.error);
    }
  }
};

let timers = {};
let intervals = {};

// client.guilds.cache.map((x) => console.log(x));

client.once("ready", async () => {
  console.log("Ready!");

  client.guilds.cache.keyArray().map(async (x) => {
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
          });

          return newServer.save();
        }
      }
    );
  });

  client.channels.cache.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        console.log("da!", `${y.user.id}#${x.guild.id}`);

        await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              const newUser = new userSchema({
                id: `${y.user.id}#${x.guild.id}`,
                messages_count: 0,
                rank: 0,
              });

              return newUser.save();
            }
          }
        );

        console.log("Join1", y.user.id, x.guild.id);

        const user = await userSchema.findOne(
          {
            id: `${y.user.id}#${x.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              const newUser = new userSchema({
                id: `${y.user.id}#${x.guild.id}`,
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
          console.log("start", x.guild.id, y.user.id);

          intervals[x.guild.id][y.user.id] = setInterval(async () => {
            if (user) {
              console.log("PPP");

              await incrementRank(`${y.user.id}#${x.guild.id}`);

              const user1 = await userSchema.findOne(
                {
                  id: `${y.user.id}#${x.guild.id}`,
                },
                (err, user) => {
                  if (err) console.log(err);
                  if (!user) {
                    const newUser = new userSchema({
                      id: `${y.user.id}#${x.guild.id}`,
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
  // oldState, newState
  // let newUserChannel = newMember.voiceChannel;
  // let oldUserChannel = oldMember.voiceChannel;

  // console.log("jo", oldState.channel);
  console.log("jo1", newState.guild.id, newState.id);
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
            const newUser = new userSchema({
              id: `${newState.id}#${newState.guild.id}`,
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
            console.log("increment");
            await incrementRank(`${newState.id}#${newState.guild.id}`);

            const user1 = await userSchema.findOne(
              {
                id: `${newState.id}#${newState.guild.id}`,
              },
              (err, user) => {
                if (err) console.log(err);
                if (!user) {
                  const newUser = new userSchema({
                    id: `${newState.id}#${newState.guild.id}`,
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
    console.log(
      "jo",
      newState.guild.id,
      newState.id,
      timers[newState.guild.id],
      intervals[newState.guild.id]
    );

    console.log(
      "exit",
      timers[newState.guild.id][newState.id],
      intervals[newState.guild.id][newState.id]
    );

    if (
      timers[newState.guild.id][newState.id] &&
      intervals[newState.guild.id][newState.id]
    ) {
      console.log("clear");
      clearTimeout(timers[oldState.guild.id][newState.id]);
      clearInterval(intervals[oldState.guild.id][newState.id]);
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
        });

        return newServer.save();
      }
    }
  );

  const prefx =
    RemotePrefix?.guildPrefix !== prefix ? RemotePrefix?.guildPrefix : prefix;

  const command =
    input.charAt(0) === prefx ? input.substr(1).split(" ")[0] : input;
  console.log("COmmand", prefx);

  const user = await userSchema.findOne(
    {
      id: `${message.author.id}#${message.guild.id}`,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: `${message.author.id}#${message.guild.id}`,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
    }
  );

  if (message.author.bot) return;

  if (user) {
    await incrementMessages(`${message.author.id}#${message.guild.id}`);
    if (user.messages_count % 25 === 0) {
      await incrementRank(`${message.author.id}#${message.guild.id}`);
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

        const user = await userSchema.findOne(
          {
            id: `${member.user.id}#${message.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              const newUser = new userSchema({
                id: `${member.user.id}#${message.guild.id}`,
                messages_count: 0,
                rank: 0,
              });

              return newUser.save();
            }
          }
        );
        const userMentioned = await userSchema.findOne(
          {
            id: `${member.user.id}#${message.guild.id}`,
          },
          (err, user) => {
            if (err) console.log(err);
            if (!user) {
              const newUser = new userSchema({
                id: `${member.user.id}#${message.guild.id}`,
                messages_count: 0,
                rank: 0,
              });

              return newUser.save();
            }
          }
        );

        if (userMentioned) {
          let embed = new Discord.MessageEmbed()
            .setAuthor(member.user.username)
            .setColor("#8966ff")
            .setThumbnail(member.user.avatarURL({ format: "png" }))
            .addField("Rank", userMentioned.rank);
          return message.channel.send(embed);
        }
      } else {
        if (user) {
          console.log("NuserMen");
          let embed = new Discord.MessageEmbed()
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
      let embed = new Discord.MessageEmbed()
        .setTitle("Commands")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addField("!rank", "It shows you the  rank")
        .addField("!gitHub", "It gives you the link of the github repo")
        .addField("!reset", "reset the rank")
        .addField("!help", `probably you already know that 😄`)
        .addField("!propic", "It shows your profile image");

      return message.channel.send(embed);
    } else if (command === "github") {
      let embed = new Discord.MessageEmbed()
        .setTitle("GitHub")
        .setColor("#8966FF")
        .setURL("https://github.com/Ladvace/DiscordBot")
        .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
        .setDescription(
          "This is my repository! You can check out more about the wiseman-bot"
        );

      return message.channel.send(embed);
    } else if (command === "createRole") {
      // Check if a member has a specific permission on the guild!

      if (canManageRoles) {
        message.guild.roles
          .create({
            name: args[0],
            color: args[1],
          })
          .then(console.log, message.channel.send(`${args[0]} role Created!`))
          .catch(console.error, `ther was a problem when creating your role!`);
      }
    } else if (command === "assignRole") {
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
    } else if (command === "reset") {
      let member = message.mentions.members.first();

      if (isAdmin) {
        if (member) {
          console.log("ccc", args[1]);
          member.roles.remove([...member.guild.roles.cache.keyArray()]);

          await userSchema.findOne(
            {
              id: `${member.id}#${message.guild.id}`,
            },
            (err, user) => {
              if (err) console.log(err);
              if (!user) {
                const newUser = new userSchema({
                  id: `${member.id}#${message.guild.id}`,
                  messages_count: 0,
                  rank: 0,
                });

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
                const newUser = new userSchema({
                  id: `${message.author.id}#${message.guild.id}`,
                  messages_count: 0,
                  rank: 0,
                });

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

      return message.channel.send("Your rank has been reset!");
    } else if (command === "setPrefix") {
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
        console.log(args[0]);
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
    }
    // } else if (command === "pool") {
    //   let embed = new Discord.MessageEmbed()
    //     .setTitle("GitHub")
    //     .setColor("#8966FF")
    //     .setURL("https://github.com/Ladvace/DiscordBot")
    //     .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
    //     .setDescription(
    //       "This is my repository! You can check out more about the wiseman-bot"
    //     );

    //   return message.channel.send(embed);
    // }
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "general"
  );

  const user = await userSchema.findOne(
    {
      id: `${member.user.id}#${member.guild.id}`,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema({
          id: `${member.user.id}#${member.guild.id}`,
          messages_count: 0,
          rank: 0,
        });

        return newUser.save();
      }
    }
  );

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !participate`
  );
});

client.login(process.env.TOKEN);
