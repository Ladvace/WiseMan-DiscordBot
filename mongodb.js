const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const config = new Schema({
  id: { type: String, required: true, unique: true },
  guildPrefix: String,
  guildNotificationChannelID: String,
});

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  messages_count: Number,
  rank: Number,
});

module.exports = {
  config: mongoose.model("servers", config),
  userSchema: mongoose.model("users", userSchema),
};
