const firebase = require("firebase");
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

  const configSettings = {
    id: message.guild.id,
    guildPrefix: "!",
    guildNotificationChannelID: null,
    welcomeChannel: null,
    customRanks: {},
    rankTime: null,
    defaultRole: null,
  };

  const serverRef = firebase
    .firestore()
    .collection("servers")
    .doc(message.guild.id);

  const server = await serverRef.get();

  const serverData = server.data();

  if (!server.exists) {
    serverRef.set(configSettings);
  }

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(message.guild.id);

  const user = await userRef.get();

  const userData = user.data();

  if (!user.exists) {
    userRef.set(userSchemaConfig);
  }

  client.config.prefix =
    serverData?.guildPrefix !== localConfig.prefix
      ? serverData?.guildPrefix
      : localConfig.prefix;

  // Ignore all bots
  if (message.author.bot) return;

  await incrementMessages(
    `${message.author.id}#${message.guild.id}`,
    message.author.username
  );
  if (userData.messages_count % 25 === 0) {
    await incrementRank(
      `${message.author.id}#${message.guild.id}`,
      message.author.username,
      message.author.discriminator
    );

    await levelUp(message.member, message.guild.id, userData.rank, client);
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
