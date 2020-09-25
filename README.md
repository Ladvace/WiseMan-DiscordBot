<p align="center">
    <img width="300" height="auto" src="https://i.imgur.com/WpPGFXt.png" alt="WiseMan" />
</p>

## WiseMan - Discord Bot 🤖

[![forthebadge](https://forthebadge.com/images/badges/gluten-free.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/made-with-crayons.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)

This bot allows you to level up based on the time you spend in a vocal channel and how much you write in a text channel

## Commands 🎨

You need to add the prefix `!` before the command e.g: `!rank`.

- **rank** - It shows you your rank.
- **wima** - It shows you your profile image.
- **reset** - It reset the text-based score.
- **github** - It shows you the github repo link.
- **help** - It shows you all the commands.

## Steps ▶️

Install the dependencies

```
$ npm i
```

Create an `.ENV` file and replace `*TOKEN*` with the token.
You can take the token from [discord developers page](https://discordapp.com/developers/applications/) > Bot

```
$ TOKEN="*TOKEN*"
```

Start the bot

```
$ npm start
```

## Configuration ⚙️

- The only configurations are the prefix and the minutes in the `config.json`.

  The `minutes` are the minutes for wich every time the bot level up you (i.g: by default the bot update your rank every hour for the time-based system).

```
{
   "prefix": "!",
   "minutes": 60
}
```

## Authors ❤️

- **Gianmarco Cavallo** (ladvace) - [Github Profile](https://github.com/Ladvace)

### If you have any problems or question feel free to contact me! 🔧😃
