const commandHandler = require("./commandHandler");

module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (commandHandler[command]) {
    try {
      await interaction.deferReply({
        content: "Processing command...",
        // ephemeral: true,
      });
      await commandHandler[command](interaction);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      await interaction.editReply({
        content: "There was an error trying to execute that command!",
        embeds: [],
      });
    }
  } else {
    console.error(`Command not found: ${command}`);
  }
};
