const dotenv = require("dotenv");
const { EmbedBuilder } = require("discord.js");
const OpenAI = require("openai");
const { get_encoding } = require("tiktoken"); // Correct method for token counting
const messageHistory = require("./messageHistory");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Periodic cleanup task
setInterval(() => {
  messageHistory.autoClearCheck();
}, 600000);

function estimateTokenCount(messages) {
  const encoding = get_encoding("cl100k_base"); // Use appropriate encoding for the model
  const joinedContent = messages.map((msg) => msg.content).join(" ");
  const tokenCount = encoding.encode(joinedContent).length;
  encoding.free(); // Free resources when done
  return tokenCount;
}

async function getChatCompletion(prompt, interaction) {
  try {
    const userId = interaction.user.id;
    messageHistory.addUserMessage(userId, prompt);

    const messages = messageHistory.getMessages(userId);

    // Ensure messages don't exceed the context length limit (128,000 tokens for GPT-4o)
    while (messages.length > 0 && estimateTokenCount(messages) > 128000) {
      messages.shift();
    }

    // Format the input for the responses API
    const formattedInput = messages.map(msg => {
      if (msg.role === "system") {
        return { instructions: msg.content };
      }
      return msg.content;
    }).join("\n\n");

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: formattedInput,
      instructions: messages.find(msg => msg.role === "system")?.content,
      temperature: 1.0,
      text: {
        format: {
          type: "text"
        }
      },
      tools: [
        {
          "type": "web_search_preview"
        }
      ],
      tool_choice: "auto"  // Let the model decide when to use web search
    });

    // Debug log to see the response structure
    console.log('OpenAI Response:', JSON.stringify(response, null, 2));

    // Handle the response based on its status
    if (response.status !== 'completed') {
      throw new Error(`Response status: ${response.status}`);
    }

    // Extract the response text from the output messages
    const responseData = response.output.find(output => output.type === 'message')?.content[0]?.text;
    if (!responseData) {
      throw new Error('No text response found in the output');
    }

    messageHistory.addAssistantMessage(userId, responseData);

    const gptEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
      })
      .addFields(
        { name: "Question", value: prompt },
        { name: "Answer", value: responseData }
      )
      .setTimestamp()
      .setFooter({
        text: "HellGPT-Q",
        iconURL: "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return responseData;
  } catch (error) {
    console.error(`Error getting GPT response: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    await interaction.editReply({
      content: "Sorry, I couldn't process your request. Please try again later.",
      embeds: [],
    });
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

async function getDrawCompletion(prompt, interaction) {
  try {
    console.log(`Prompt for DALL-E: ${prompt}`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    const gptEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
      })
      .addFields(
        { name: "Prompt", value: prompt }
      )
      .setImage(imageUrl)
      .setTimestamp()
      .setFooter({
        text: "HellGPT-Q",
        iconURL: "https://cdn.discordapp.com/avatars/1090478092230864957/a68d50bb06045f0bb0041666d2a91573.png",
      });

    await interaction.editReply({
      content: "",
      embeds: [gptEmbed],
    });

    return imageUrl;
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    await interaction.editReply({
      content: "Sorry, I couldn't process your request. Please try again later.",
      embeds: [],
    });
    return "Sorry, I couldn't process your request. Please try again later.";
  }
}

module.exports = {
  getChatCompletion,
  getDrawCompletion,
};
