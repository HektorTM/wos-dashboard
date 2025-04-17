{/*server.js*/}
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cron = require('node-cron');
const requireAuth = require('./middleware/auth');
const SQLiteStore = require('connect-sqlite3')(session);
const currencyRoutes = require('./Routes/db_server/CurrencyRoutes');
const UnlockableRoutes = require('./Routes/db_server/UnlockableRoutes');
const CitemRoutes = require('./Routes/db_server/CitemRoutes');
const TitleRoutes = require('./Routes/db_server/TitleRoutes');
const BadgeRoutes = require('./Routes/db_server/BadgeRoutes');
const SearchRoutes = require('./Routes/db_server/SearchRoutes');
const LogRoutes = require('./Routes/db_web/LogRoutes');
const UserRoutes = require('./Routes/db_web/UserRoutes');
const ActivityRoutes = require('./Routes/db_web/ActivityRoutes');
const DataRoutes = require('./Routes/db_web/DataRoutes')

const app = express();
const PORT = 3001;

console.log('Serverfile started')

app.use(express.json());
app.use(session({
  secret: 'a-very-secret-key', // Use environment variable for production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if you're using HTTPS in production
    sameSite: 'lax', // Helps with CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new SQLiteStore({
    dir: './sessions', // Directory where session data will be stored (you can change this path)
    db: 'sessions.db', // Name of the SQLite database file for storing session data
    ttl: 86400 // 24 hours (same as maxAge for cookie)
  })
}));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/users', UserRoutes);

app.use('/api', requireAuth);

app.use('/api/currencies', currencyRoutes);
app.use('/api/unlockables', UnlockableRoutes);
app.use('/api/citems', CitemRoutes);
app.use('/api/titles', TitleRoutes);
app.use('/api/badges', BadgeRoutes);
app.use('/api/search', SearchRoutes);
app.use('/api/logs', LogRoutes);
app.use('/api/page-data', DataRoutes);

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
