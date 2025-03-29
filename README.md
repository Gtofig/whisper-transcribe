# Audio Transcriber

A TypeScript application that transcribes audio files using OpenAI's Whisper API. It supports splitting large audio files into chunks to comply with the 25MB API limit.

## Features

- Transcribes WAV and MP3 audio files using OpenAI's Whisper API
- Automatically splits large audio files into chunks
- Adds timestamps to the transcription
- Supports various transcription options (language, prompt, temperature)
- Easy command-line interface

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- OpenAI API key

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/audio-transcriber.git
   cd audio-transcriber
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Basic Usage

```bash
npm start -- -i /path/to/your/audio/file.mp3
```

The transcription will be saved to `./transcriptions/file_transcription.txt`.

### Advanced Options

```bash
npm start -- \
  -i /path/to/your/audio/file.mp3 \
  -o /path/to/output/directory \
  -m 20 \
  -l en \
  -p "This is a discussion about technology." \
  -t 0.2
```

### Options

- `-i, --input`: Path to the input audio file (required)
- `-o, --output`: Output directory for transcriptions (default: `./transcriptions`)
- `-m, --maxChunkSize`: Maximum chunk size in MB (default: 25)
- `-l, --language`: Language of the audio (ISO-639-1 code)
- `-p, --prompt`: Prompt to guide the transcription
- `-t, --temperature`: Temperature for the OpenAI API (default: 0)

## Development

For development with hot-reloading:

```bash
npm run dev -- -i /path/to/your/audio/file.mp3
```

## Dependencies

- `openai`: Official OpenAI API client
- `fluent-ffmpeg`: Node.js wrapper for FFmpeg
- `fs-extra`: Enhanced file system operations
- `dotenv`: Environment variable management
- `yargs`: Command-line argument parsing

## License

MIT