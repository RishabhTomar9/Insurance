const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');

router.post('/set-manager-claim', async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).send('Missing uid');
    }

    try {
        const users = await admin.auth().listUsers();
        if (users.users.length === 1) {
            await admin.auth().setCustomUserClaims(uid, { role: 'manager' });
            return res.status(200).send({ message: 'Manager claim set' });
        } else {
            const user = await admin.auth().getUser(uid);
            if (user.customClaims && user.customClaims.role === 'manager') {
                return res.status(200).send({ message: 'Manager claim already set' });
            }
        }
        
        return res.status(403).send({ message: 'Not the first user' });

    } catch (error) {
        console.error('Error setting manager claim:', error);
        res.status(500).send('Error setting manager claim');
    }
});

module.exports = router;
