const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let scores = [];

app.get('/api/scores', (req, res) => {
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  res.json(topScores);
});

app.post('/api/scores', (req, res) => {
  const { score } = req.body;
  
  const newScore = {
    id: Date.now(),
    score,
    date: new Date()
  };
  
  scores.push(newScore);
  res.status(201).json(newScore);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});