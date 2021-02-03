const Discord = require("discord.js");
const Canvas = require("canvas");
const path = require("path");
// const { config } = require("../mongodb");
const font = path.join(__dirname, "..", "assets", "Inter-Bold.ttf");

Canvas.registerFont(font, { family: "Inter V", weight: "Bold" });

const applyText = (canvas, text) => {
  const ctx = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 70;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${(fontSize -= 10)}px Inter V`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > canvas.width - 300);

  // Return the result to use in the actual canvas
  return ctx.font;
};

exports.run = async (client, message) => {
  // const { welcomeMessage } = await config.findOne(
  //   {
  //     id: message.guild.id,
  //   },
  //   (err, server) => {
  //     if (err) console.log(err);
  //     if (!server) {
  //       const newServer = new config(configSettings);

  //       return newServer.save();
  //     }
  //   }
  // );

  const defaultMessage = `Welcome ${message.author.username}!`;

  const image = path.join(__dirname, "..", "assets", "wallpaper.png");

  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(image);

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = applyText(
    canvas,
    welcomeMessage.replace(/\[user]/g, message.author.username) ||
      defaultMessage
  );

  ctx.fillStyle = "#FFFF";
  ctx.fillText(
    welcomeMessage.replace(/\[user]/g, message.author.username) ||
      defaultMessage,
    canvas.width / 2.5,
    canvas.height / 1.8
  );

  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(
    message.author.displayAvatarURL({ format: "png" })
  );
  ctx.drawImage(avatar, 25, 25, 200, 200);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "welcome-image.png"
  );

  message.channel.send(
    `Welcome to the server, ${message.author.username}!`,
    attachment
  );
};
