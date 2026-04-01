require('dotenv').config();
const express = require('express');
const db = require('./models');

const app = express();
app.use(express.json());

app.use('/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('OnPurpose API Running');
});

// CONNECT DB
db.sequelize.sync().then(() => {
  console.log('Database connected');

  app.listen(process.env.PORT || 3000, () => {
    console.log('Server running');
  });
});
