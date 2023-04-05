const fs = require("fs");
const dotenv = require("dotenv");
const { Client, GatewayIntentBits } = require("discord.js");
const handleInteraction = require("./handlers/interactionHandler");

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.on("ready", () => {
  console.log(`${client.user.tag} Connected to Discord!`);
});

client.on("interactionCreate", async (interaction) => {
  handleInteraction(interaction);
});

client.login(process.env.DISCORD_BOT_KEY);
