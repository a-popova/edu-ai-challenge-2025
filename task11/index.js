import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AudioTranscriptionAnalyzer {
  constructor() {
    this.supportedFormats = ['.mp3', '.wav', '.m4a', '.flac', '.webm', '.mp4'];
  }

  /**
   * Validate if the audio file exists and has a supported format
   */
  validateAudioFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!this.supportedFormats.includes(ext)) {
      throw new Error(`Unsupported audio format: ${ext}. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 25) {
      throw new Error('Audio file too large. Maximum size is 25MB for Whisper API.');
    }

    return true;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   */
  async transcribeAudio(filePath) {
    try {
      console.log('🎵 Starting transcription...');
      console.log(`📁 File: ${path.basename(filePath)}`);

      this.validateAudioFile(filePath);

      const audioFile = fs.createReadStream(filePath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      console.log('✅ Transcription completed successfully!');
      return transcription;

    } catch (error) {
      console.error('❌ Transcription failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate summary using GPT model
   */
  async generateSummary(transcriptionText) {
    try {
      console.log('📝 Generating summary...');

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional content analyst and summarization expert. Create a comprehensive, well-structured summary of the provided audio transcript.

Your summary should:
- Begin with a brief overview of the main topic/purpose
- Organize content into clear, logical sections with headings
- Highlight key points, decisions, and action items
- Include important insights, conclusions, or recommendations
- Maintain the original context and tone
- Be concise yet comprehensive (20-30% of original length)
- Use professional, clear language
- Focus on the most valuable and actionable information

Format your response with proper markdown headings and structure.`
          },
          {
            role: 'user',
            content: `Please analyze and summarize this audio transcript:\n\n${transcriptionText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
      });

      const summary = response.choices[0].message.content;
      console.log('✅ Summary generated successfully!');
      return summary;

    } catch (error) {
      console.error('❌ Summary generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract custom statistics from the transcript
   */
  async extractStatistics(transcriptionText, duration) {
    try {
      console.log('📊 Extracting statistics...');

      // Calculate word count
      const words = transcriptionText.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;

      // Calculate speaking speed (words per minute)
      const durationInMinutes = duration / 60;
      const speakingSpeedWpm = Math.round(wordCount / durationInMinutes);

      // Use OpenAI function calling to identify frequently mentioned topics
      const topicsResponse = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a content analysis expert. Analyze the provided transcript and identify the most frequently mentioned topics, themes, or subjects. Focus on meaningful topics that appear multiple times throughout the conversation.`
          },
          {
            role: 'user',
            content: `Analyze this transcript and extract the most frequently mentioned topics:\n\n${transcriptionText}`
          }
        ],
        functions: [
          {
            name: 'extract_topics',
            description: 'Extract frequently mentioned topics from the transcript',
            parameters: {
              type: 'object',
              properties: {
                topics: {
                  type: 'array',
                  description: 'List of frequently mentioned topics with their mention counts',
                  items: {
                    type: 'object',
                    properties: {
                      topic: {
                        type: 'string',
                        description: 'The topic name (2-4 words, clear and concise)'
                      },
                      mentions: {
                        type: 'integer',
                        description: 'Number of times this topic is mentioned or referenced'
                      }
                    },
                    required: ['topic', 'mentions']
                  }
                }
              },
              required: ['topics']
            }
          }
        ],
        function_call: { name: 'extract_topics' },
        max_tokens: 800,
        temperature: 0.1
      });

      let frequentlyMentionedTopics = [];
      
      try {
        const functionCall = topicsResponse.choices[0].message.function_call;
        if (functionCall && functionCall.name === 'extract_topics') {
          const topicsData = JSON.parse(functionCall.arguments);
          frequentlyMentionedTopics = topicsData.topics
            .filter(topic => topic.mentions >= 2) // Only include topics mentioned at least twice
            .sort((a, b) => b.mentions - a.mentions) // Sort by mentions descending
            .slice(0, 8); // Limit to top 8 topics
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse topics from OpenAI function call, using fallback analysis');
        // Fallback to basic analysis if function calling fails
        frequentlyMentionedTopics = await this.performBasicTopicAnalysis(transcriptionText);
      }

      const statistics = {
        word_count: wordCount,
        speaking_speed_wpm: speakingSpeedWpm,
        frequently_mentioned_topics: frequentlyMentionedTopics
      };

      console.log('✅ Statistics extracted successfully!');
      return statistics;

    } catch (error) {
      console.error('❌ Statistics extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Fallback method for basic topic analysis (now using OpenAI without function calling)
   */
  async performBasicTopicAnalysis(transcriptionText) {
    try {
      // Use a simpler OpenAI call as fallback
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `Extract 3-5 key topics from this transcript. Return only a JSON array in this exact format:
[{"topic": "Topic Name", "mentions": 3}]

Rules:
- Only topics mentioned at least 2 times
- Keep topic names short (2-4 words)
- Sort by mention count (highest first)
- Return valid JSON only, no other text`
          },
          {
            role: 'user',
            content: transcriptionText
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      });

      const content = response.choices[0].message.content.trim();
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);
      
    } catch (error) {
      console.warn('⚠️ Fallback topic analysis also failed, using manual analysis');
      return this.performManualTopicAnalysis(transcriptionText);
    }
  }

  /**
   * Manual fallback method for topic analysis (last resort)
   */
  performManualTopicAnalysis(text) {
    // Simple keyword frequency analysis as last resort
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word));

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({
        topic: word.charAt(0).toUpperCase() + word.slice(1),
        mentions: count
      }));
  }

  /**
   * Check if a word is a common stop word
   */
  isStopWord(word) {
    const stopWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'water', 'very', 'what', 'know', 'while', 'here'];
    return stopWords.includes(word);
  }

  /**
   * Save transcription to transcription.md file (overwrites each time)
   */
  async saveTranscription(transcription, originalFilePath) {
    try {
      const transcriptionFileName = 'transcription.md';
      const transcriptionPath = path.join(__dirname, transcriptionFileName);

      const content = `# Audio Transcription

**Original File:** ${path.basename(originalFilePath)}
**Transcribed On:** ${new Date().toLocaleString()}
**Duration:** ${transcription.duration} seconds
**Language:** ${transcription.language || 'Auto-detected'}

## Transcript

${transcription.text}

---

*Transcribed using OpenAI Whisper API*
`;

      fs.writeFileSync(transcriptionPath, content, 'utf8');
      console.log(`📄 Transcription saved to: ${transcriptionFileName}`);
      
      return {
        filePath: transcriptionPath,
        fileName: transcriptionFileName,
        content: transcription.text
      };

    } catch (error) {
      console.error('❌ Failed to save transcription:', error.message);
      throw error;
    }
  }

  /**
   * Save summary to summary.md file (overwrites each time)
   */
  async saveSummary(summary, originalFilePath, transcriptionDuration) {
    try {
      const summaryFileName = 'summary.md';
      const summaryPath = path.join(__dirname, summaryFileName);

      const content = `# Audio Summary

**Original File:** ${path.basename(originalFilePath)}
**Summarized On:** ${new Date().toLocaleString()}
**Duration:** ${transcriptionDuration} seconds

## Summary

${summary}

---

*Summary generated using OpenAI gpt-4.1-mini*
`;

      fs.writeFileSync(summaryPath, content, 'utf8');
      
      return {
        filePath: summaryPath,
        fileName: summaryFileName,
        content: summary
      };

    } catch (error) {
      console.error('❌ Failed to save summary:', error.message);
      throw error;
    }
  }

  /**
   * Save analysis statistics to analysis.json file (overwrites each time)
   */
  async saveAnalysis(statistics) {
    try {
      const analysisFileName = 'analysis.json';
      const analysisPath = path.join(__dirname, analysisFileName);

      const analysisData = {
        ...statistics
      };

      fs.writeFileSync(analysisPath, JSON.stringify(analysisData, null, 2), 'utf8');
      console.log(`📊 Analysis saved to: ${analysisFileName}`);
      
      return {
        filePath: analysisPath,
        fileName: analysisFileName,
        content: analysisData
      };

    } catch (error) {
      console.error('❌ Failed to save analysis:', error.message);
      throw error;
    }
  }

  /**
   * Process audio file: validate, transcribe, summarize, and save
   */
  async processAudioFile(filePath) {
    try {
      // Convert to absolute path if relative
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      
      console.log('\n🚀 Starting audio processing...');
      console.log(`📍 Processing: ${absolutePath}`);

      // Step 1: Transcribe the audio
      const transcription = await this.transcribeAudio(absolutePath);
      
      // Step 2: Save transcription to file
      const savedTranscription = await this.saveTranscription(transcription, absolutePath);

      // Step 3: Generate summary
      const summary = await this.generateSummary(transcription.text);

      // Step 4: Extract statistics
      const statistics = await this.extractStatistics(transcription.text, transcription.duration);

      // Step 5: Save summary to file
      const savedSummary = await this.saveSummary(summary, absolutePath, transcription.duration);

      // Step 6: Save analysis statistics to file
      const savedAnalysis = await this.saveAnalysis(statistics);

      return {
        transcription,
        summary,
        statistics,
        savedFiles: {
          transcription: savedTranscription,
          summary: savedSummary,
          analysis: savedAnalysis
        }
      };

    } catch (error) {
      console.error('❌ Processing failed:', error.message);
      throw error;
    }
  }
}

