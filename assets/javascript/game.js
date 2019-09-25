$(document).ready(function() {
  var firebaseConfig = {
    apiKey: "AIzaSyAa7lMljbrokwSwsctL_l9FcdyIvS6KuQ8",
    authDomain: "armon-rps.firebaseapp.com",
    databaseURL: "https://armon-rps.firebaseio.com",
    projectId: "armon-rps",
    storageBucket: "",
    messagingSenderId: "516504842409",
    appId: "1:516504842409:web:b4290bdceddf00b53b79b8"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();
  var trash = "";
  database.ref().set({
    pick: trash,
    trashtalk: trash
  });
function firstpick () {
$(".deck").on("click", function() {
    var value = this.id;
    console.log(value);
    database.ref().set({
      pick: value,
    
    });
  });
}
  
function letsstartTrashing () {
   $("button").on("click", function(event) {
    event.preventDefault();
    yoMAMASO = $("#joke").val();
    database.ref().push({
      trashtalk: yoMAMASO
    });
  });
}
 
  function twoPLAYERS() {
    database.ref().on("child_added", function(childSnapshot) {
      newEntry = childSnapshot.val().trashtalk;
      console.log(newEntry);
      $("#trashTalk").after(newEntry);
    });
  }
  function startThisBadBoy() {
    database.ref().on("value", function(snapshot) {
      if (snapshot.child("pick").exists() && snapshot.child("pick").exists()) {
        console.log(pick);
        letsstartTrashing()
      } else {
        firstpick()
      }
    });
  }
  startThisBadBoy()
});
