import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateMessage, generateLocationMessage } from "./utils/messages.js";
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

  socket.on("join", ({ username, room }) => {
    socket.join(room); // The join method can only be used on the server side - allows us to join a specific chatroom. The join method allows us to emit events to those in this specific chatroom only.

    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`));
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter(); // bad-words npm package; allows us to check for profanity, then send info back to client via callback

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to("nyc").emit("message", generateMessage(message));
    callback(); // allowed to pass additional information via callback to the client (original emmitter)
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );

    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
