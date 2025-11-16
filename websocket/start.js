import { setupWSConnection } from "@y-websocket/server";
import * as http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 1234;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req, {});
});

server.listen(PORT, () => {
  console.log(`Y-WebSocket server running on port ${PORT}`);
});
