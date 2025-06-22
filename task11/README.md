# Audio Transcription Analyzer

A Node.js console application that transcribes audio files using OpenAI's Whisper API and provides detailed analysis.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure OpenAI API Key**:
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

Run the application with an audio file:

```bash
npm start path/to/your/audio-file.mp3
```

Or directly with Node.js:

```bash
node index.js path/to/your/audio-file.mp3
```