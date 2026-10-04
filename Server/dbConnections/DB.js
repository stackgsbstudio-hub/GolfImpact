import mongoose from "mongoose";

let isConnected = false;

async function DbConnection() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL);

    isConnected = db.connections[0].readyState === 1;

    console.log("DB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error.message);

    // Vercel/serverless me process.exit(1) mat karo
    throw error;
  }
}

export default DbConnection;
