/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const timeoutRegex = /--timeout\s+(\S+)/gi;
  const optionRegex = /--option\s+(\S+)/gi;

  const questionRegex = /--question\s*(.*?)\s+--/;

  const userId = message.author.id;

  // client.config.reactionCount[userId] = {};

  const input = message.content;

  if (!input.match(optionRegex) || !input.match(questionRegex))
    return message.channel.send("Command not Valid");

  const optionValues = input
    .match(optionRegex)
    ?.map((x) => x.replace(/\s\s+/g, " ").split(" ")[1]);

  const question = input.match(questionRegex)[1];

  const timeOut =
    input.match(timeoutRegex) &&
    input.match(timeoutRegex)[0].replace(/\s\s+/g, " ").split(" ")[1];

  if (optionValues.length < 2 || !question)
    return message.channel.send(
      "You need to provide at least two options and a question in order to male a poll!"
    );

  if (optionValues.length >= 10)
    return message.channel.send("You can enter a maximum of 10 option.");

  const emoji = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
  ];

  const date = Date.now();

  const hoursToMinutes =
    60 * (timeOut && typeof Number(timeOut) === "number" ? timeOut : 60);

  const hoursToMilliseconds = 60 * hoursToMinutes * 1000;

  const datePlusHour =
    timeOut && typeof Number(timeOut) === "number"
      ? date + hoursToMilliseconds
      : date + 3600000;

  if (optionValues.length === 0 || !question)
    return message.channel.send("Command not valid!");

  const index = optionValues.indexOf("--question");
  if (index > -1) {
    optionValues.splice(index, 1);
  }

  if (optionValues.length >= 10) return;

  const embed = new Discord.MessageEmbed()
    .setColor("#8966FF")
    .setDescription(
      `***${question}***\nReact to this message with the corresponding emoji to vote for that option.
      \nHosted by: ${message.author}

      `
    )
    .addFields(
      ...optionValues
        .map((x, i) => {
          if (x !== "--option" && x !== "--question") {
            return {
              name: `${emoji[i]} :  ${x}`,
              value: "\u200B",
              inline: false,
            };
          }
        })
        .filter((x) => x)
    )
    .setTimestamp(datePlusHour)
    .setFooter("Ends", null);

  const embedMessage = await message.channel.send(
    ":bar_chart: **POLL** :bar_chart:",
    embed
  );

  const embedId = embedMessage.id;

  await Promise.all(
    optionValues.map(async (x, i) => {
      client.config.pollAnswers[embedId] = {
        ...client.config.pollAnswers[embedId],
        [emoji[i]]: 0,
      };

      if (x !== "--option" && x !== "--question")
        await embedMessage.react(emoji[i]);
    })
  );

  const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  const scoreTest = (answer, questions) => {
    let score = (answer / questions) * 100;
    return score;
  };

  setTimeout(() => {
    Object.entries(client.config.pollAnswers[embedId]).map((x) => {
      const sum = Object.values(client.config.pollAnswers[embedId]).reduce(
        sumReducer
      );

      client.config.poolSolution[x[0]] =
        sum > 0 ? Math.floor(scoreTest(x[1], sum)) : 0;
    });

    const totalVotes = Object.values(client.config.pollAnswers[embedId]).filter(
      (vote) => vote !== 0
    ).length;

    console.log("AAA", client.config.poolSolution);
    const newEmbed = new Discord.MessageEmbed()
      .setColor("#8966FF")
      .setDescription(
        `***${question}***\n
          Total votes: ${totalVotes}\n
          Hosted by: ${message.author}

          `
      )
      .addFields(
        ...Object.entries(client.config.pollAnswers[embedId]).map((x, i) => {
          return {
            name: `${optionValues[i]} : ${
              client.config.poolSolution[x[0]] || 0
            }%`,
            value: "\u200B",
            inline: false,
          };
        })
      )
      .setTimestamp(+new Date())
      .setFooter("Ended", null);
    embedMessage.edit(":bar_chart: **POLL ENDED** :bar_chart:", newEmbed);

    Object.keys(client.config.pollAnswers[embedId]).map((emoji) => {
      embedMessage.reactions.cache.get(emoji)?.users.cache.map((userId) => {
        embedMessage.reactions.cache.get(emoji).users.remove(userId);
      });
    });
  }, hoursToMilliseconds);
  // };
};
