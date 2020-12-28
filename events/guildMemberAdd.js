const { config } = require("../mongodb");

module.exports = async (client, member) => {
  const server = await config.findOne(
    {
      id: member.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);
      if (!server) {
        const newServer = new config({
          id: member.guild.id,
          guildPrefix: "!",
          guildNotificationChannelID: null,
          welcomeChannel: null,
          customRanks: {},
          rankTime: null,
        });

        return newServer.save();
      }
    }
  );

  if (!server.welcomeChannel) return;

  channel.send(
    `Welcome to the server, ${member}, you can partecipatetecipate to the leaderboard using the command !participate`
  );
};
