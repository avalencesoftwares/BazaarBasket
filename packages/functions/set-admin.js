/**
 * Bootstrap script to set the admin role on a Firebase user account.
 * 
 * Usage:
 * 1. Make sure you are logged in via Firebase CLI:
 *    npx firebase login
 * 
 * 2. Run this script with the target user's email:
 *    node set-admin.js <user-email>
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Get the email from CLI arguments
const email = process.argv[2];
if (!email) {
  console.error('Error: Please provide the user email.');
  console.log('Usage: node set-admin.js <user-email>');
  process.exit(1);
}

// 2. Initialize Firebase Admin SDK
// Try loading service account key, otherwise fall back to default credentials (from Firebase CLI)
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let credentialOption;

if (fs.existsSync(serviceAccountPath)) {
  console.log('Found serviceAccountKey.json. Initializing with service account...');
  credentialOption = admin.credential.cert(require(serviceAccountPath));
} else {
  console.log('serviceAccountKey.json not found. Initializing with default application credentials (ensure you ran "npx firebase login")...');
  credentialOption = admin.credential.applicationDefault();
}

// Replace with your project ID
const projectId = 'bazaarbasket-d01db';

admin.initializeApp({
  credential: credentialOption,
  projectId: projectId,
});

const auth = admin.auth();
const db = admin.firestore();

async function setAdminRole() {
  try {
    console.log(`Locating user with email: ${email}...`);
    const user = await auth.getUserByEmail(email);
    const uid = user.uid;
    console.log(`User found! UID: ${uid}`);

    // Set Custom Claims for Auth
    console.log('Setting custom user claim { role: "admin" }...');
    await auth.setCustomUserClaims(uid, { role: 'admin' });
    console.log('Custom claim set successfully.');

    // Update or Create Firestore User document
    console.log('Updating Firestore user document...');
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const now = new Date();

    if (userDoc.exists) {
      await userRef.update({
        role: 'admin',
        updatedAt: now,
      });
      console.log('Existing Firestore user document updated.');
    } else {
      await userRef.set({
        uid: uid,
        email: email,
        displayName: user.displayName || 'Admin',
        role: 'admin',
        isActive: true,
        fcmTokens: [],
        addresses: [],
        createdAt: now,
        updatedAt: now,
      });
      console.log('New Firestore user document created.');
    }

    console.log(`\nSuccess! User ${email} is now registered as an Admin.`);
    console.log('You can now log in to the Admin Panel.');
    process.exit(0);
  } catch (error) {
    console.error('\nError setting admin role:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.log('Please make sure you have created the user in the Firebase Authentication Console first.');
    }
    process.exit(1);
  }
}

setAdminRole();
