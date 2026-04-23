import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedUsers } from "./seed/users.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    //await seedUsers();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
