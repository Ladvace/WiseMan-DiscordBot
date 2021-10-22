const { config, userSchema } = require("../mongodb");
const localConfig = require("../config.json");
const logger = require("../modules/logger");
const {
  incrementRank,
  incrementMessages,
  incrementExp,
} = require("../utility");

module.exports = async (client, message) => {
  const userSchemaConfig = {
    id: `${message.author.id}#${message.guild.id}`,
    guildId: message.guild.id,
    userId: message.author.id,
    name: message.author.username,
    discordName: `${message.author.username}#${message.author.discriminator}`,
  };

  const configSettings = {
    id: message.guild.id,
  };

  const server = await config.findOne({
    id: message.guild.id,
  });

  if (!server) {
    const newServer = new config(configSettings);
    await newServer.save();
  }

  const user = await userSchema.findOne({
    id: `${message.author.id}#${message.guild.id}`,
  });

  if (!user) {
    const newUser = new userSchema(userSchemaConfig);
    await newUser.save();
  }

  client.config.prefix =
    server?.guildPrefix !== localConfig.prefix
      ? server?.guildPrefix
      : localConfig.prefix;

  // Ignore all bots
  if (message.author.bot) return;

  if (user) {
    const channel = message.guild.channels.cache.get(
      server.notificationChannel
    );
    await incrementMessages(user);
    const newExp = await incrementExp(user);
    await incrementRank(user, newExp, client, channel, message.member);
  }

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
  if (message.content.match(prefixMention)) {
    return message.reply(
      `My prefix on this guild is \`${client.config.prefix}\``
    );
  }

  // Our standard argument/command name definition.
  const args = message.content
    .slice(client.config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.container.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  try {
    cmd.run(client, message, args);
  } catch (e) {
    logger.error(e);
  }
};
