const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const config = new Schema({
  id: { type: String, required: true, unique: true },
  guildPrefix: String,
  guildNotificationChannelID: String,
  welcomeChannel: String,
  customRanks: { type: Object, default: {} },
  rankTime: Number,
});

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  messages_count: Number,
  rank: Number,
});

module.exports = {
  config: mongoose.model("servers", config),
  userSchema: mongoose.model("users", userSchema),
};
