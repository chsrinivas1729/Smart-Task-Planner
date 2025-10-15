const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // For serving static files
const dotenv = require('dotenv');
const { generateTaskPlan } = require('./utils/llm');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public folder

// API Endpoint: POST /api/generate-plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    // Generate the task plan using LLM
    const plan = await generateTaskPlan(goal);
    
    res.json(plan); // Return the plan as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate plan', details: error.message });
  }
});

// Serve the frontend as the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});