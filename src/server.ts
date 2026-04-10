import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? "localhost";

app.listen(Number(PORT), HOST, () => {
  console.log(`server running at http://${HOST}:${PORT}`);
});
