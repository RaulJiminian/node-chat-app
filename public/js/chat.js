// Initializing socket.io connection on client side
const socket = io();

// Elements (querySelect'ed); the $ is convention for storing HTML elements
const $form = document.querySelector("form");
const $locationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Get height of the new message
  const newMessageStyles = getComputedStyle($newMessage); // getComputedStyles is made available to us by the browser.
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Get visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far has the client scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Socket listeners => communication coming in from the server side
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  // console.log(message);
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
});

// Event Listeners (form submit and button click)
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { message, subBtn } = e.target.elements; // extracting input (name=message) and submit button (name=subBtn) from form elements

  // Disable form button to prevent duplicate messages being set. Re-enable the button in the acknowledgement callback below
  subBtn.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", message.value, (error) => {
    // the last argument (acknowledgement) can be used on the server side as a validator or to get additional information. Acknowledgements are set on the emitter (from client side)

    // remove disabled attribute to form button; allows client to continue sending messages. Also clear the input tag and focus on input tag.
    subBtn.removeAttribute("disabled");
    message.value = "";
    message.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

$locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your broswer.");
  }

  // disable send location button to prevent duplicate requests; re-enable in callback
  $locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        // re-enable send location button
        $locationBtn.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

// Socket Emitters
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
