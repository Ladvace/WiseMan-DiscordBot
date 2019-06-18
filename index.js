const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();
const Sequelize = require("sequelize");
// const db = require("quick.db");

let millisPerHour = 30 * 1000;
let millisPastTheHour = Date.now() % millisPerHour;
let millisToTheHour = millisPerHour - millisPastTheHour;

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  operatorsAliases: false,
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
  }
});

client.once("ready", () => {
  console.log("Ready!");
  Tags.sync();
});

client.on("message", async message => {
  const user = await Tags.findOne({
    where: { name: message.author.username }
  });
  if (user) {
    console.log("messCount", user.get("messages_count"));
    user.increment("messages_count");
    if (user.get("messages_count") == 25) {
      user.increment("rank");
      console.log(user.get("rank"));
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
      console.log(user.get("messages_count"));
      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 150) {
      user.increment("rank");
      console.log(user.get("messages_count"));
      message.channel.send(
        `${message.author.username} reached lv ${user.get("rank")}`
      );
    } else if (user.get("messages_count") == 200) {
      user.increment("rank");
      console.log(user.get("messages_count"));

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

client.on("message", async message => {
  const input = message.content;
  const command = input.charAt(0) === prefix ? input.substr(1) : input;
  const user = await Tags.findOne({
    where: { name: message.author.username }
  });

  console.log("ok");

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
        console.log(e);
        return message.reply(
          "Something went wrong with adding you to the leaderboard."
        );
      }
    } else if (command === "showrank") {
      if (user) {
        return message.channel.send(`your rank is ${user.get("rank")}`);
      }
      return message.reply(`Could not find your rank`);
    } else if (command === "wima") {
      message.channel.send(message.author.avatarURL);
    } else if (command === "reset") {
      const reset = await Tags.update(
        { rank: 0 },
        { where: { name: message.author.username } }
      );
      if (reset > 0) {
        message.channel.send("Your rank has been reset!");
      }
    }
});

client.on("guildMemberAdd", member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === "general");
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(
    `Welcome to the server, ${member}, you can partecipate to the leaderboard using the command !par`
  );
});

client.login(token);
