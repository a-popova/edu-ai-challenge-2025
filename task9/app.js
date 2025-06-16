import OpenAI from "openai";
import * as dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const client = new OpenAI();

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt template for the analysis
const analysisPrompt = `Analyze the following service/product and provide a comprehensive report in markdown format.
An output result should include the following sections:

Brief History: Founding year, milestones, etc.
Target Audience: Primary user segments
Core Features: Top 2–4 key functionalities
Unique Selling Points: Key differentiators
Business Model: How the service makes money
Tech Stack Insights: Any hints about technologies used
Perceived Strengths: Mentioned positives or standout features
Perceived Weaknesses: Cited drawbacks or limitations

After that provide a detailed analysis of the service/product. It should include different viewpoints - business, technical, and user-focused perspectives.

From business perspective analyze:
   - Business Model
   - Market Position
   - Main Competitors

From technical perspective analyze:
   - Technology Stack
   - Architecture Overview
   - Challenges

From user-focused perspective analyze:
- Growth Potential
- Key features
- User Benefits

Service/Product to analyze: {input}

Please provide a detailed, well-structured analysis in markdown format.`;

async function generateAnalysis(input) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional business and technical analyst specializing in digital products and services."
                },
                {
                    role: "user",
                    content: analysisPrompt.replace("{input}", input)
                }
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error generating analysis:", error.message);
        return null;
    }
}

// Main function to run the application
async function main() {
    console.log("Welcome to the Service Analysis Tool");
    console.log("------------------------------------");
    console.log("You can enter either:");
    console.log("1. A known service name (e.g., 'Spotify', 'Notion')");
    console.log("2. A description of your service");
    console.log("\nPlease enter your input below:");

    rl.question("", async (input) => {
        if (!input.trim()) {
            console.log("Error: Input cannot be empty");
            rl.close();
            return;
        }

        console.log("\nGenerating analysis...");
        const analysis = await generateAnalysis(input);

        if (analysis) {
            console.log("\nAnalysis Report:");
            console.log("---------------\n");
            console.log(analysis);
        } else {
            console.log("Failed to generate analysis. Please try again.");
        }

        rl.close();
    });
}

// Run the application
main().catch(console.error);