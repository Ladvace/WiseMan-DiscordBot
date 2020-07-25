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

const levelUp = (message, user, level, color) => {
  if (user.get("rank") > 0 && user.get("rank") % 10 === 0) {
    let role = message.guild.roles.find(
      (role) => role.name === `Level ${level}`
    );
    if (!role) {
      message.guild
        .createRole({
          name: user.get("rank") < 250 ? `Level ${level}` : `Level 250+`,
          color: color,
        })
        .then(console.log)
        .catch(console.error);
    }

    // console.log("member", member);
    // if (!user.roles.has(role.id)) {
    // console.log("a", role);
    message
      .addRole(role)
      .then((x) => {
        return true;
      })
      .catch(console.error);
    // }
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

async function interval(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setInterval(resolve, ms));
}

const taskResolution = (func, period) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      func().then((data) => {
        if (data === "failure") {
          clearInterval(interval);
          reject(Error("fail"));
        } else if (data === "success") {
          resolve("complete");
        }
        // keep on waiting
      });
    }, period);
  });
};

client.once("ready", async () => {
  console.log("Ready!");
  Tags.sync();

  client.channels.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        try {
          const addUser = await Tags.create({
            id: `${y.user.id}#${x.guild.name}`,
            messages_count: 0,
            rank: 0,
          });
        } catch (e) {}
        const user = await Tags.findOne({
          where: { id: `${y.user.id}#${x.guild.name}` },
        });
        // timers[y.user.id] = 1;
        // setInterval(function () {
        // user.increment("rank", { by: 1 });
        // timers[x.guild.name][y.user.id] = 1;
        // user.increment("rank");
        console.log(
          "TES",
          user.get("rank"),
          x.guild.name,
          `${y.user.id}#${x.guild.name}`
        );
        // }, 10000);
        timers[x.guild.name] = {};
        intervals[x.guild.name] = {};

        timers[x.guild.name][y.user.id] = setTimeout(async () => {
          console.log("start");
          intervals[x.guild.name][y.user.id] = setInterval(async () => {
            if (user) {
              console.log("PPP");
              // test();

              setTimeout(() => {
                console.log("BB", user.get("rank"));
              }, 4000);

              const isLevelUp = levelUp(y, user, user.get("rank"));
              if (isLevelUp) {
                message.channel.send(
                  `${y.user.name} has been levelled up to ${user.get("rank")}`
                );
              }
              await user.increment("rank");
            } else {
              const addUser = await Tags.create({
                id: `${y.user.id}#${x.guild.name}`,
                messages_count: 0,
                rank: 0,
              });
            }
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });
});

// setInterval(async () => {
//   const user = await Tags.findOne({
//     where: { id: "163300027618295808#TEST" },
//   });
//   if (user) {
//     console.log("GG", user.get("rank"));
//   }
// }, millisPerHour);

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User join a voice channel

    const user = await Tags.findOne({
      where: { id: `${newMember.user.id}#${newMember.guild.name}` },
    });

    if (newUserChannel.type === "voice") {
      const user = await Tags.findOne({
        where: { id: `${newMember.user.id}#${newMember.guild.name}` },
      });
      console.log("EE", newMember.guild.name, newMember.user.id);

      timers[newMember.guild.name] = {};
      intervals[newMember.guild.name] = {};

      timers[newMember.guild.name][newMember.user.id] = setTimeout(() => {
        intervals[newMember.guild.name][newMember.user.id] = setInterval(() => {
          console.log("CC", user.get("rank"));
          if (user) {
            user.increment("rank");
          }
        }, millisPerHour);
      }, millisToTheHour);
      // timers[newMember.user.username];
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel

    if (
      timers[newMember.guild.name][newMember.user.id] &&
      intervals[newMember.guild.name][newMember.user.id]
    ) {
      console.log("exit");
      clearTimeout(timers[oldMember.guild.name][newMember.user.id]);
      clearInterval(intervals[oldMember.guild.name][newMember.user.id]);
    }
  }
});

client.on("message", async (message) => {
  const input = message.content;
  const args = input.split(" ").slice(1, input.split(" ").length);
  const command =
    input.charAt(0) === prefix ? input.substr(1).split(" ")[0] : input;
  const user = await Tags.findOne({
    where: { id: `${message.author.id}#${message.guild.name}` },
  });

  console.log("MMMM", message.guild.name);

  if (message.author.bot) return;

  if (user) {
    try {
      user.increment("messages_count");
      if (user.get("messages_count") === 25) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv 1`
        );
      } else if (user.get("messages_count") === 50) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 100) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 150) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") === 200) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      } else if (
        user.get("messages_count") > 200 &&
        user.get("messages_count") % 100 === 0
      ) {
        user.increment("rank");
        levelUp(message, user, user.get("rank"));
        return message.channel.send(
          `**${message.author.username}** reached lv ${user.get("rank")}`
        );
      }
    } catch (e) {
      console.log("user do not exist");
      const user = await Tags.create({
        id: `${message.author.id}#${message.guild.name}`,
        messages_count: 0,
        rank: 0,
      });
    }
  } else {
    console.log("TTESTGH", message.guild.name);
    const user = await Tags.create({
      id: `${message.author.id}#${message.guild.name}`,
      messages_count: 0,
      rank: 0,
    });
  }

  if (message.content.charAt(0) === prefix) {
    if (command === "participate") {
      try {
        const user = await Tags.create({
          id: `${message.author.id}#${message.guild.name}`,
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
      if (user) {
        console.log("userR", user.get("rank"));
        let embed = new Discord.RichEmbed()
          .setAuthor(message.author.username)
          .setColor("#008140")
          .setThumbnail(message.author.avatarURL)
          .addField("Rank", user.get("rank"));
        return message.channel.send(embed);
        // return message.channel.send(`your rank is ${user.get("rank")}`);
      } else {
        await Tags.create({
          id: `${message.author.id}#${message.guild.name}`,
          messages_count: 0,
          rank: 0,
        });
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
      const reset = await Tags.update(
        { rank: 0, messages_count: 0 },
        { where: { id: `${message.author.id}#${message.guild.name}` } }
      );

      console.log(reset);
      return message.channel.send("Your text-rank has been reset!");
      // if (reset > 0) {
      // }
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.find((ch) => ch.name === "general");
  const user = await Tags.findOne({
    where: { id: `${member.user.id}#${member.guild.name}` },
  });

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !participate`
  );
});

client.login(process.env.TOKEN);
