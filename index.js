const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();
const Sequelize = require("sequelize");
// const db = require("quick.db");

let millisPerHour = 60 * 60 * 1000;
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

const Tags = sequelize.define("tags", {
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  description: Sequelize.TEXT,
  username: Sequelize.STRING,
  usage_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

client.once("ready", () => {
  console.log("Ready!");

  Tags.sync();

  setTimeout(function() {
    console.log("inizio");

    setInterval(function() {
      console.log("ok");
    }, millisPerHour);
  }, millisToTheHour);
});

client.on("message", async message => {
  if (message.content.startsWith(prefix)) {
    const input = message.content.slice(prefix.length).split(" ");
    const command = input.shift();
    const commandArgs = input.join(" ");

    if (command === "addtag") {
      const splitArgs = commandArgs.split(" ");
      const tagName = splitArgs.shift();
      const tagDescription = splitArgs.join(" ");

      try {
        // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
        const tag = await Tags.create({
          name: tagName,
          description: tagDescription,
          username: message.author.username
        });
        return message.reply(`Tag ${tag.name} added.`);
      } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
          return message.reply("That tag already exists.");
        }
        return message.reply("Something went wrong with adding a tag.");
      }
    } else if (command === "tag") {
      const tagName = commandArgs;

      // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
      const tag = await Tags.findOne({ where: { name: tagName } });
      if (tag) {
        // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
        tag.increment("usage_count");
        return message.channel.send(tag.get("description"));
      }
      return message.reply(`Could not find tag: ${tagName}`);
    } else if (command === "edittag") {
      const splitArgs = commandArgs.split(" ");
      const tagName = splitArgs.shift();
      const tagDescription = splitArgs.join(" ");

      // equivalent to: UPDATE tags (descrption) values (?) WHERE name='?';
      const affectedRows = await Tags.update(
        { description: tagDescription },
        { where: { name: tagName } }
      );
      if (affectedRows > 0) {
        return message.reply(`Tag ${tagName} was edited.`);
      }
      return message.reply(`Could not find a tag with name ${tagName}.`);
    } else if (command === "taginfo") {
      const tagName = commandArgs;

      // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
      const tag = await Tags.findOne({ where: { name: tagName } });
      if (tag) {
        return message.channel.send(
          `${tagName} was created by ${tag.username} at ${
            tag.createdAt
          } and has been used ${tag.usage_count} times.`
        );
      }
      return message.reply(`Could not find tag: ${tagName}`);
    } else if (command === "showtags") {
      // equivalent to: SELECT name FROM tags;
      const tagList = await Tags.findAll({ attributes: ["name"] });
      const tagString = tagList.map(t => t.name).join(", ") || "No tags set.";
      return message.channel.send(`List of tags: ${tagString}`);
    } else if (command === "removetag") {
      const tagName = commandArgs;
      // equivalent to: DELETE from tags WHERE name = ?;
      const rowCount = await Tags.destroy({ where: { name: tagName } });
      if (!rowCount) return message.reply("That tag did not exist.");

      return message.reply("Tag deleted.");
    }
  }
});


client.on("guildMemberAdd", member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === "member-log");
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}`);
});

client.login(token);
