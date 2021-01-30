const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const config = new Schema({
  id: { type: String, required: true, unique: true },
  guildPrefix: String,
  guildNotificationChannelID: String,
  welcomeChannel: String,
  customRanks: { type: Object, default: {} },
  rankTime: Number,
  welcomeMessage: String,
  defaultRole: String,
});

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  messages_count: Number,
  rank: Number,
  discordName: String,
});

module.exports = {
  config: mongoose.model("servers", config),
  userSchema: mongoose.model("users", userSchema),
};
