const users = [];

export const addUser = ({ id, username, room }) => {
  // Scrub client data (for spaces/casing)
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate client data (no empty strings)
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Check for existing user; if true (user exists), return error
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  // If user does not already exist, we can go ahead and store user
  const user = { id, username, room };
  users.push(user);

  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
