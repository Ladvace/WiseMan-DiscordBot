exports.run = async (client, message) => {
  if (!message.member.voice.channel)
    return message.channel.send(`:x:  - You're not in a voice channel !`);

  if (
    message.guild.me.voice.channel &&
    message.member.voice.channel.id !== message.guild.me.voice.channel.id
  )
    return message.channel.send(
      `:x:  - You are not in the same voice channel !`
    );

  if (!client.player.getQueue(message))
    return message.channel.send(`:x:  - No music currently playing !`);

  client.player.setRepeatMode(message, false);
  client.player.stop(message);

  message.channel.send(
    `:white_check_mark:  - Music **stopped** into this server !`
  );
};
