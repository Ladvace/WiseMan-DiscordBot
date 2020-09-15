const Discord = require("discord.js");
const { prefix, minutes } = require("./config.json");
const env = require("dotenv").config();
const client = new Discord.Client();
const Sequelize = require("sequelize");

let millisPerHour = 60 * minutes * 1000; //h
let millisPastTheHour = Date.now() % millisPerHour;
let millisToTheHour = millisPerHour - millisPastTheHour;

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

const levelUp = async (message, user, level, color) => {
  //   (x) =>
  //     // (x) => console.log("TEST", x.name, x.id)
  //     x.name === "general"
  // );
  const ch = client.channels.get("749314643972849757");

  if (user.get("rank") > 0 && user.get("rank") % 10 === 0) {
    const Oldrole = message.guild.roles.find(
      (role) => role.name === `Level ${level - 10}`
    );

    const role = message.guild.roles.find(
      (role) =>
        role.name === (user.get("rank") < 500 ? `Level ${level}` : `Level 500+`)
    );

    console.log("RRROLE", ch.id);

    let embed = new Discord.RichEmbed()
      .setAuthor(message.user.username)
      .setColor("#008140")
      .setThumbnail(message.user.avatarURL)
      .addField("Rank", `${level}`);

    if (!role) {
      console.log("CreatingRole");

      message.guild
        .createRole({
          name: user.get("rank") < 500 ? `Level ${level}` : `Level 500+`,
          color: color,
        })
        .then(console.log)
        .catch(console.error);

      const newRole = message.guild.roles.find((role) =>
        role.name === user.get("rank") < 500 ? `Level ${level}` : `Level 500+`
      );

      message
        .addRole(newRole)
        .then((x) => {
          return ch.send(embed);
        })
        .catch(console.error);
    } else {
      if (Oldrole) {
        message.removeRole(Oldrole);
      }
      message
        .addRole(role)
        .then((x) => {
          return ch.send(embed);
        })
        .catch(console.error);
    }
  }
};

const Tags = sequelize.define("leaderboard", {
  id: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
    defaultValue: null,
    allowNull: true,
  },
  messages_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  rank: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
});

let timers = {};
let intervals = {};

