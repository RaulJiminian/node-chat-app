import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Filter from "bad-words";
import * as path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WS Connection!");

  socket.emit("message", "Welcome!"); // socket.emit emits to one client
  socket.broadcast.emit("message", "A new user has joined!"); // socket.broadcast emits to all clients except original client

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter(); // bad-words npm package; allows us to check for profanity, then send info back to client via callback

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.emit("message", message); // io.emit emits to all connected clients
    callback(); // allowed to pass additional information via callback to the client (original emmitter)
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );

    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
