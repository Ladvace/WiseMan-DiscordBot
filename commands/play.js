exports.run = async (client, message, args) => {
  if (!message.member.voice.channel)
    return message.channel.send(`:x: - You're not in a voice channel !`);

  if (
    message.guild.me.voice.channel &&
    message.member.voice.channel.id !== message.guild.me.voice.channel.id
  )
    return message.channel.send(
      `:x: - You are not in the same voice channel !`
    );

  if (!args[0])
    return message.channel.send(`:x: - Please indicate the title of a song !`);

  client.player.play(message, args.join(" "), { firstResult: true });
};
