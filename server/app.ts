require('dotenv').config();
import express from 'express';
import path from 'path';

import connect from './db/connect';
import api from './api/routes/index';

const app = express();
const port: number = Number(process.env.PORT) || 3100;

app.use(express.json());
app.use(express.static(path.resolve('build')));

connect();

app.use('/api', api);

app.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
