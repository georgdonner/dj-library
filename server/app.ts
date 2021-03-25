require('dotenv').config();
import express from 'express';

import connect from './db/connect';
import api from './api/index';

const app = express();
const port: number = Number(process.env.PORT) || 3100;

app.use(express.json());

connect();

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

app.use('/api', api);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
