const Discord = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { toProperCase } = require("../utility");

exports.run = (client, message, args, level) => {
  // Grab the container from the client to reduce line length.
  const { container } = client;
  // If no specific command is called, show all filtered commands.
  if (!args[0]) {
    // Load guild settings (for prefixes and eventually per-guild tweaks)
    // const settings = message.settings;

    // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
    // const myCommands = message.guild
    //   ? container.commands.filter(
    //       (cmd) => container.levelCache[cmd.conf.permLevel] <= level
    //     )
    //   : container.commands.filter(
    //       (cmd) =>
    //         container.levelCache[cmd.conf.permLevel] <= level &&
    //         cmd.conf.guildOnly !== true
    //     );

    // Then we will filter the myCommands collection again to get the enabled commands.
    // const enabledCommands = myCommands.filter((cmd) => cmd.conf.enabled);
    const enabledCommands = container.commands.filter(
      (cmd) => cmd.conf.enabled
    );

    // Here we have to get the command names only, and we use that array to get the longest name.
    const commandNames = [...enabledCommands.keys()];

    // This make the help commands "aligned" in the output.
    const longest = commandNames.reduce(
      (long, str) => Math.max(long, str.length),
      0
    );

    let currentCategory = "";
    let output = `= Command List =\n[Use ${client.config.prefix}help <commandname> for details]\n`;
    const sorted = enabledCommands.sort((p, c) =>
      p.help.category > c.help.category
        ? 1
        : p.help.name > c.help.name && p.help.category === c.help.category
        ? 1
        : -1
    );
    // const embed = new Discord.MessageEmbed()
    //   .setTitle("Command List")
    //   .setDescription(
    //     `[Use ${client.config.prefix}help <commandname> for details]`
    //   )
    //   .setColor("#8966ff");

    sorted.forEach((c) => {
      const cat = toProperCase(c.help.category);
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${client.config.prefix}${c.help.name}${" ".repeat(
        longest - c.help.name.length
      )} :: ${c.help.description}\n`;
    });

    message.channel.send({ content: codeBlock("asciidoc", output) });
  } else {
    // Show individual command's help.
    let command = args[0];
    console.log(
      "COM",
      args,
      container.commands.has(command),
      container.commands.has(container.aliases.get(command))
    );
    if (
      container.commands.has(command) ||
      container.commands.has(container.aliases.get(command))
    ) {
      command =
        container.commands.get(command) ??
        container.commands.get(container.aliases.get(command));

      const embed = new Discord.MessageEmbed()
        .setTitle(command.help.name)
        .setDescription(command.help.description)
        .setColor("#8966ff")
        // .setThumbnail(state.member.user.avatarURL({ format: "png" }))
        .addField("Usage", `\`\`\`${command.help.usage}\`\`\``);

      message.channel.send({
        embeds: [embed],
      });
    } else
      return message.channel.send({
        content: "No command with that name, or alias exists.",
      });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["h"],
  permLevel: "User",
};

exports.help = {
  name: "help",
  category: "System",
  description: "Displays all the available commands.",
  usage: "help or help [command]",
};
