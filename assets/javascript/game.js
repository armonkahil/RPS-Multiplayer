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
  // initial key pushed to database
  // var newKey = {
  //   pick: 'not yet',
  //   picked: false,
  //   // the original design of the this app had dynamic identity protocols. When players logged in, the protocols adjusted player 1 and 2 accordingly. By adding a name to the key, the app no longer has to change identities. It can just check the name of the pick.
  //   name: playerName,
  //   wins: p1Wins,
  //   losses: p1Losses,
  //   dateAdded: firebase.database.ServerValue.TIMESTAMP
  // }
  // push key to database
  // gameDatabase.push(newKey)
  // database listener for other player 2 pick and name
  gameDatabase.on('value', function (snap) {
    // if object exists
    if (snap.exists()) {
      // set name of key to someDude variable
      var someone = snap.val().name
      var getThepick = snap.val().picked
      console.log('adfadfsadfsadfsadfasdfafdsfd', typeof (snap.val().picked))
      console.log('adfafadfad', JSON.parse(getThepick))
      // if name equal the name of player 1
      if (someone != playerName) {
        // post name to player 2 board with stats
        otherBoard(snap)
        localBoard()
        if (getThepick == 'true') {
          player2pick = snap.val().pick
          console.log('player 2 pick made', pick2)
          pick2 = true
        }
        // if player 1 and object name are the name, update player 1 with name and stats
      } else if (someone == playerName) {
        myBoard(snap)
        if (getThepick == 'true') {
          player1pick = snap.val().pick
          pick1 = true
          console.log('player 1 pick made', pick1)
        }
      }
      if (pick1 && pick2) {
        gameMechanics(player1pick, player2pick)
      }
    }
  })
  // chat display function
  function updateChat (snap) {
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
    console.log('player 2 info', info)
    var theOtherguy = info.val().name
    var theOtherguypick = info.val().pick
    pickmade = info.val().picked
    console.log('other player name: ', theOtherguy)
    console.log('other pick made: ', pickmade)
    $('#p2Pick').text('Pick: ' + theOtherguypick)
    $('#NOOBMASTER69').text(theOtherguy)
    $('#p2wins').text('Wins: ', info.val().wins)
    $('#p2Losses').text('Losses: ', info.val().losses)
    $('.ties').text('Ties: ', info.val().ties)
  }

  // player 1 board update function
  function myBoard (info) {
    console.log('player 1 info', info)
    var myNameIs = info.val().name
    console.log('my name is: ', myNameIs)
    console.log('i picked: ', pickmade)
    $('#p1Pick').text('Pick: ' + info.val().pick)
    $('#firstPlayername').text(myNameIs)
    $('#p1wins').text('Wins: ', info.val().wins)
    $('#p1Losses').text('Losses: ', info.val().losses)
    $('.ties').text('Ties: ', info.val().ties)
  }

  function localBoard () {
    $('#p1Pick').text('Pick: ' + player1pick)
    $('#firstPlayername').text(playerName)
    $('#p1wins').text('Wins: ', p1Wins)
    $('#p1Losses').text('Losses: ', p1Losses)
    $('.ties').text('Ties: ', ties)
  }

  // animate.css function
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
  // if the connection status changes
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
    playerSetup(present)
  }, function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })
  // player setup
  function playerSetup (present) {
    var newKey = {
      name: playerName,
      pick: 'not yet',
      picked: false,
      wins: p1Wins,
      losses: p1Losses,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
    // update ticker with number of players
    $('#connected-viewers').text('Number of connected players: ' + present)
    // if only on player present or if player 2 leaves
    if (present === 1) {
      // set gameDatabase key
      gameDatabase.set(newKey)
      console.log('i am ' + playerName)
      // reset readytoplay to false
      readytoPlay = false
      console.log('not ready to play', readytoPlay)
      // stop second player display from bouncing
      $('#player2').removeClass('bounce')
      // if 2 players are present
    } else if (present === 2) {
      // push credentials to gameDatabase object
      gameDatabase.push(newKey)
      console.log('I am ' + playerName)
      // animate second player display
      animateCSS('#player2', 'bounce')
      // ready to play
      readytoPlay = true
      console.log('ready to play', readytoPlay)
      // start chat function
      letsstartTrashing()
      // start pick function
      pick()
    }
  }

  // revised player pick function
  function pick () {
    console.log('running pick function')
    // if two players are present and a pick hasnt already been made by player 1
    if (readytoPlay && !pickmade) {
      // event listener for choices
      $('.weapons').on('click', function () {
        // once pick is made
        // store pick in variable
        var RPS = this.id
        // set pickmade
        pickmade = true
        // build pick key
        var pickKey = {
          pick: RPS,
          picked: 'true',
          name: playerName,
          wins: p1Wins,
          losses: p1Losses,
          dateAdded: firebase.database.ServerValue.TIMESTAMP
        }
        console.log('pick pushed', pickKey)
        // push key to database
        gameDatabase.push(pickKey)
      })
    }
  }
  function playerOneWins () {
    console.log('pick 1 won')
    p1Wins++
    var newKey = {
      pick: 'not yet',
      picked: false,
      name: playerName,
      wins: p1Wins,
      losses: p1Losses,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
    gameDatabase.push(newKey)
    // $('#p1Wins').text('Wins: ' + p1Wins)
    // $('#p2Losses').text('Lost: ' + p2Losses)
  }

  function playerTwoWins () {
    console.log('player 2 won')
    p1Losses++
    var newKey = {
      pick: 'not yet',
      picked: false,
      name: playerName,
      wins: p1Wins,
      losses: p1Losses,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
    gameDatabase.push(newKey)
    // $('#p2Wins').text('Wins: ' + p2Wins)
    // $('#p1Losses').text('Lost: ' + p1Losses)
  }

  function tiesSuck () {
    ties++
    $('.ties').text('Ties: ' + ties)
  }
  // function to decide the winner
  function gameMechanics (pickOne, pickTwo) {
    console.log('running gameMechanics')
    console.log('pick 1 is', pickOne, ' and pick 2 is', pickTwo, '.')
    // reset pickmade
    pickmade = false
    if ((pickOne === 'rock') || (pickOne === 'paper') || (pickOne === 'scissors')) {
      if ((pickOne === 'rock' && pickTwo === 'scissors') || (pickOne === 'scissors' && pickTwo === 'paper') || (pickOne === 'paper' && pickTwo === 'rock')) {
        playerOneWins(p1Wins, p2Losses)
      } else if (pickOne === pickTwo) {
        console.log('tie')
        tiesSuck(ties)
      } else {
        playerTwoWins(p2Wins, p1Losses)
      }
    }
  }
  // =============================================================================
  // Chat function
  // =============================================================================
  function letsstartTrashing () {
    $('.btn').on('click', function (event) {
      event.preventDefault()
      var comment = $('#snap').val()
      var whoSaidit = $('#playerName').val()
      console.log('name', whoSaidit)
      console.log('comment', comment)
      var time = new Date()
      var now = time.toLocaleTimeString()
      trashDatabase.push({ 
        Name: playerName,
        Trash: comment,
        Date: now
      })
    }
    )
  }
})
