# Product Search Tool

A console-based product search application that uses OpenAI's function calling to process natural language queries and search through a product dataset.

## How It Works

1. You describe what you're looking for in natural language
2. OpenAI processes your query and the product dataset
3. The AI returns filtered products that match your criteria
4. Results are displayed in a structured format

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   Create a `.env` file in the project directory:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## Usage

Once the application starts, simply describe what you're looking for:

```
What are you looking for?
> I need wireless headphones under $150 with good ratings

Filtered Products:
1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
```

### Example Queries

- "I need a smartphone under $800 with a great camera"
- "Show me fitness equipment under $100 that's in stock"
- "Find me kitchen appliances with high ratings"
- "I want books about programming under $50"

Type `quit` to exit the application.

## Dataset

The application searches through a dataset of 50 products across 5 categories:
- Electronics
- Fitness
- Kitchen
- Books
- Clothing

Each product includes name, category, price, rating, and stock status. 