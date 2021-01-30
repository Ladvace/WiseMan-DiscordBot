"use strict";
const Discord = require("discord.js");
const localConfig = require("./config.json");
// eslint-disable-next-line no-unused-vars
const env = require("dotenv").config();
const client = new Discord.Client();

const { Player } = require("discord-player");

client.player = new Player(client);

const firebase = require("firebase");
const mongoose = require("mongoose");
const fs = require("fs");
// const tmi = require("tmi.js");
const Enmap = require("enmap");

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

client.config = localConfig;

client.player.on("trackStart", (message, track) => {
  message.channel.send({
    embed: {
      color: "#8966FF",
      author: { name: track.title },

      fields: [
        { name: "Channel", value: track.author, inline: true },
        {
          name: "Requested by",
          value: track.requestedBy.username,
          inline: true,
        },
        {
          name: "From playlist",
          value: track.fromPlaylist ? "Yes" : "No",
          inline: true,
        },

        { name: "Views", value: track.views, inline: true },
        { name: "Duration", value: track.duration, inline: true },
      ],
      thumbnail: { url: track.thumbnail },
      timestamp: new Date(),
    },
  });
});

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

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    // Get just the event name from the file name
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    // without going into too many details, this means each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc etc.
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    // Load the command file itself
    let props = require(`./commands/${file}`);
    // Get just the command name from the file name
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    // Here we simply store the whole thing in the command Enmap. We're not running it right now.
    client.commands.set(commandName, props);
  });
});

client.login(process.env.TOKEN);
