# Service Analysis Tool

A console application that generates comprehensive analysis reports for digital services and products.

## Setup

1. Install dependencies:
```bash
npm install openai dotenv
```

2. Create a `.env` file in the project root:
```
OPENAI_API_KEY=your-openai-api-key
```

## Usage

Run the application:
```bash
node app.js
```

Then enter either:
- A service name (e.g., "Spotify", "Notion")
- A service description

The tool will generate a detailed markdown report analyzing the service. 