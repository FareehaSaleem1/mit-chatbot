require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  try {
    // This lists all models available to your API key
    const modelList = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // access internal list if possible, but standard way is below:
    
    // Standard way to list models in v1beta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    console.log("=== YOUR AVAILABLE MODELS ===");
    if (data.models) {
      data.models.forEach(m => {
        // We only want models that support "generateContent"
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`Name: ${m.name}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }

  } catch (error) {
    console.error("Error checking models:", error);
  }
}

checkModels();