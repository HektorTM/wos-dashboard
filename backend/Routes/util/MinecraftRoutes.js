const express = require('express');
const fetch = require('node-fetch')
const router = express.Router();


router.get('/uuid/:uuid', async (req, res) => {
    const {uuid} = req.params;

    try {
        const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching Minecraft Username:', err);
        res.status(500).json({ err: 'Failed to fetch Username.'});
    }
});

router.get('/username/:username', async (req, res) => {
    const {username} = req.params;

    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching UUID:', err);
        res.status(500).json({ err: 'failed to fetch UUID.'});
    }
});

module.exports = router;