const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/ytdl', async (req, res) => {
  const { link } = req.query;
  if (!link) {
    return res.status(400).json({ status: false, message: 'Missing link parameter' });
  }

  try {
    const apiRes = await fetch(`https://luffy-api-v3.onrender.com/api/ytdl?link=${encodeURIComponent(link)}`);
    const data = await apiRes.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).json({ status: false, message: 'Error fetching data from API' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});