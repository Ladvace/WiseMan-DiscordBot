const Discord = require("discord.js");
const { prefix, token, quotes_api } = require("./config.json");
const client = new Discord.Client();
const Sequelize = require("sequelize");
const axios = require("axios");

let millisPerHour = 5 * 1000; //1hour
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
  },
  time_rank: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

let timer = 0;
let interval = 0;

client.once("ready", async () => {
  console.log("Ready!");
  Tags.sync();

  // client.channels.map(x =>  x.members == null ? console.log("peppe") : console.log("gino"));

  // client.channels.map(x => console.log(x));
  // client.channels.find(channel => channel.name === "General").members.map(x => console.log("ooOo", x.user));

  client.channels.map(x => {
    if (x.type === "voice") {
      x.members.map(async y => {
        

        const user = await Tags.findOne({
          where: { name: y.user.username }
        });
        timer = setTimeout(function() {
          console.log("inizio");
          interval = setInterval(function() {
            user.increment("time_rank");
          }, millisPerHour);
        }, millisToTheHour);
      });
    }
  });

  // client.channels.map(x => {
  //   if (x.type === "voice") {
  //     client.channels
  //       .find(channel => channel.name === x.name)
  //       .members.map(async y => {
  //         if (y.user) {
  //           const user = await Tags.findOne({
  //             where: { name: y.user.username }
  //           });
  //           setTimeout(function() {
  //             console.log("inizio");
  //             setInterval(function() {
  //               user.increment("time_rank");
  //               setTimeout(() => console.log(user.get("time_rank")), 1000);
  //             }, millisPerHour);
  //           }, millisToTheHour);
  //         }
  //       });
  //   }
  // });

  // client.channels.find(channel => channel.name === "General").members.map(x => console.log("ooOo", x.user)) //finally
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
    // console.log(newUserChannel)
    const user = await Tags.findOne({
      where: { name: newMember.user.username }
    });

      if (newUserChannel.type === "voice") {
        // x.members.map(async y => {
          const user = await Tags.findOne({
            where: { name: newMember.user.username }
          });
          timer = setTimeout(function() {
            console.log("inizio");
            interval = setInterval(function() {
              user.increment("time_rank");
            }, millisPerHour);
          }, millisToTheHour);
        // });
      }

  } else if (newUserChannel === undefined) {
    // console.log(oldUserChannel);
    // User leaves a voice channel
    if (timer && interval) {
      clearTimeout(timer);
      clearInterval(interval);
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
          .setColor("#aa1e32")
          .addField("Rank", user.get("time_rank"));
        return message.channel.send(embed);
        // return message.channel.send(`your rank is ${user.get("rank")}`);
      }
      return message.reply(`Could not find your rank`);
    } else if (command === "wima") {
      message.channel.send(message.author.avatarURL);
    } else if (command === "reset") {
      const reset = await Tags.update(
        { time_rank: 0 },
        { where: { name: message.author.username } }
      );
      if (reset > 0) {
        message.channel.send("Your rank has been reset!");
      }
    } else if (command === "trank") {
      if (user) {
        return message.channel.send(
          `${user.get("name")} your time-rank is ${user.get("time_rank")}`
        );
      }
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

client.login(token);
