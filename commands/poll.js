/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  // const timeoutRegex = /--timeout\s+(\S+)/gi;
  // const optionRegex = /--option\s+(\S+)/gi;
  // // const questionRegex = /--question\s+(\S+)/gi;
  // // const questionRegex = /(?<=--question).+/gi;
  // // const questionRegex = /(--question).+(\s--)/gi;
  // // const questionRegex = /(?<=--question).+(\s--)/gi;
  // // (?<=--question).+(\s+(--))
  // const questionRegex = /(?<=--question).+(\s--)/gi;
  // let polls = {};
  // let poolSolution = {};
  // client.config.pollAnswers = {};
  // const input = message.content;
  // console.log("AAA", !input.match(questionRegex));
  // if (!input.match(optionRegex) || !input.match(questionRegex))
  //   return message.channel.send("Command not Valid");
  // const optionValues = input
  //   .match(optionRegex)
  //   ?.map((x) => x.replace(/\s\s+/g, " ").split(" ")[1]);
  // const question = input
  //   .match(questionRegex)[0]
  //   .replace(/\s\s+/g, " ")
  //   .split(" ")[1];
  // console.log("question", input.match(questionRegex)[0]);
  // const timeOut =
  //   input.match(timeoutRegex) &&
  //   input.match(timeoutRegex)[0].replace(/\s\s+/g, " ").split(" ")[1];
  // if (optionValues.length < 2 || !question)
  //   return message.channel.send(
  //     "You need to provide at least two options and a question in order to male a poll!"
  //   );
  // if (optionValues.length >= 10)
  //   return message.channel.send("You can enter a maximum of 10 option.");
  // const emoji = [
  //   "0️⃣",
  //   "1️⃣",
  //   "2️⃣",
  //   "3️⃣",
  //   "4️⃣",
  //   "5️⃣",
  //   "6️⃣",
  //   "7️⃣",
  //   "8️⃣",
  //   "9️⃣",
  //   "🔟",
  // ];
  // const date = Date.now();
  // const hoursToMinutes =
  //   60 * (timeOut && typeof Number(timeOut) === "number" ? timeOut : 60);
  // const hoursToMilliseconds = 60 * hoursToMinutes * 1000;
  // const datePlusHour =
  //   timeOut && typeof Number(timeOut) === "number"
  //     ? date + hoursToMilliseconds
  //     : date + 3600000;
  // if (optionValues.length === 0 || !question)
  //   return message.channel.send("Command not valid!");
  // if (optionValues.length >= 10) return;
  // const embed = new Discord.MessageEmbed()
  //   .setTitle("Poll")
  //   .addField(question, "\u200B")
  //   .setColor("#8966FF")
  //   .setDescription(
  //     "React to this message with the corresponding emoji to vote for that option."
  //   )
  //   .addFields(
  //     ...optionValues
  //       .map((x, i) => {
  //         if (x !== "--option" && x !== "--question") {
  //           return {
  //             name: `${emoji[i]} :  ${x}`,
  //             value: "\u200B",
  //             inline: false,
  //           };
  //         }
  //       })
  //       .filter((x) => x)
  //   )
  //   // .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
  //   .setTimestamp(datePlusHour)
  //   .setFooter("Ends", null);
  // const reactionCollection = message.reactions;
  // console.log("reactionCollection", reactionCollection);
  // const embedMessage = await message.channel.send(embed);
  // const Filter = (reaction, user) => user.id !== message.author.id;
  // embedMessage.awaitReactions(Filter).then((collected) => {
  //   // Getting the first reaction in the collection.
  //   const reaction = collected.first();
  //   console.log(
  //     "ADADD",
  //     reaction._emoji.name,
  //     reaction.message.reactions.cache
  //   );
  //   reaction.message.reactions.cache.map((emoji) =>
  //     console.log("pippo", emoji.count)
  //   );
  //   // Creating a switch statement for reaction.emoji.name.
  //   // switch (reaction.emoji.name) {
  //   //     case "😎":
  //   //         // Checking if the member already has the role.
  //   //         if (message.member.roles.cache.has(Role1.id)) {return message.channel.send("You already have the role.")};
  //   //         // Adding the role.
  //   //         message.member.roles.add(Role1).then(message.channel.send("Role added!"));
  //   //         // Breaking the switch statement to make sure no other cases are executed.
  //   //         break
  //   // }
  // });
  // await Promise.all(
  //   optionValues.map(async (x, i) => {
  //     if (x !== "--option" && x !== "--question")
  //       await embedMessage.react(emoji[i]);
  //   })
  // );
  // const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  // const scoreTest = (answer, questions) => {
  //   let score = (answer / questions) * 100;
  //   return score;
  // };
  // polls[message.guild.id] = {};
  // const dateTimeStamp = +new Date();
  // polls[message.guild.id][dateTimeStamp] = {
  //   ended: false,
  //   timer: setTimeout(() => {
  //     Object.entries(client.config.pollAnswers).map((x) => {
  //       const sum = Object.values(client.config.pollAnswers).reduce(sumReducer);
  //       poolSolution[x[0]] = sum > 0 ? Math.floor(scoreTest(x[1], sum)) : 0;
  //     });
  //     polls[message.guild.id][dateTimeStamp].ended = true;
  //     clearTimeout(polls[message.guild.id][dateTimeStamp].timer);
  //     let newEmbed = new Discord.MessageEmbed()
  //       .setTitle("Poll Ended")
  //       .addField(question, "\u200B")
  //       .setColor("#8966FF")
  //       .addField(
  //         "React to this message with the corresponding emoji to vote for that option.",
  //         "\u200B"
  //       )
  //       .addFields(
  //         ...Object.entries(client.config.pollAnswers).map((x) => {
  //           return {
  //             name: `${x[0]} :  ${poolSolution[x[0]] || 0}%`,
  //             value: "\u200B",
  //             inline: false,
  //           };
  //         })
  //       )
  //       .setThumbnail("https://i.imgur.com/AtmK18i.png", "")
  //       .setTimestamp(+new Date())
  //       .setFooter("Ended", null);
  //     embedMessage.edit(newEmbed);
  //   }, hoursToMilliseconds),
  // };
};
