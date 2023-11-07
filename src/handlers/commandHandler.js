const {
  clearMessages,
  getChatCompletion,
} = require("../utils/gpt4");
const messageHistory = require('../utils/messageHistory');
const { readAloud, stopAudio } = require("../utils/voice");

const commands = [
  {
    name: "chat",
    description: "Chat with MohrkeGPT",
    options: [
      {
        name: "prompt",
        type: 3, // 3 is string
        description: "Your chat prompt",
        required: true,
      },
      {
        name: "tts",
        type: 5, // 5 is boolean
        description: "Read the response aloud",
        required: false,
      },
    ],
  },
  {
    name: "draw",
    description: "Draw with MohrkeGPT",
    options: [
      {
        name: "prompt",
        type: 3, // 3 is string
        description: "Your draw prompt",
        required: true,
      },
    ],
  },
  {
    name: "clear",
    description: "Clear the conversation history",
  },
  {
    name: "say",
    description: "Tell MohrkeGPT to say something",
    options: [
      {
        name: "text",
        type: 3, // 3 is string
        description: "text to say",
        required: true,
      },
    ],
  },
  {
    name: "stop",
    description: "Stop the audio",
  },
];

module.exports = {
  commands,
  say: async (interaction) => {
    const text = interaction.options.getString("text");
    await interaction.editReply({ content: text, embeds: [] });
    await readAloud(text, interaction);
  },
  draw: async (interaction) => {
    const text = interaction.options.getString("text");
    await interaction.editReply({ content: text, embeds: [] });
  },
  chat: async (interaction) => {
    const prompt = interaction.options.getString("prompt");
    const response = await getChatCompletion(prompt, interaction);
    if (interaction.options.getBoolean("tts")) await readAloud(response, interaction);
  },
  stop: async (interaction) => {
    await stopAudio(interaction);
  },
  clear: async (interaction) => {
    messageHistory.clearUserHistory(interaction.user.id); // Clear history for this user
    await interaction.editReply({ content: "Your conversation history has been cleared.", embeds: [] });
  },
};
