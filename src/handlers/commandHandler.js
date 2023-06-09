const {
  clearMessages,
  getCompletion,
  getChatCompletion,
} = require("../utils/gpt3");
const { readAloud, stopAudio } = require("../utils/voice");

const commands = [
  {
    name: "ask",
    description: "Ask MohrkeGPT a question",
    options: [
      {
        name: "question",
        type: 3, // 3 is string
        description: "The question to ask",
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
  ask: async (interaction) => {
    const question = interaction.options.getString("question");
    const response = await getCompletion(question, interaction);
    if(interaction.options.getBoolean("tts")) await readAloud(response, interaction);
  },
  say: async (interaction) => {
    const text = interaction.options.getString("text");
    await interaction.editReply({ content: text, embeds: [] });
    await readAloud(text, interaction);
  },
  chat: async (interaction) => {
    const prompt = interaction.options.getString("prompt");
    const response = await getChatCompletion(prompt, interaction);
    if(interaction.options.getBoolean("tts")) await readAloud(response, interaction);
  },
  stop: async (interaction) => {
    await stopAudio(interaction);
  },
  clear: async (interaction) => {
    await clearMessages(interaction);
  },
};
