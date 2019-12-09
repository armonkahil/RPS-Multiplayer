/* eslint-env jquery */
$(document).ready(function () {
  // ===========================================================================
  // Global Variables
  // ===========================================================================
  // player 1 wins
  var p1Wins = 0
  // player 1 losses
  var p1Losses = 0
  // player 2 wins
  var p2Wins = 0
  // player 2 losses
  var p2Losses = 0
  // ties
  var ties = 0
  // when two players are connected
  var readytoPlay = false
  // variable to keep track of leading comment to that only a limited number of comments are displayed
  var firstcomment = 0
  // variable to state whether a pick has been made by player 1
  var pickmade = false
  var player1pick = ''
  var player2pick = ''
  var pick1 = false
  var pick2 = false
  // =============================================================================
  // Firebase variables
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
  // ===========================================================================
  // ===========================================================================
  // database for picks between players
  // ===========================================================================
  var gameDatabase = firebase
    .database()
    .ref()
    .child('gameObject')
    // =========================================================================
    // database for chat function
    // =========================================================================
  var trashDatabase = firebase
    .database()
    .ref()
    .child('trashtalk')
  trashDatabase.onDisconnect().remove()
  var winnerDatabase = firebase.database().ref().child('Winner')
  winnerDatabase.onDisconnect().remove()
  var loserDatabase = firebase.database().ref().child('Loser')
  loserDatabase.onDisconnect().remove()
  var tieDatabase = firebase.database().ref().child('Tie')
  tieDatabase.onDisconnect().remove()
  var readyDatabase = firebase.database().ref().child('ready')
  readyDatabase.onDisconnect().remove()
  // ==========================================================================
  // connections
  // ========================================================================== 
  var connectionsRef = database.ref('/connections')
  var connectedRef = database.ref('.info/connected')
  // prompt variable to save name
  // this is part of a last minute rewrite to core of this game
  var playerName = prompt('whats your name?')
  // add name to player 1 card
  $('firstPlayername').text(playerName)

  var Key = function (name, pick, picked, wins, losses, line) {
    this.name = name
    this.pick = pick
    this.picked = picked
    this.wins = wins
    this.losses = losses
    this.line = line
    var time = new Date()
    this.now = time.toLocaleTimeString()
  }

  var Commentary = function (name, comment, time) {
    this.Name = name
    this.Trash = comment
    this.Date = time
  }
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
  // ===========================================================================
  // database listener for chat function
  // ===========================================================================
  trashDatabase.on('child_added', function (snap) {
    updateChat(snap)
  })
  function report (term) {
    var marker = '// =================================================='
    var subject = '// ' + term
    console.log(marker)
    console.log(subject)
    console.log(marker)
  }

  function clockRunning () {
    report('clockRunning')
    gameDatabase.on('child_added', function (snap) {
      console.log(snap.val())
      // if object exists
      if (snap.exists()) {
        // set name of key to someDude variable
        var someone = snap.val().name
        // get the pick of the other player
        var getThepick = snap.val().picked
        console.log(getThepick)       
        // if name equal the name of player 1
        if (someone !== playerName)  {
          // post name to player 2 board with stats
          otherBoard(snap)
          localBoard()
          if (getThepick) {
            player2pick = snap.val().pick
            console.log('player 2 pick made', pick2)
            pick2 = true
          }
          // if player 1 and object name are the name, update player 1 with name and stats
        } else if (someone === playerName) {
          myBoard(snap)
          if (getThepick) {
            player1pick = snap.val().pick
            pick1 = true
            console.log('player 1 pick made', pick1)
          }
        }
        if ((pick1 === true) && (pick2 === true)) {
          gameMechanics(player1pick, player2pick, pick1, pick2)
        }
      }
    })
  }
  // chat display function
  function updateChat (snap) {
    report('updateChat')
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
    // once there are a number of set comments on display, the following code will remove the oldest comment
    if (firstcomment > 3) {
      $('tr:last').remove()
    }
  }

  // player 2 board update function
  function otherBoard (info) {
    report('otherBoard')
    console.log('player 2 info', info)
    var theOtherguy = info.val().name
    var theOtherguypick = info.val().pick
    pickmade = info.val().picked
    console.log('other player name: ', theOtherguy)
    console.log('other pick made: ', pickmade)
    $('#p2Pick').text('Pick: ' + theOtherguypick)
    $('#NOOBMASTER69').text(theOtherguy)
  }

  // player 1 board update function
  function myBoard (info) {
    report('myBoard')
    console.log('player 1 info', info.val())
    var myNameIs = info.val().name
    console.log('my name is: ', myNameIs)
    console.log('i picked: ', pickmade)
    $('#p1Pick').text('Pick: ' + info.val().pick)
    $('#firstPlayername').text(myNameIs)
  }

  function localBoard () {
    report('localBoard')
    $('#p1Pick').text('Pick: ' + player1pick)
    $('#firstPlayername').text(playerName)
  }

  // animate.css function
  function animateCSS (element, animationName, callback) {
    report('animateCSS')
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd () {
      node.classList.remove('animated', animationName)
      node.removeEventListener('animationend', handleAnimationEnd)

      if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }
  // if the connection status changes
  connectedRef.on(
    'value',
    function (snap) {
      report('connectedRef')
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
    report('connectionsRef')
    var present = snap.numChildren()
    playerSetup(present)
  }, function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })

  // player setup
  function playerSetup (present) {
    report('playerSetup')
    // update ticker with number of players
    $('#connected-viewers').text('Number of connected players: ' + present)
    // if only on player present or if player 2 leaves
    if (present === 1) {
      var newPlayer = new Key(playerName, 'not yet', false, p1Wins, p1Losses, 'line 255')

      // set gameDatabase key
      gameDatabase.push(newPlayer)
      console.log('i am ' + playerName)
      // reset readytoplay to false
      readytoPlay = false
      readyDatabase.push(false)
      console.log('not ready to play', readytoPlay)
      // stop second player display from bouncing
      $('#gameReady').removeClass('bounce')
      // if 2 players are present
    } else if (present === 2) {
      var newPlayer1 = new Key(playerName, 'not yet', false, p1Wins, p1Losses, 'line 268')
      // push credentials to gameDatabase object
      gameDatabase.push(newPlayer1)
      console.log('I am ' + playerName)
      // animate second player display
      animateCSS('#gameReady', 'bounce')
      // ready to play
      readytoPlay = true
      readyDatabase.push(true)
      console.log('ready to play', readytoPlay)
      // start chat function
      letsstartTrashing()
      // start pick function
      pick()
      clockRunning()
    }
  }

  // revised player pick function
  function pick () {
    report('pick')
    console.log('readytoPlay=', readytoPlay)
    console.log('pickmade=', pickmade)
    // if two players are present and a pick hasn't already been made by player 1
    if (readytoPlay && !pickmade) {
      // event listener for choices
      $('.weapons').on('click', function () {
        // once pick is made
        // store pick in variable
        var RPS = this.id
        // set pickmade
        pickmade = true
        // build pick key
        var pickKey = new Key(playerName, RPS, true, p1Wins, p1Losses, 'line 300')
        console.log('pick pushed', pickKey)
        // push key to database
        gameDatabase.push(pickKey)
        // turn event listener off
        // $('.weapons').off('click')
      })
    }
  }

  function playerOneWins (p1Wins, p2Losses) {
    report('playerOneWins')
    p1Wins++
    p2Losses++
    $('#p1Wins').text('Wins: ' + p1Wins)
    $('#p2Losses').text('Losses: ' + p2Losses)
  }

  function playerTwoWins (p1Losses, p2Wins) {
    p1Losses++
    p2Wins++
    $('#p2Wins').text('Wins: ' + p2Wins)
    $('#p1Losses').text('Losses: ' + p1Losses)
    report('playerTwoWins')
  }

  function tiesSuck () {
    report('Ties')
    ties++
    $('.ties').text('Ties: ' + ties)
    // playerSetup()
  }
  // function to decide the winner
  function gameMechanics (pickOne, pickTwo, pick1, pick2) {
    if (pick1 && pick2) {
      report('gameMechanics')

      console.log('pick 1 is ', pickOne, ' and pick 2 is ', pickTwo, '.')
      // reset pickmade
      pickmade = false
      gameDatabase.remove()
      var winner = whoWon(pickOne, pickTwo)
      switch (winner) {
        case 1:
          playerOneWins(p1Wins, p2Losses)
          break
        case 2:
          playerTwoWins(p2Wins, p1Losses)
          break
        case 3:
          tiesSuck(ties)
          break
      }
      playAgain()
    }
  }

  function whoWon (pickOne, pickTwo) {
    if ((pickOne === 'rock') || (pickOne === 'paper') || (pickOne === 'scissors')) {
      if ((pickOne === 'rock' && pickTwo === 'scissors') || (pickOne === 'scissors' && pickTwo === 'paper') || (pickOne === 'paper' && pickTwo === 'rock')) {
        return 1
      } else if (pickOne === pickTwo) {
        return 3
      } else {
        return 2
      }
    }
  }

  function playAgain () {
    pick1 = false
    pick2 = false
    readytoPlay = true
    pickmade = false
    player1pick = ''
    player2pick = ''
    clockRunning()
    pick()
  }
  // =============================================================================
  // Chat function
  // =============================================================================
  function letsstartTrashing () {
    report('letsstartTrashing')
    $('.btn').on('click', function (event) {
      event.preventDefault()
      var comment = $('#snap').val()
      var whoSaidit = playerName
      console.log('name', whoSaidit)
      console.log('comment', comment)
      var time = new Date()
      var now = time.toLocaleTimeString()
      var snapBack = new Commentary(whoSaidit, comment, now)
      trashDatabase.push(snapBack)
    }
    )
  }
})

