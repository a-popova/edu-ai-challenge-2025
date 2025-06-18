import OpenAI from 'openai';
import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function to load products from JSON file
async function loadProducts() {
    try {
        const data = await fs.readFile('products.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading products:', error.message);
        process.exit(1);
    }
}

// Function to search products using OpenAI function calling
async function searchProducts(query, products) {
    try {
        const tools = [
            {
                type: "function",
                function: {
                    name: "filter_products",
                    description: "Filter products based on user preferences and return matching products",
                    parameters: {
                        type: "object",
                        properties: {
                            filtered_products: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { 
                                            type: "string",
                                            description: "Product name - REQUIRED"
                                        },
                                        category: { 
                                            type: "string",
                                            description: "Product category - REQUIRED"
                                        },
                                        price: { 
                                            type: "number",
                                            description: "Product price - REQUIRED"
                                        },
                                        rating: { 
                                            type: "number",
                                            description: "Product rating - REQUIRED"
                                        },
                                        in_stock: { 
                                            type: "boolean",
                                            description: "Product stock status - REQUIRED"
                                        }
                                    },
                                    required: ["name", "category", "price", "rating", "in_stock"],
                                    additionalProperties: false
                                },
                                description: "Array of products that match the user's criteria. Each product MUST include name, category, price, rating, and in_stock fields."
                            }
                        },
                        required: ["filtered_products"]
                    }
                }
            }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a product search assistant. Based on the user's natural language query, filter the provided products and return only those that match their criteria. 

IMPORTANT: You MUST return complete product objects with ALL fields (name, category, price, rating, in_stock) for each matching product. Do not omit any fields.

Available products: ${JSON.stringify(products)}`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            tools: tools,
            tool_choice: { type: "function", function: { name: "filter_products" } }
        });

        const toolCall = response.choices[0].message.tool_calls[0];
        const result = JSON.parse(toolCall.function.arguments);
        
        // Validate that all products have required fields
        const validProducts = result.filtered_products.filter(product => {
            if (!product.name || product.price === undefined || product.rating === undefined || product.in_stock === undefined) {
                console.warn('Warning: Incomplete product data received:', product);
                return false;
            }
            return true;
        });
        
        return validProducts;
    } catch (error) {
        console.error('Error searching products:', error.message);
        return [];
    }
}

// Function to display results
function displayResults(products) {
    if (products.length === 0) {
        console.log("\nNo products found matching your criteria.");
        return;
    }

    console.log("\nFiltered Products:");
    products.forEach((product, index) => {
        const stockStatus = product.in_stock ? "In Stock" : "Out of Stock";
        console.log(
            `${index + 1}. ${product.name} - $${product.price.toFixed(2)}, Rating: ${product.rating}, ${stockStatus}`
        );
    });
}

// Main function
async function main() {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
        console.error("Error: OPENAI_API_KEY environment variable is not set.");
        process.exit(1);
    }

    // Load products
    const products = await loadProducts();

    console.log("Welcome to the Product Search Tool!");
    console.log("Describe what you're looking for in natural language.");
    console.log("Example: 'I need a smartphone under $800 with a great camera and long battery life'");
    console.log("\nEnter 'quit' to exit.");

    while (true) {
        console.log("\nWhat are you looking for?");
        const query = readlineSync.question("> ").trim();

        if (query.toLowerCase() === 'quit') {
            break;
        }

        if (!query) {
            continue;
        }

        try {
            // Search products using OpenAI function calling
            const filteredProducts = await searchProducts(query, products);

            // Display results
            displayResults(filteredProducts);
        } catch (error) {
            console.error('An error occurred:', error.message);
        }
    }
}

// Run the application
main().catch(error => {
    console.error('Application error:', error.message);
    process.exit(1);
}); 