client.once("ready", async (z) => {
  console.log("Ready!");
  Tags.sync();

  client.channels.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        const userExist = await Tags.findOne({
          where: { id: `${y.user.id}#${x.guild.id}` },
        });
        console.log("ID", `${y.user.id}#${x.guild.id}`);
        try {
          if (!userExist) {
            await Tags.create({
              id: `${y.user.id}#${x.guild.id}`,
              messages_count: 0,
              rank: 0,
            });
          }
        } catch (e) {
          console.error(e);
        }
        const user = await Tags.findOne({
          where: { id: `${y.user.id}#${x.guild.id}` },
        });

        timers[x.guild.id] = {};
        intervals[x.guild.id] = {};

        timers[x.guild.id][y.user.id] = setTimeout(async () => {
          console.log("start");
          intervals[x.guild.id][y.user.id] = setInterval(async () => {
            if (user) {
              // let ch = client.channels.get("691542704093528128");
              // let ch = client.channels.get((c) => c.name === "General");
              console.log("PPP");
              // ch.send("TT");
              await user.increment("rank");

              const user1 = await Tags.findOne({
                where: { id: `${y.user.id}#${x.guild.id}` },
              });

              const isLevelUp = await levelUp(
                y,
                user1,
                user1.getDataValue("rank")
              );

              // if (isLevelUp) {
              //   console.log("levelUp");
              //   ch.send(
              //     `${y.user.name} has been levelled up to ${user.get("rank")}`
              //   );
              // }
            } else {
              try {
                await Tags.create({
                  id: `${y.user.id}#${x.guild.id}`,
                  messages_count: 0,
                  rank: 0,
                });
              } catch (e) {
                console.error(e);
              }
            }
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User join a voice channel
    if (newUserChannel.type === "voice") {
      const user = await Tags.findOne({
        where: { id: `${newMember.user.id}#${newMember.guild.id}` },
      });

      timers[newMember.guild.id] = {};
      intervals[newMember.guild.id] = {};

      timers[newMember.guild.id][newMember.user.id] = setTimeout(() => {
        intervals[newMember.guild.id][newMember.user.id] = setInterval(
          async () => {
            if (user) {
              user.increment("rank");
              const user1 = await Tags.findOne({
                where: { id: `${newMember.user.id}#${newMember.guild.id}` },
              });
              await levelUp(newMember, user1, user1.getDataValue("rank"));
            }
          },
          millisPerHour
        );
      }, millisToTheHour);
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel

    if (
      timers[newMember.guild.id][newMember.user.id] &&
      intervals[newMember.guild.id][newMember.user.id]
    ) {
      console.log("exit");
      clearTimeout(timers[oldMember.guild.id][newMember.user.id]);
      clearInterval(intervals[oldMember.guild.id][newMember.user.id]);
    }
  }
});

client.on("message", async (message) => {
  const input = message.content;
  const args = input.split(" ").slice(1, input.split(" ").length);
  const command =
    input.charAt(0) === prefix ? input.substr(1).split(" ")[0] : input;
  const user = await Tags.findOne({
    where: { id: `${message.author.id}#${message.guild.id}` },
  });
  if (message.author.bot) return;

  if (user) {
    try {
      user.increment("messages_count");
      if (user.get("messages_count") === 25) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv 1`
        );
      } else if (user.get("messages_count") === 50) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 100) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 150) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 200) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (
        user.get("messages_count") > 200 &&
        user.get("messages_count") % 100 === 0
      ) {
        user.increment("rank");
        await levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      }
    } catch (e) {
      console.log("user do not exist");
      await Tags.create({
        id: `${message.author.id}#${message.guild.id}`,
        messages_count: 0,
        rank: 0,
      });
    }
  } else {
    await Tags.create({
      id: `${message.author.id}#${message.guild.id}`,
      messages_count: 0,
      rank: 0,
    });
  }

  if (message.content.charAt(0) === prefix) {
    if (command === "participate") {
      try {
        const user = await Tags.create({
          id: `${message.author.id}#${message.guild.id}`,
          messages_count: 0,
          rank: 0,
        });

        return message.reply(`${user.name} added to the leaderboard.`);
      } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
          return message.reply("You are already added.");
        }

        return message.reply(
          "Something went wrong with adding you to the leaderboard."
        );
      }
    } else if (command === "rank") {
      let ddd = message.guild.channels.cache;
      console.log("T", ddd);
      if (user) {
        let embed = new Discord.RichEmbed()
          .setAuthor(message.author.username)
          .setColor("#008140")
          .setThumbnail(message.author.avatarURL)
          .addField("Rank", user.get("rank"));
        return message.channel.send(embed);
        // return message.channel.send(`your rank is ${user.get("rank")}`);
      } else {
        try {
          await Tags.create({
            id: `${message.author.id}#${message.guild.id}`,
            messages_count: 0,
            rank: 0,
          });
        } catch (e) {
          console.error(e);
        }
      }
      return message.reply(`Could not find your rank`);
    } else if (command === "propic") {
      message.channel.send(message.author.avatarURL);
    } else if (command === "help") {
      let embed = new Discord.RichEmbed()
        .setTitle("Commands")
        .setThumbnail("https://i.imgur.com/AtmK18i.png")
        .setColor("#8966FF")
        .addField("!rank", "It shows you the  rank");
      // .addField("!trank", "It shows you the time-based rank")
      // .addField("!reset", "reset the text-based rank")
      // .addField("!timereset", "reset the time-based rank");
      // .addField("!wima", "It shows your profile image");

      return message.channel.send(embed);
    } else if (command === "github") {
      let embed = new Discord.RichEmbed()
        .setTitle("GitHub")
        .setColor("#8966FF")
        .setURL("https://github.com/Ladvace/DiscordBot")
        .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
        .setDescription(
          "This is my repository! You can check out more about the wiseman-bot"
        );

      return message.channel.send(embed);
    } else if (command === "createRole") {
      const perms = message.member.permissions;

      // Check if a member has a specific permission on the guild!
      const canManageRoles = perms.has("MANAGE_ROLES_OR_PERMISSIONS");
      if (canManageRoles) {
        message.guild
          .createRole({
            name: args[0],
            color: args[1],
          })
          .then(console.log, message.channel.send(`${args[0]} role Created!`))
          .catch(console.error, `ther was a problem when creating your role!`);
      }
    } else if (command === "assignRole") {
      let role = message.guild.roles.find((role) => role.name === args[0]);
      let member = message.mentions.members.first();

      member
        .addRole(role)
        .then(
          message.channel.send(
            `**${args[0]}** role assigned to **${member.user.username}**`
          )
        )
        .catch(console.error);
    } else if (command === "reset") {
      await Tags.update(
        { rank: 0, messages_count: 0 },
        { where: { id: `${message.author.id}#${message.guild.id}` } }
      );

      return message.channel.send("Your rank has been reset!");
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.find((ch) => ch.name === "general");
  const user = await Tags.findOne({
    where: { id: `${member.user.id}#${member.guild.id}` },
  });

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !participate`
  );
});

client.login(process.env.TOKEN);
