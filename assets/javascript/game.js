/* eslint-env jquery */
$(document).ready(function () {
  var wins = 0
  var losses = 0
  var player = ''
  var player1present = false
  var player2present = false

  var firebaseConfig = {
    apiKey: 'AIzaSyAa7lMljbrokwSwsctL_l9FcdyIvS6KuQ8',
    authDomain: 'armon-rps.firebaseapp.com',
    databaseURL: 'https://armon-rps.firebaseio.com',
    projectId: 'armon-rps',
    storageBucket: '',
    messagingSenderId: '516504842409',
    appId: '1:516504842409:web:b4290bdceddf00b53b79b8'
  }

  firebase.initializeApp(firebaseConfig)
  var database = firebase.database()
  console.log(database)
  var gameDatabase = firebase
    .database()
    .ref()
    .child('gameObject')
  var trashDatabase = firebase
    .database()
    .ref()
    .child('trashtalk')
  var onlineDatabase = firebase
    .database()
    .ref()
    .child('presence')
  var firstcomment = 0
  trashDatabase.on('child_added', function (snap) {
    var newEntry = $('<tr>')
    var newTrash = $('<th>')
    var newDate = $('<th>')
    var newName = $('<td>')
    newDate.attr('scope', 'row')
    newDate.text(snap.val().Date)
    newEntry.append(newDate)
    newName.text(snap.val().Name)
    newEntry.append(newName)
    newTrash.text(snap.val().Trash)
    newEntry.append(newTrash)
    $('tbody').prepend(newEntry)
    firstcomment++
    if (firstcomment > 3) {
      $('tr:last').remove()
    }
  },
  function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })

  // gameDatabase.on('value', function (snap) {
  //   console.log('game', snap.val())
  //   if (snap.child('player1pick').exists() && snap.child('player2pick').exists()) {
      
  //   } else {

  //   }
  // },
  // function (errorObject) {
  //   console.log('Errors handled: ' + errorObject.code)
  // })
// if the value of online database changes, run this function
  onlineDatabase.on('value', function (snapshot) {
    if (snapshot.child('player1').exists() && snapshot.child('player2').exists()) {
      onlineDatabase.set({
        player1: true,
        player2: true
      })
      player = 'player2'
      console.log('presence', snapshot.val())
      player1present = true
      player2present = true
      console.log('player 1 is ', player1present)
      console.log('player 2 is ', player2present)
      playerPick()
    } else {
      onlineDatabase.set({
        player1: true,
        player2: false
      })
      player = "player1"
    }
    console.log('I am ', player)
  },
  function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })

  function animateCSS (element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd () {
      node.classList.remove('animated', animationName)
      node.removeEventListener('animationend', handleAnimationEnd)

      if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }

  var connectionsRef = database.ref('/connections')

  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes.
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  var connectedRef = database.ref('.info/connected')

  // When the client's connection state changes...
  connectedRef.on(
    'value',
    function (snap) {
      // If they are connected..
      if (snap.val()) {
        // Add user to the connections list.
        var con = connectionsRef.push(true)
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove()
      }
    },
    function (errorObject) {
      console.log('Errors handled: ' + errorObject.code)
    }
  )

  // When first loaded or when the connections list changes...
  connectionsRef.on('value', function (snap) {
    var present = snap.numChildren()

    $('#connected-viewers').text(present)
    if (present === 1) {
      animateCSS('#player1', 'bounce')
      player = 'player1'
      console.log('I am ', player)
    } else if (present === 2) {
      // animateCSS('#player1', 'bounce')
      animateCSS('#player2', 'bounce')
      console.log('i am ', player)
      resetTrashTalk()
      letsstartTrashing()
      playerPick()
    }
  }, function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })

  function resetTrashTalk () {
    trashDatabase.set({})
  }

  function playerPick () {
    var newPlayer = player +'pick'
    console.log('running first pick')
    if (player1present && player2present) {
      $('.weapons').on('click', function () {
        var RPS = this.id
        gameDatabase.on('value', function (snap) {
          console.log(snap.val())        
          if (snap.child('player1pick').exists() && snap.child('player2pick').exists()) {
          // if there is a pick already stored
            if (newPlayer == 'player1pick') {
              gameMechanics(RPS, snap.val().player2pick)
            } else if (newPlayer == 'player2pick') {
              gameMechanics(snap.val().player1pick, RPS)
            }
          } else {
            // if there is no pick stored
            if (newPlayer === 'player1pick') {
              gameDatabase.set({
                newPlayer: RPS,
                player2pick: 'none'
              })
            } else if (newPlayer === 'player2pick') {
              gameDatabase.set({
                player1pick: 'none',
                newPlayer: RPS
              })
            }
          }
        })
      }
      )
    }
  }

  function letsstartTrashing () {
    $('button').on('click', function (event) {
      event.preventDefault()
      var comment = $('#snap').val()
      var whoSaidit = $('#playerName').val()
      var time = new Date()
      var now = time.toLocaleTimeString()
      console.log('time', now)
      console.log('name', whoSaidit)
      console.log('comment', comment)
      trashDatabase.push({
        Date: now,
        Name: whoSaidit,
        Trash: comment
      })
    }, function (errorObject) {
      console.log('Errors handled: ' + errorObject.code)
    })
  }
})
