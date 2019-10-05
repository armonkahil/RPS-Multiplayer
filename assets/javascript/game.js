/*eslint-env jquery*/
$(document).ready(function() {
  var wins = 0;
  var losses = 0;
  var player = "";
  var player1present = false;
  var player2present = false;
  var firebaseConfig = {
    apiKey: "AIzaSyAa7lMljbrokwSwsctL_l9FcdyIvS6KuQ8",
    authDomain: "armon-rps.firebaseapp.com",
    databaseURL: "https://armon-rps.firebaseio.com",
    projectId: "armon-rps",
    storageBucket: "",
    messagingSenderId: "516504842409",
    appId: "1:516504842409:web:b4290bdceddf00b53b79b8"
  };

  firebase.initializeApp(firebaseConfig);
  var database = firebase.database();
  console.log(database);
  var gameDatabase = firebase
    .database()
    .ref()
    .child("gameObject");
  var trashDatabase = firebase
    .database()
    .ref()
    .child("trashtalk");
  var onlineDatabase = firebase
    .database()
    .ref()
    .child("presence");

  trashDatabase.on("value", function(snap) {
    var newtrash = snap.val().trash;
    $("#trashTalk").text(newtrash);
    console.log("trash talk", snap.val());
  });
  gameDatabase.on('value', function(snap) {
    console.log("game", snap.val());
  });
  onlineDatabase.on('value', function(snap) {
    console.log("presence", snap.val());
    player1present = snap.val().player1;
    player2present = snap.val().player2;
    console.log("player 1 is ", player1present);
    console.log("player 2 is ", player2present);
  });

  function animateCSS (element, animationName, callback) {
    const node = document.querySelector(element);
    node.classList.add("animated", animationName);

    function handleAnimationEnd () {
      node.classList.remove("animated", animationName);
      node.removeEventListener("animationend", handleAnimationEnd);

      if (typeof callback === "function") callback();
    }

    node.addEventListener("animationend", handleAnimationEnd);
  }

  var connectionsRef = database.ref("/connections");

  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes.
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  var connectedRef = database.ref(".info/connected");

  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });

  // When first loaded or when the connections list changes...
  connectionsRef.on("value", function(snap) {
    var present = snap.numChildren();
    console.log(present);
    console.log(typeof present);
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#connected-viewers").text(present);
    if (present === 1) {
      animateCSS("#player1", "bounce");
      player = "player1";
      player1present = true;
      player2present = false;
      console.log("I am ", player);
    } else if (present === 2) {
      animateCSS("#player1", "bounce");
      animateCSS("#player2", "bounce");
      player = "player2";
      player2present = true;
      console.log("i am ", player);
      letsstartTrashing();
    
    }
  });

  function firstpick() {
    $(".deck").on("click", function() {
      var value = this.id;
      console.log(value)

    });
  }

  function letsstartTrashing() {
    $("button").on("click", function(event) {
      event.preventDefault();
      var yoMAMASO = $("#joke").val();
      console.log(yoMAMASO);
      trashDatabase.push(yoMAMASO);
    });
  }

  trashDatabase.on("child_added", function(childSnapshot) {
    var newEntry = childSnapshot.val();
    console.log(newEntry);
    $("#trashTalk").after(newEntry);
  });

  // function playerFound() {
  //   $(".player2").attr("border", "2p solid blue");
  // }
  function startThisBadBoy() {
    database.ref().on("value", function(snapshot) {
      if (snapshot.child("pick").exists() && snapshot.child("pick").exists()) {
        console.log(pick);
        letsstartTrashing();
        playerFound();
      } else {
        firstpick();
      }
    });
  }

  // login();
  // startThisBadBoy();
});
