"use strict";
// eslint-disable-next-line no-unused-vars
const env = require("dotenv").config();
const { Client, Collection } = require("discord.js");
const logger = require("./modules/logger.js");
const localConfig = require("./config.json");
const { intents, partials, permLevels } = require("./config.js");

const client = new Client({ intents, partials });

const mongoose = require("mongoose");
const fs = require("fs");
// const Enmap = require("enmap");

const commands = new Collection();
const aliases = new Collection();
const slashcmds = new Collection();

const levelCache = {};
for (let i = 0; i < permLevels.length; i++) {
  const thisLevel = permLevels[i];
  levelCache[thisLevel.name] = thisLevel.level;
}

client.container = {
  commands,
  aliases,
  slashcmds,
  levelCache,
  users: {},
};

client.config = localConfig;

mongoose.connect(
  "mongodb://localhost:27017/wiseManBot",
  // { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) {
      logger.error(err);
      return process.exit(22);
    }
    logger.log("Connected to the db");
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

// client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    // Load the command file itself
    let props = require(`./commands/${file}`);
    // Get just the command name from the file name
    let commandName = file.split(".")[0];
    logger.log(`Attempting to load command ${commandName}`);
    // Here we simply store the whole thing in the command Enmap. We're not running it right now.
    client.container.commands.set(commandName, props);
  });
});

client.login(process.env.TOKEN);
