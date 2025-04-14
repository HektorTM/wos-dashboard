{/*server.js*/}
const express = require('express');
const cors = require('cors');
const currencyRoutes = require('./Routes/CurrencyRoutes');
const AdminRoutes = require('./Routes/AdminRoutes');
const UnlockableRoutes = require('./Routes/UnlockableRoutes');
const CitemRoutes = require('./Routes/CitemRoutes');
const TitleRoutes = require('./Routes/TitleRoutes');
const BadgeRoutes = require('./Routes/BadgeRoutes');
const SearchRoutes = require('./Routes/SearchRoutes');

const app = express();
const PORT = 3001;

console.log('Serverfile started')

app.use(cors());
app.use(express.json());
app.use('/api/currencies', currencyRoutes);
app.use('/api/unlockables', UnlockableRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/citems', CitemRoutes);
app.use('/api/titles', TitleRoutes);
app.use('/api/badges', BadgeRoutes);
app.use('/api/search', SearchRoutes);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
