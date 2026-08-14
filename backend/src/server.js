require("dotenv").config();
const app = require("./app");
const { initDb } = require("./db");

const port = process.env.PORT || 4000;

initDb();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Trusiq backend running on http://localhost:${port}`);
});
