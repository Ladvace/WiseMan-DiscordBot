const firebase = require("firebase");
const localConfig = require("../config.json");
const { incrementRank, levelUp, incrementMessages } = require("../utility");

module.exports = async (client, message) => {
  const userSchemaConfig = {
    serverName: message.guild.name,
    id: `${message.author.id}#${message.guild.id}`,
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

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(`${message.author.id}#${message.guild.id}`);

  const user = await userRef.get();

  const userData = user.data();

  if (!user.exists) {
    userRef.set(userSchemaConfig);
  }

  client.config.prefix =
    server?.guildPrefix !== localConfig.prefix
      ? server?.guildPrefix
      : localConfig.prefix;

  // Ignore all bots
  if (message.author.bot) return;

  if (user) {
    await incrementMessages(user);
    if (user.messages_count % 25 === 0) {
      await incrementRank(user);

      // await levelUp(message.member, message.guild.id, user.rank, client);
    }
  }

  // // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
  if (message.content.match(prefixMention)) {
    return message.reply(
      `My prefix on this guild is \`${client.config.prefix}\``
    );
  }

  // // Our standard argument/command name definition.
  const args = message.content
    .slice(serverData?.guildPrefix.length || client.config.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  // console.log("command", client.config.prefix, command, args);

  // Grab the command data from the client.commands Enmap
  const cmd = client.container.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(client, message, args);
};
