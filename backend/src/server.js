require("dotenv").config();
const app = require("./app");
const { initDb } = require("./db");

const port = process.env.PORT || 4000;

async function start() {
  try {
    await initDb();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Trusiq backend listening on port ${port}`);
    });
  } catch (error) {
    console.error(`Trusiq backend startup failed: ${error.message}`);
    process.exitCode = 1;
  }
}

void start();
