/* eslint-env jquery */
$(document).ready(function () {
  // ===========================================================================
  // Global Variables
  // ===========================================================================
  var p1Wins = 0;
  var p1Losses = 0;
  var p2Wins = 0;
  var p2Losses = 0;
  var ties = 0;
  var counter = [p1Wins, p1Losses, p2Wins, p2Losses, ties]
  var player = ''
  var player1present = false
  var player2present = false
  var firstcomment = 0
  // =============================================================================
  // Firebase
  // =============================================================================
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
  gameDatabase.remove()
  onlineDatabase.remove()
  trashDatabase.remove()
  // ===========================================================================
  // // ========================================================================
  // // =====================================================================
  // // ==================================================================
  // // ===============================================================
  // Game
  // ===============================================================
  // ==================================================================
  // =====================================================================
  // ========================================================================
  // ===========================================================================
  trashDatabase.on('child_added', newComment, errorError)
  
  function newComment (snap) {
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
  }

  function errorError (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  }

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
      player = 'player1'
      player1present = true
      player2present = false
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
      player2present = false
      gameDatabase.remove()
      onlineDatabase.remove()
      $('#player2').removeClass('bounce')
    } else if (present === 2) {
      $('#player1').removeClass('bounce')
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
    trashDatabase.remove()
  }

  function playerPick () {
    var newPlayer = player + 'pick'
    console.log('running first pick')
    if (player1present && player2present) {
      $('.weapons').on('click', function () {
        var RPS = this.id
        console.log('my pick as', newPlayer + ' is ' + RPS)
        gameDatabase.once('value', function (snap) {
          console.log(snap.val())
          // if a pick has been submitted
          if (snap.child('player1pick').exists() && snap.child('player2pick').exists()) {
          // if there is a pick already stored
          // if im player 1 then
            console.log(snap.val().player1pick)
            console.log(snap.val().player2pick)
            if (newPlayer === 'player1pick') {
              // send my pick and player 2 pick to gameMechanics
              gameMechanics(RPS, snap.val().player2pick)
            // if im player 2 then
            } else if (newPlayer === 'player2pick') {
              // send my pick and player 1 pick to gameMechanics
              gameMechanics(snap.val().player1pick, RPS)
            } else {
              console.log('There is something wrong with the players')
            }
          } else {
            // if there is no pick stored
            if (newPlayer === 'player1pick') {
              gameDatabase.child('player1pick').update({ player1pick: RPS })
            } else if (newPlayer === 'player2pick') {
              gameDatabase.child('player2pick').update({ player2pick: RPS })
            }
          }
        })
      }
      )
    }
  }
 
  function playerOneWins () {
    console.log('pick 1 won')
    p1Wins++
    p2Losses++
    $('#p1Wins').text('Wins: ' + p1Wins)
    $('#p2Losses').text('Lost: ' + p2Losses)
  }

  function playerTwoWins () {
    console.log('player 2 won')
    p2Wins++
    p1Losses++
    $('#p2Wins').text('Wins: ', p2Wins)
    $('#p1Losses').text('Lost: ', p1Losses)
  }

  function tiesSuck () {
    ties++
    $('.ties').text('Ties: ', ties)
  }

  function gameMechanics (pick1, pick2) {
    console.log('running gameMechanics')
    console.log('pick 1 is', pick1, ' and pick 2 is', pick2, '.')
    if ((pick1 === 'rock') || (pick1 === 'paper') || (pick1 === 'scissors')) {
      if ((pick1 === 'rock' && pick2 === 'scissors') || (pick1 === 'scissors' && pick2 === 'paper') || (pick1 === 'paper' && pick2 === 'rock')) {
        playerOneWins(p1Wins, p2Losses)
      } else if (pick1 === pick2) {
        console.log('tie')
        tiesSuck(ties)
      } else {
        playerTwoWins(p2Wins, p1Losses)
      }
      console.log(counter)
    }
  }
  // =============================================================================
  // Chat function
  // =============================================================================
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
});
