# MohrkeGPT Bot

A Discord bot powered by OpenAI GPT-3.5-turbo to answer questions, provide information, and read responses aloud in voice channels.

## Prerequisites

- Node.js v16.6.0 or higher
- npm
- An OpenAI API key
- A Discord bot token

## Installation

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Create a `.env` file in the root directory and add the following variables:
    - `OPENAI_API_KEY`: Your OpenAI API key
    - `DISCORD_BOT_KEY`: Your Discord bot token
4. Run `npm run register` to register the bot's commands with Discord.
5. Run `npm run start` to start the bot.

## Usage

The bot supports the following commands:

### /ask

Ask MohrkeGPT a question

Usage: `/ask question [--tts]`

Arguments:
- `question` (required): The question to ask MohrkeGPT.
- `--tts` (optional): Read the response aloud in a voice channel.

### /say

Tell MohrkeGPT to say something

Usage: `/say text`

Arguments:
- `text` (required): The text that MohrkeGPT should say.

### /chat

Chat with MohrkeGPT

Usage: `/chat prompt [--tts]`

Arguments:
- `prompt` (required): The prompt for the chat.
- `--tts` (optional): Read the response aloud in a voice channel.

### /stop

Stop the audio

Usage: `/stop`

### /clear

Clear the conversation history

Usage: `/clear`

## Credits

- MohrkeGPT was created by Ala Arab
- MohrkeGPT uses the following libraries:
  - [discord.js](https://discord.js.org)
  - [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice)
  - [@google-cloud/text-to-speech](https://www.npmjs.com/package/@google-cloud/text-to-speech)
  - [openai](https://www.npmjs.com/package/openai)

## License

MohrkeGPT is licensed under the [MIT License](LICENSE).
