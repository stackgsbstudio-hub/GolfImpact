import mongoose from "mongoose";

async function DbConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected");
  } catch (error) {
    console.error("Connection Error:", error.message);
    process.exit(1);
  }
}

export default DbConnection;
