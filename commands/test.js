const { config } = require("../mongodb");
const Discord = require("discord.js");
const Canvas = require("canvas");
const path = require("path");
const fontPath = path.join(__dirname, "..", "assets", "Inter-Bold.ttf");

Canvas.registerFont(fontPath, { family: "Inter" });

const applyText = (canvas, text) => {
  const ctx = canvas.getContext("2d");

  // Declare a base size of the font
  let fontSize = 70;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `${(fontSize -= 10)}px Inter`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > canvas.width - 300);

  // Return the result to use in the actual canvas
  return ctx.font;
};

exports.run = async (client, message) => {
  if (message.author.id !== "163300027618295808") return;

  const server = await config.findOne({
    id: message.guild.id,
  });

  if (!server) return;

  const image = path.join(__dirname, "..", "assets", "wallpaper.png");

  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(image);

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = applyText(
    canvas,
    server.welcomeMessage.replace(/\[user]/g, message.author.username)
  );

  ctx.fillStyle = "#FFFF";
  ctx.fillText(
    server.welcomeMessage.replace(/\[user]/g, message.author.username),
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

  const attachment = new Discord.MessageAttachment(canvas.toBuffer());

  message.channel.send({
    content: `Welcome to the server, ${message.author.username}!`,
    files: [attachment],
  });
};
