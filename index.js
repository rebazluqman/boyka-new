/**
 * Module Imports
 */

const http = require("http");
const express = require("express");
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`https://sturdy-pretty-rib.glitch.me`);
}, 280000);

const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./config.json");

const client = new Client({ disableMentions: "everyone" });

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`${PREFIX}help | Music bot high quality`);
});
client.on("warn", info => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content
    .slice(matchedPrefix.length)
    .trim()
    .split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.").catch(console.error);
  }
});

const { MessageEmbed } = require("discord.js");

client.on("message", m => {
  if (m.content === PREFIX + "help") {
    var addserver =
      "https://discord.com/api/oauth2/authorize?client_id=762156775716945983&permissions=1878523713&scope=bot";
    var SUPPORT = "https://monty-music.glitch.me/";
    let embed = new MessageEmbed()
      .setAuthor("Help Menu", client.user.displayAvatarURL())
      .setFooter(m.author.tag, m.author.avatarURL())
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("#FF0074")
      .setImage("https://cdn.discordapp.com/attachments/762157496009490442/762660365971619850/image0.gif")
      .setDescription(`                                                                                                               
** | [Add To Your Server](${addserver})**    

** | [Dshboerd](${SUPPORT})**`);
    m.react(":746270103498391562:");
    m.author.send(embed);
  }
});
 
