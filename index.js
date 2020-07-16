const Discord = require("discord.js");
const { prefix, minutes } = require("./config.json");
const env = require("dotenv").config();
const client = new Discord.Client();
const Sequelize = require("sequelize");

let millisPerHour = 60 * minutes * 1000; //1hour
let millisPastTheHour = Date.now() % millisPerHour;
let millisToTheHour = millisPerHour - millisPastTheHour;

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // operatorsAliases: false,
  // SQLite only
  storage: "database.sqlite",
});

const levelUp = (message, user, level, color) => {
  if (user.get("rank") > 0) {
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

    // > <@!163300027618295808>
    // let member = `<@!${message.user.id}>`;
    // let member = message.members;

    // console.log("member", member);

    message
      .addRole(role)
      .then((x) => {
        return true;
      })
      .catch(console.error);
  }
};

const Tags = sequelize.define("leaderboard", {
  // serverName: {
  //   type: Sequelize.STRING,
  //   unique: true,
  //   defaultValue: null,
  //   allowNull: false,
  // },
  id: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true,
    defaultValue: null,
    allowNull: false,
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
  time_rank: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

let timers = {};
let intervals = {};

client.once("ready", async () => {
  console.log("Ready!");
  Tags.sync();

  client.channels.map((x) => {
    if (x.type === "voice") {
      x.members.map(async (y) => {
        const user = await Tags.findOne({
          where: { id: y.user.id },
        });

        timers[y.user.id] = setTimeout(function () {
          console.log("start");
          intervals[y.user.id] = setInterval(function () {
            // console.log("p", y);
            if (user) {
              const isLevelUp = levelUp(y, user, user.get("rank"));
              if (isLevelUp) {
                message.channel.send(
                  `${y.user.name} has been levelled up to ${user.get("rank")}`
                );
              }
              user.increment("rank");
            }
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });
});

// client.on("message", async message => {

// });

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User join a voice channel

    const user = await Tags.findOne({
      where: { id: newMember.user.id },
    });

    if (newUserChannel.type === "voice") {
      const user = await Tags.findOne({
        where: { id: newMember.user.id },
      });
      timers[newMember.user.id] = setTimeout(() => {
        intervals[newMember.user.id] = setInterval(() => {
          console.log("x");
          if (user) {
            user.increment("rank");
          }
        }, millisPerHour);
      }, millisToTheHour);
      // timers[newMember.user.username];
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel

    if (timers[newMember.user.id] && intervals[newMember.user.id]) {
      console.log("exit");
      clearTimeout(timers[newMember.user.id]);
      clearInterval(intervals[newMember.user.id]);
    }
  }
});

client.on("message", async (message) => {
  const input = message.content;
  const args = input.split(" ").slice(1, input.split(" ").length);
  const command =
    input.charAt(0) === prefix ? input.substr(1).split(" ")[0] : input;
  console.log("EE", message.mentions.members.first());
  const user = await Tags.findOne({
    where: { id: message.author.id },
  });

  // console.log("MMMM", message.guild.roles);
  // console.log("MMMM", message.member.guild.name);
  // console.log("MMMM", message.author.id);
  if (message.author.bot) return;

  // user.get("messages_count")

  if (user) {
    try {
      console.log(
        "message",
        message.content,
        command
        // user.get("messages_count"),
        // user.get("rank")
      );
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
        id: message.author.id,
        messages_count: 0,
        rank: 0,
      });
    }
  } else {
    const user = await Tags.create({
      id: message.author.id,
      messages_count: 0,
      rank: 0,
    });
  }

  if (message.content.charAt(0) === prefix) {
    if (command === "partecipate") {
      try {
        const user = await Tags.create({
          id: message.author.id,
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
        console.log("fr");
        let embed = new Discord.RichEmbed()
          .setAuthor(message.author.username)
          .setColor("#008140")
          .setThumbnail(message.author.avatarURL)
          .addField("Rank", user.get("rank"));
        return message.channel.send(embed);
        // return message.channel.send(`your rank is ${user.get("rank")}`);
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
      console.log("WHY");
      message.guild
        .createRole({
          name: args[0],
          color: args[1],
        })
        .then(console.log, message.channel.send(`${args[0]} role Created!`))
        .catch(console.error, `ther was a problem when creating your role!`);
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
        { where: { id: message.author.id } }
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
    where: { id: member.user.id },
  });

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !partecipate`
  );
});

client.login(process.env.TOKEN);
