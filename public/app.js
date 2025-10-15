document.getElementById('goalForm').addEventListener('submit', async function(event) {
  event.preventDefault();  // Prevent default form submission
  
  const goalInput = document.getElementById('goalInput').value;
  const outputDiv = document.getElementById('planOutput');
  
  outputDiv.innerHTML = '<p>Generating plan... Please wait.</p>';  // Loading message
  
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal: goalInput }),
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();  // Get the response data
    
    // Display the plan
    outputDiv.innerHTML = `
      <h3>Goal: ${data.goal}</h3>
      <ul>
        ${data.tasks.map(task => `
          <li>
            <strong>Task:</strong> ${task.task}<br>
            <strong>Deadline:</strong> ${task.deadline}<br>
            <strong>Dependencies:</strong> ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
          </li>
        `).join('')}
      </ul>
    `;
  } catch (error) {
    outputDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});