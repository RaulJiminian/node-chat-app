const socket = io(); // initializing socket.io connection on client side
const $form = document.querySelector("form");
const $locationBtn = document.querySelector("#send-location");

socket.on("message", (msg) => {
  console.log(msg);
});

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
