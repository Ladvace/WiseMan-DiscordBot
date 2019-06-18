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
  const tag = await Tags.findOne({
    where: { name: message.author.username }
  });
  if (tag) {
    console.log(tag.get("messages_count"));
    tag.increment("messages_count");
    if (tag.get("messages_count") == 50) {
      message.channel.send(
        `${message.author.username} reached lv ${tag.get("rank")}`
      );
    }
    return;
  } else {
    const tag = await Tags.create({
      name: message.author.username,
      messages_count: 0,
      rank: 0
    });
  }
});

client.on("message", async message => {
  const input = message.content;
  const command = input.charAt(0) === prefix ? input.substr(1) : input;
  // const command = input.shift();

  console.log("ok");

  if (message.content.charAt(0) === prefix)
    if (command === "par") {
      console.log("aiutaciTU");
      try {
        const tag = await Tags.create({
          name: message.author.username,
          messages_count: 0,
          rank: 0
        });

        return message.reply(`${tag.name} added to the leaderboard.`);
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
      console.log("cippa");

      const tag = await Tags.findOne({
        where: { name: message.author.username }
      });
      if (tag) {
        return message.channel.send(tag.get("rank"));
      }
      return message.reply(`Could not find tag: ${message.author.username}`);
    }
});

client.on("guildMemberAdd", member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === "member-log");
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(
    `Welcome to the server, ${member}, you can partecipate to the leaderboard using the command !par`
  );
});

client.on("guildUpdate", member => {
  // Send the message to a designated channel on a server:
  console.log("ciooo");
  const channel = member.guild.channels.find(ch => ch.name === "general");
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`${member} have changed his name to ${member.oldGuild}`);
});

client.login(token);
