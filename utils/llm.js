const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // Load .env variables

// Use Gemini 2.0 Flash model and API endpoint
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.error("❌ Missing Gemini API key. Please add GEMINI_API_KEY to your .env file.");
  process.exit(1);
}

/**
 * Generates a task plan using Gemini API.
 * @param {string} goal - The user's goal to break down into tasks.
 * @returns {Promise<object>} Parsed JSON of the task plan.
 */
async function generateTaskPlan(goal) {
  const prompt = `
    Break down the following goal into 4–8 actionable tasks.
    For each task, suggest a realistic deadline based on the goal's timeline (e.g., days or weeks).
    Include any dependencies between tasks.

    Respond ONLY with valid JSON (no markdown, no triple backticks, no explanation).
    Format:
    {
      "goal": "the original goal",
      "tasks": [
        {
          "task": "description of the task",
          "deadline": "suggested deadline (e.g., 'Day 1' or 'Week 2')",
          "dependencies": ["list of dependent task descriptions try to keep at least one if possible"]
        }
      ]
    }

    Goal: ${goal}
  `;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini API.");

    // Safely extract JSON from text (remove backticks if present)
    const cleanText = text.replace(/```json\s*|\s*```/g, '');
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response.");

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("🚨 Gemini API Error:", error.response?.data || error.message);
    throw new Error("Failed to generate task plan.");
  }
}

module.exports = { generateTaskPlan };

// Allow CLI testing
if (require.main === module) {
  const goal = process.argv.slice(2).join(' ') || "Build a personal portfolio website";
  generateTaskPlan(goal).then(console.log).catch(console.error);
}