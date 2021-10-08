const Discord = require("discord.js");
const firebase = require("firebase");

module.exports.run = async (client, message) => {
  const welcomeMessage = message.content.split(" ").slice(1).join(" ");

  config.findOne(
    {
      id: message.guild.id,
    },
    (err, server) => {
      if (err) console.log(err);

      if (server) {
        if (welcomeMessage === "null") {
          server.welcomeMessage = null;

  if (!server.exists) {
    serverRef.set(configSettings);
  }

          return message.channel.send({ embeds: [embed] });
        }
        server.welcomeMessage = welcomeMessage;
        server.save();

    const embed = new Discord.MessageEmbed()
      .setTitle("Prefix")
      .setColor("#8966ff")
      .setDescription(`welcome message resetted!`);

        return message.channel.send({ embeds: [embed] });
      }
    }
  );
};
