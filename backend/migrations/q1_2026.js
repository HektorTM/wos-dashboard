const web = require('../webmeta');
const db = require('../db');

(async () => {
    await web.query(`ALTER TABLE users DROP COLUMN "permissions", ADD COLUMN "role" varchar(255) DEFAULT "Staff"`);


})