const { config, userSchema } = require("../mongodb");
const localConfig = require("../config.json");
const { incrementRank, levelUp, incrementMessages } = require("../utility");

module.exports = async (client, message) => {
  const userSchemaConfig = {
    id: `${message.author.id}#${message.guild.id}`,
    name: message.author.username,
    messages_count: 0,
    rank: 0,
    discordName: `${message.author.username}#${message.author.discriminator}`,
  };

  const RemotePrefix = await config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config(configSettings);

        return newServer.save();
      }
    }
  );

  const user = await userSchema.findOne(
    {
      id: `${message.author.id}#${message.guild.id}`,
    },
    (err, user) => {
      if (err) console.log(err);
      if (!user) {
        const newUser = new userSchema(userSchemaConfig);

        return newUser.save();
      }
    }
  );

  client.config.prefix =
    RemotePrefix?.guildPrefix !== localConfig.prefix
      ? RemotePrefix?.guildPrefix
      : localConfig.prefix;

  // Ignore all bots
  if (message.author.bot) return;

  if (user) {
    await incrementMessages(
      `${message.author.id}#${message.guild.id}`,
      message.author.username
    );
    if (user.messages_count % 25 === 0) {
      await incrementRank(
        `${message.author.id}#${message.guild.id}`,
        message.author.username,
        message.author.discriminator
      );

      await levelUp(message.member, message.guild.id, user.rank, client);
    }
  }

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Our standard argument/command name definition.
  const args = message.content
    .slice(client.config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log("command", client.config.prefix, command, args);

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(client, message, args);
};
