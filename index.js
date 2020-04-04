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

const Tags = sequelize.define("leaderboard", {
  name: {
    type: Sequelize.STRING,
    unique: true,
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
          where: { name: y.user.username },
        });

        timers[y.user.username] = setTimeout(function () {
          console.log("start");
          intervals[y.user.username] = setInterval(function () {
            if (user) {
              user.increment("time_rank");
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
      where: { name: newMember.user.username },
    });

    if (newUserChannel.type === "voice") {
      const user = await Tags.findOne({
        where: { name: newMember.user.username },
      });
      timers[newMember.user.username] = setTimeout(() => {
        intervals[newMember.user.username] = setInterval(() => {
          if (user) {
            user.increment("time_rank");
          }
        }, millisPerHour);
      }, millisToTheHour);
      // timers[newMember.user.username];
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel

    if (timers[newMember.user.username] && intervals[newMember.user.username]) {
      console.log("exit");
      clearTimeout(timers[newMember.user.username]);
      clearInterval(intervals[newMember.user.username]);
    }
  }
});

client.on("message", async (message) => {
  const input = message.content;
  const command = input.charAt(0) === prefix ? input.substr(1) : input;
  const user = await Tags.findOne({
    where: { name: message.author.username },
  });

  if (message.author.bot) return;

  // user.get("messages_count")

  if (user) {
    try {
      console.log(
        "message",
        message.content,
        command,
        user.get("messages_count"),
        user.get("rank")
      );
      user.increment("messages_count");
      if (user.get("messages_count") == 25) {
        user.increment("rank");

        return message.channel.send(`${message.author.username} reached lv 1`);
      } else if (user.get("messages_count") == 50) {
        user.increment("rank");
        return message.channel.send(
          `${message.author.username} reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") == 100) {
        user.increment("rank");

        return message.channel.send(
          `${message.author.username} reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") == 150) {
        user.increment("rank");

        return message.channel.send(
          `${message.author.username} reached lv ${user.get("rank")}`
        );
      } else if (user.get("messages_count") == 200) {
        user.increment("rank");

        return message.channel.send(
          `${message.author.username} ranked resetted!`
        );
      }
    } catch (e) {
      console.log("user do not exist");
      const user = await Tags.create({
        name: message.author.username,
        messages_count: 0,
        rank: 0,
      });
    }
  } else {
    const user = await Tags.create({
      name: message.author.username,
      messages_count: 0,
      rank: 0,
    });
  }

  if (message.content.charAt(0) === prefix) {
    if (command === "par") {
      try {
        const user = await Tags.create({
          name: message.author.username,
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
    } else if (command === "timereset") {
      const reset = await Tags.update(
        { time_rank: 0 },
        { where: { name: message.author.username } }
      );
      if (reset > 0) {
        return message.channel.send("Your time-rank has been reset!");
      }
    } else if (command === "reset") {
      const reset = await Tags.update(
        { rank: 0, messages_count: 0 },
        { where: { name: message.author.username } }
      );

      console.log(reset);
      return message.channel.send("Your text-rank has been reset!");
      // if (reset > 0) {
      // }
    } else if (command === "trank") {
      if (user) {
        let embed = new Discord.RichEmbed()
          .setAuthor(message.author.username)
          .setThumbnail(message.author.avatarURL)
          .setColor("#008140")
          .addField("Time-Rank", user.get("time_rank"));
        return message.channel.send(embed);
      }
    } else if (command === "help") {
      let embed = new Discord.RichEmbed()
        .setTitle("Commands")
        .setThumbnail("https://i.imgur.com/1MrC4yt.png")
        .setColor("#aa1e32")
        .addField("!rank", "It shows you the text-based rank")
        .addField("!trank", "It shows you the time-based rank")
        .addField("!reset", "reset the text-based rank")
        .addField("!timereset", "reset the time-based rank")
        .addField("!wima", "It shows your profile image")
        .addField("!wima", "It shows your profile image");

      return message.channel.send(embed);
    } else if (command === "github") {
      let embed = new Discord.RichEmbed()
        .setTitle("GitHub")
        .setColor("#aa1e32")
        .setURL("https://github.com/Ladvace/DiscordBot")
        .setThumbnail("https://i.imgur.com/1MrC4yt.png", "")
        .setDescription("This is my repository!");

      return message.channel.send(embed);
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.find((ch) => ch.name === "general");
  const user = await Tags.findOne({
    where: { name: member.user.username },
  });

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipate to the leaderboard using the command !par`
  );
});

client.login(process.env.TOKEN);
