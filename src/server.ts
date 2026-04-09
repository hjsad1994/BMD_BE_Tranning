import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT ?? 3000;
const HOST = "192.168.1.4";

app.listen(Number(PORT), HOST, () => {
  console.log(`server running at http://${HOST}:${PORT}`);
});
