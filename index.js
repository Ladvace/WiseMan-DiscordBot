const Discord = require("discord.js");
const { prefix } = require("./config.json");
const env = require("dotenv").config();
const client = new Discord.Client();
const Sequelize = require("sequelize");

let millisPerHour = 60 * 60 * 1000; //1hour
let millisPastTheHour = Date.now() % millisPerHour;
let millisToTheHour = millisPerHour - millisPastTheHour;

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // operatorsAliases: false,
  // SQLite only
  storage: "database.sqlite"
  
});

const Tags = sequelize.define("leaderboard", {
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  messages_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  rank: {
    type: Sequelize.INTEGER,

    defaultValue: 0,
    allowNull: false
  },
  time_rank: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

let timers = {};
let intervals = {};

client.once("ready", async () => {
  console.log("Ready!");
  Tags.sync();

  client.channels.map(x => {
    if (x.type === "voice") {
      x.members.map(async y => {
        const user = await Tags.findOne({
          where: { name: y.user.username }
        });

        timers[y.user.username] = setTimeout(function() {
          console.log("inizio");
          intervals[y.user.username] = setInterval(function() {
            console.log(y.user.username, "INTERVAL INIT");
            user.increment("time_rank");
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });
});

client.on("message", async message => {
  const user = await Tags.findOne({
    where: { name: message.author.username }
  });

  if (message.channel.type === "voice") {
  }

  if (message.author.bot) return;
  if (user) {
    user.increment("messages_count");
    if (user.get("messages_count") == 25) {
      user.increment("rank");

      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 50) {
      user.increment("rank");
      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 100) {
      user.increment("rank");

      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 150) {
      user.increment("rank");

      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 200) {
      user.increment("rank");

      message.channel.send(`${message.author.username} ranked resetted!`);
    }
    return;
  } else {
    const user = await Tags.create({
      name: message.author.username,
      messages_count: 0,
      rank: 0
    });
  }
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User join a voice channel

    const user = await Tags.findOne({
      where: { name: newMember.user.username }
    });

    if (newUserChannel.type === "voice") {
      const user = await Tags.findOne({
        where: { name: newMember.user.username }
      });
      timers[newMember.user.username] = setTimeout(() => {
        intervals[newMember.user.username] = setInterval(() => {
          user.increment("time_rank");
        }, millisPerHour);
      }, millisToTheHour);
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel

    if (timers[newMember.user.username] && intervals[newMember.user.username]) {
      clearTimeout(timers[newMember.user.username]);
      clearInterval(intervals[newMember.user.username]);
    }
  }
});

client.on("message", async message => {
  const input = message.content;
  const command = input.charAt(0) === prefix ? input.substr(1) : input;
  const user = await Tags.findOne({
    where: { name: message.author.username }
  });

  if (message.content.charAt(0) === prefix)
    if (command === "par") {
      try {
        const user = await Tags.create({
          name: message.author.username,
          messages_count: 0,
          rank: 0
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
    } else if (command === "wima") {
      message.channel.send(message.author.avatarURL);
    } else if (command === "timereset") {
      const reset = await Tags.update(
        { time_rank: 0 },
        { where: { name: message.author.username } }
      );
      if (reset > 0) {
        message.channel.send("Your time-rank has been reset!");
      }
    } else if (command === "reset") {
      const reset = await Tags.update(
        { rank: 0 },
        { where: { name: message.author.username } }
      );

      if (reset > 0) {
        message.channel.send("Your text-rank has been reset!");
      }
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
        .addField("!wima", "It shows your profile image")

      return message.channel.send(embed);
    }else if (command === "github") {
      let embed = new Discord.RichEmbed()
        .setTitle("GitHub")
        .setColor("#aa1e32")
        .setURL("https://github.com/Ladvace/DiscordBot")
        .setThumbnail("https://i.imgur.com/1MrC4yt.png", "")
        .setDescription("This is my repository!")
      

      return message.channel.send(embed);
    }
});

client.on("guildMemberAdd", async member => {
  const channel = member.guild.channels.find(ch => ch.name === "general");
  const user = await Tags.findOne({
    where: { name: message.author.username }
  });

  if (!channel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipate to the leaderboard using the command !par`
  );
});

client.login(process.env.TOKEN);
