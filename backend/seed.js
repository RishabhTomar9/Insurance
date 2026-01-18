const admin = require('./config/firebase');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();
connectDB();

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address as an argument.');
    process.exit(1);
}

const seedManager = async () => {
    try {
        let userRecord;
        let userInDb;

        // Check if user exists in Firebase
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log('User already exists in Firebase. Checking MongoDB...');
            userInDb = await User.findOne({ email: email });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('Creating new user in Firebase...');
                const defaultPassword = uuidv4();
                userRecord = await admin.auth().createUser({
                    email,
                    password: defaultPassword,
                    displayName: 'Manager',
                });
                console.log(`Default password: ${defaultPassword}`);
            } else {
                throw error;
            }
        }

        // Check if user exists in MongoDB
        if (!userInDb) {
            console.log('Creating new user in MongoDB...');
            userInDb = new User({
                uid: userRecord.uid,
                name: 'Manager',
                email: email,
                role: 'manager',
                passwordChanged: true,
            });
            await userInDb.save();
        } else {
            console.log('User already exists in MongoDB. Updating role...');
            userInDb.role = 'manager';
            await userInDb.save();
        }

        // Set custom claim in Firebase
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'manager' });

        console.log(`Successfully set manager role for email: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding manager:', error);
        process.exit(1);
    }
};

seedManager();
