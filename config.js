const { Intents } = require("discord.js");

module.exports = {
  prefix: "!",
  minutes: 1,
  welcomeMessage:
    "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D",
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  // Partials your bot may need should go here, CHANNEL is required for DM's
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
};
