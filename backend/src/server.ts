import { createServer } from "node:http";

import { app } from "./app";
import { initialzeSocketIO } from "./socket";

const port = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

const io = initialzeSocketIO(httpServer);

app.set("io", io);

httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});
