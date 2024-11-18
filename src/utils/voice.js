const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  joinVoiceChannel,
} = require("@discordjs/voice");
const { Readable } = require("stream");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let audioPlayer;
let connection;

async function stopAudio(interaction) {
  if (audioPlayer) {
    audioPlayer.stop();
  }
  if (connection) {
    connection.destroy();
  }
  await interaction.editReply({
    content: "Audio stopped.",
    embeds: [],
  });
}

async function readAloud(text, interaction) {
  if (interaction.member.voice.channel) {
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const audioBuffer = Buffer.from(await response.arrayBuffer());

      // Wrap Buffer into a stream and ensure all data is flushed
      const readableStream = new Readable({
        read() {
          this.push(audioBuffer);
          this.push(null);
        },
      });

      const resource = createAudioResource(readableStream, {
        inlineVolume: true, // Optional: Adjust volume if needed
      });

      audioPlayer = createAudioPlayer();
      connection = await joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      connection.subscribe(audioPlayer);
      audioPlayer.play(resource);

      // Listen for playback completion and ensure cleanup
      audioPlayer.on(AudioPlayerStatus.Idle, () => {
        if (connection) {
          connection.destroy();
          connection = null;
        }
        if (audioPlayer) {
          audioPlayer.stop();
          audioPlayer = null;
        }
      });

      // Debugging: Log when playback starts
      audioPlayer.on(AudioPlayerStatus.Playing, () => {
        console.log("Audio is playing");
      });

    } catch (error) {
      console.error("Error in TTS:", error);
      await interaction.editReply({
        content: "Couldn't read the response aloud. Try again.",
        embeds: [],
      });
    }
  } else {
    await interaction.editReply({
      content: "Join a voice channel to hear the bot.",
    });
  }
}

module.exports = { readAloud, stopAudio };