const express = require('express');
const cors = require('cors');
const currencyRoutes = require('./CurrencyRoutes');

const app = express();
const PORT = 3001;

console.log('Serverfile started')

app.use(cors());
app.use(express.json());
app.use('/api/currencies', currencyRoutes);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
