# Node Chat App
A simple chat app using Node.js

## Emitter Events

- socket.emit: sends an event to a specific client
- socket.broadcast.emit: sends an event to all clients except the client that make original emit
- io.emit: sends an event to every connected client
- io.to.emit: sends an event to every client in a specific room
- socket.broadcast.to.emit: sends an event to every client in a specific room, except the client that make original emit


## Credit
Tutorial based on Andrew Mead - The Complete Node.js Developer Course