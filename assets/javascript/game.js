/* eslint-env jquery */
$(document).ready(function () {
  // ===========================================================================
  // Global Variables
  // ===========================================================================
  var p1Wins = 0
  var p1Losses = 0
  var p2Wins = 0
  var p2Losses = 0
  var ties = 0
  var counter = [p1Wins, p1Losses, p2Wins, p2Losses, ties]
  var player = ''
  var readytoPlay = false
  var firstcomment = 0
  var pickmade = false
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
  console.log(database)
  var gameDatabase = firebase
    .database()
    .ref()
    .child('gameObject')
  var pickDatabase = firebase
    .database()
    .ref()
    .child('picked')
  var trashDatabase = firebase
    .database()
    .ref()
    .child('trashtalk')

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
  })

  gameDatabase.on('value', function (snap) {
    console.log('child added', snap.val())
    if (snap.exists()) {
      if (!pickmade) {
        $('#p2Pick').text('Pick: ' + snap.val().pick)
      } else if (pickmade) {
        $('#p1Pick').text('Pick: ' + snap.val().pick)
      }
    }
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
    // ticker for current number of players
    $('#connected-viewers').text('Number of connected players: ' + present)
    //
    if (present === 1) {
      player = 'player1'
      console.log('I am ', player)
      gameDatabase.remove()
      readytoPlay = false
      console.log('not ready to play', readytoPlay)
      $('#player2').removeClass('bounce')
    } else if (present === 2) {
      gameDatabase.remove()
      animateCSS('#player2', 'bounce')
      readytoPlay = true
      console.log('ready to play', readytoPlay)
      letsstartTrashing()
      pick()
    }
  }, function (errorObject) {
    console.log('Errors handled: ' + errorObject.code)
  })

  function resetTrashTalk () {
    trashDatabase.remove()
  }

  // revised player pick function
  function pick () {
    console.log('running pick function')
    if (readytoPlay && !pickmade) {
      $('.weapons').on('click', function () {
        pickmade = true
        var RPS = this.id
        console.log('my pick is ' + RPS)
        $('#p1Pick').text('Pick: ' + RPS)
        gameDatabase.once('value', function (snap) {
          console.log(snap.val())
      
          // if pick has been submitted
          if (snap.exists()) {
            console.log('found other pick', snap.val().pick)
            gameMechanics(RPS, snap.child('pick').val())
          } else {      
            gameDatabase.set({ 
              pick: RPS,
              picked: true
            })
            $('#p1Pick').text('Pick: ' + RPS)
            console.log('pushed pick')
          }
        })
      })
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
    $('#p2Wins').text('Wins: ' + p2Wins)
    $('#p1Losses').text('Lost: ' + p1Losses)
  }

  function tiesSuck () {
    ties++
    $('.ties').text('Ties: ' + ties)
  }

  function gameMechanics (pick1, pick2) {
    console.log('running gameMechanics')
    console.log('pick 1 is', pick1, ' and pick 2 is', pick2, '.')
    pickmade = false
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
    $('.btn').on('click', function (event) {
      event.preventDefault()
      var comment = $('#snap').val()
      var whoSaidit = $('#playerName').val()
      console.log('name', whoSaidit)
      console.log('comment', comment)
      var time = new Date()
      var now = time.toLocaleTimeString()
      trashDatabase.push({ 
        Name: whoSaidit,
        Trash: comment,
        Date: now
      })
    }
    )
  }
})
