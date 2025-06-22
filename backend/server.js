{/*server.js*/}
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cron = require('node-cron');
const requireAuth = require('./middleware/auth');
const MySQLStore = require('express-mysql-session')(session);
const currencyRoutes = require('./Routes/db_server/CurrencyRoutes');
const UnlockableRoutes = require('./Routes/db_server/UnlockableRoutes');
const CitemRoutes = require('./Routes/db_server/CitemRoutes');
const CosmeticRoutes = require('./Routes/db_server/CosmeticRoutes');
const SearchRoutes = require('./Routes/db_server/SearchRoutes');
const LogRoutes = require('./Routes/db_web/LogRoutes');
const UserRoutes = require('./Routes/db_web/UserRoutes');
const ActivityRoutes = require('./Routes/db_web/ActivityRoutes');
const DataRoutes = require('./Routes/db_web/DataRoutes');
const MinecraftRoutes = require('./Routes/util/MinecraftRoutes');
const ChannelRoutes = require('./Routes/db_server/ChannelRoutes');
const StatsRoutes = require('./Routes/db_server/StatsRoutes');
const InteractionRoutes = require('./Routes/db_server/InteractionRoutes');
const ConditionRoutes = require('./Routes/db_server/ConditionRoutes');
const PlayerDataRoutes = require('./Routes/db_server/PlayerDataRoutes');
const FishingRoutes = require('./Routes/db_server/FishingRoutes');
const RequestRoutes = require('./Routes/db_web/RequestRoutes');
const GithubRoutes = require('./Routes/db_web/GithubRoutes');
const CooldownRoutes = require('./Routes/db_server/CooldownRoutes');

require('./utils/initTables');

const app = express();
const PORT = 3001;

const mysqlOptions = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  createDatabaseTable: true
};

const sessionStore = new MySQLStore(mysqlOptions);

console.log('Serverfile started')

app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SECRET, // Use env variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true', // Set to true for HTTPS
    sameSite: process.env.COOKIE_SAMESITE,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: sessionStore
}));


app.use(cors({
  origin: ['https://admin.worldofsorcery.com', 'https://worldofsorcery.com', 'http://localhost:5173'],
  credentials: true,
}));

app.use('/api/users', UserRoutes);
app.use('/api/mc-user', MinecraftRoutes);

app.use('/api', requireAuth);

app.use('/api/currencies', currencyRoutes);
app.use('/api/unlockables', UnlockableRoutes);
app.use('/api/citems', CitemRoutes);
app.use('/api/cosmetics', CosmeticRoutes);
app.use('/api/search', SearchRoutes);
app.use('/api/logs', LogRoutes);
app.use('/api/page-data', DataRoutes);
app.use('/api/channels', ChannelRoutes);
app.use('/api/stats', StatsRoutes);
app.use('/api/interactions', InteractionRoutes);
app.use('/api/conditions', ConditionRoutes);
app.use('/api/playerdata', PlayerDataRoutes);
app.use('/api/fishies', FishingRoutes);
app.use('/api/requests', RequestRoutes);
app.use('/api/bugs', GithubRoutes);
app.use('/api/cooldowns', CooldownRoutes);

app.use('/api/activity', ActivityRoutes);


app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

cron.schedule('0 3 * * *', () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  db.prepare(`
    UPDATE users
    SET is_active = 0
    WHERE last_login IS NOT NULL
      AND datetime(last_login) < datetime(?)
  `).run(oneMonthAgo.toISOString());

  console.log('[CRON] Deactivated users inactive for over a month');
});
