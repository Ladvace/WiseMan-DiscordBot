exports.run = (client, message) => {
  message.channel.send("pong!").catch(console.error);
};
