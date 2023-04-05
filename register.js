const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
const { commands } = require("./src/handlers/commandHandler");

dotenv.config();
const discord_bot_key = process.env.DISCORD_BOT_KEY;
const discord_bot_client_id = process.env.DISCORD_BOT_CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(discord_bot_key);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(discord_bot_client_id), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
