const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ ERROR: `serviceAccountKey.json` file is missing.");
    process.exit(1);
}


admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    databaseURL: "https://your-project-id.firebaseio.com", 
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const { idToken, phoneNumber, fullName, age, gender, role } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                uid,
                phoneNumber,
                fullName,
                age,
                gender,
                role,
                createdAt: new Date(),
            });
        }

        res.status(200).json({ message: "User registered successfully!", uid });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(400).json({ error: "Invalid token" });
    }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
