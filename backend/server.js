const express = require('express');
const cors = require('cors');
const usersRoute = require('./routes/user');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/users', usersRoute);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});