// Main execution function
async function main() {
  try {
    // Check if OpenAI API key is provided
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is required.');
      console.log('💡 Please create a .env file with your OpenAI API key:');
      console.log('   OPENAI_API_KEY=your_api_key_here');
      process.exit(1);
    }

    // Get audio file path from command line arguments
    const audioFilePath = process.argv[2];
    
    if (!audioFilePath) {
      console.log('🎵 Audio Transcription Analyzer');
      console.log('================================');
      console.log('');
      console.log('Usage: node index.js <path-to-audio-file>');
      console.log('');
      console.log('Supported formats: .mp3, .wav, .m4a, .flac, .webm, .mp4');
      console.log('Maximum file size: 25MB');
      console.log('');
      console.log('Example: node index.js ./audio/recording.mp3');
      console.log('');
      console.log('Output files:');
      console.log('  📄 transcription.md - Full transcript');
      console.log('  📝 summary.md - AI-generated summary');
      console.log('  📊 analysis.json - Statistics and analytics');
      process.exit(1);
    }

    // Initialize analyzer and process the audio file
    const analyzer = new AudioTranscriptionAnalyzer();
    const result = await analyzer.processAudioFile(audioFilePath);

    console.log('\n✨ Processing completed successfully!');
    console.log(`📄 Transcription saved as: ${result.savedFiles.transcription.fileName}`);
    console.log(`📝 Summary saved as: ${result.savedFiles.summary.fileName}`);
    console.log(`📊 Analysis saved as: ${result.savedFiles.analysis.fileName}`);
    console.log(`⏱️  Duration: ${result.transcription.duration} seconds`);
    console.log(`🗣️  Language: ${result.transcription.language || 'Auto-detected'}`);

    // Display summary in console
    console.log('\n📝 SUMMARY');
    console.log('=' .repeat(60));
    console.log(result.summary);

    // Display statistics in console
    console.log('\n📊 ANALYTICS');
    console.log('=' .repeat(60));
    console.log(`📈 Total Words: ${result.statistics.word_count.toLocaleString()}`);
    console.log(`🗣️  Speaking Speed: ${result.statistics.speaking_speed_wpm} words per minute`);
    
    // Speaking speed assessment
    let speedAssessment = '';
    if (result.statistics.speaking_speed_wpm < 120) {
      speedAssessment = '(Slow pace)';
    } else if (result.statistics.speaking_speed_wpm < 160) {
      speedAssessment = '(Normal pace)';
    } else if (result.statistics.speaking_speed_wpm < 200) {
      speedAssessment = '(Fast pace)';
    } else {
      speedAssessment = '(Very fast pace)';
    }
    console.log(`   ${speedAssessment}`);
    
    console.log(`\n🏷️  Frequently Mentioned Topics:`);
    if (result.statistics.frequently_mentioned_topics.length > 0) {
      result.statistics.frequently_mentioned_topics.forEach((topic, index) => {
        const bar = '█'.repeat(Math.min(topic.mentions, 20));
        console.log(`   ${(index + 1).toString().padStart(2)}. ${topic.topic.padEnd(25)} ${bar} ${topic.mentions} mentions`);
      });
    } else {
      console.log('   No significant topics identified');
    }

    // Display file locations
    console.log('\n📁 OUTPUT FILES');
    console.log('=' .repeat(60));
    console.log(`📄 Full Transcript: ${result.savedFiles.transcription.fileName}`);
    console.log(`📝 Summary: ${result.savedFiles.summary.fileName}`);
    console.log(`📊 Analytics: ${result.savedFiles.analysis.fileName}`);
    
    console.log('\n🎉 Audio analysis complete! All results are available above and in the generated files.');
    console.log('💡 Tip: Use the JSON file for programmatic access to the analytics data.');

  } catch (error) {
    console.error('\n💥 Application error:', error.message);
    process.exit(1);
  }
}

// Run the application
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main();
}

export default AudioTranscriptionAnalyzer; 