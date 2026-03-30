const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(require('cors')());
app.use(require('helmet')());

app.get('/', (req, res) => {
  res.json({
    message: 'OnPurpose API is running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
