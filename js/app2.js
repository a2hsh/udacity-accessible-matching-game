$(document).ready(function() {
  /*initializing Modals*/
  $('.modal').modal();

  /* Create initial game variables and the necessary DOM elements */
  let audio = document.createElement('audio');
  let cardClassesList = [
    'fa-diamond',
    'fa-diamond',
    'fa-paper-plane-o',
    'fa-paper-plane-o',
    'fa-anchor',
    'fa-anchor',
    'fa-bolt',
    'fa-bolt',
    'fa-cube',
    'fa-cube',
    'fa-bomb',
    'fa-bomb',
    'fa-bicycle',
    'fa-bicycle',
    'fa-leaf',
    'fa-leaf'
  ];
  let cardNames = {
    'fa-diamond': 'Diamond',
    'fa-paper-plane-o': 'Paper Plane',
    'fa-anchor': 'Anchor',
    'fa-bolt': 'Bolt',
    'fa-cube': 'Cube',
    'fa-bomb': 'Bomb',
    'fa-bicycle': 'Bicycle',
    'fa-leaf': 'Leaf'
  };
  let modal = document.getElementById('modal');
  let modalInstance = M.Modal.getInstance(modal);
  let deck = document.getElementById('deck');
  let watch = new StopWatch();
  let gradeSpan = document.getElementById('grade');
  let starsList = document.getElementById('stars-list');
  let resetBtn = document.getElementById('reset-btn');
  let infoBtn = document.getElementById('info-btn');
  let msgText = document.getElementById('msg-text');
  let movesText = document.getElementById('moves-text');
  let timeText = document.getElementById('time-text');
  let time_results = document.getElementById('time_results');
  let moves_results = document.getElementById('moves_results');
  let grade_results = document.getElementById('grade_results');
  let msg_results = document.getElementById('msg_results');
  msg_results.innerText = 'You are, the coolest, player, ever! That\'s impressive! Keep up the good work, You\'re a champion 💪';
  let modal_reset_btn = document.getElementById('modal_reset_btn');

  let moves = 0;
  let grade = 'Great!';
  let GameStart = false;
  let GameOver = false;

  let matches = [];
  let lastFlipped = null;
  let pause = false;

  gradeSpan.innerText = grade;
  movesText.innerText = moves;
  timeText.innerText = watch.getTime();

  // Shuffling function from http://stackoverflow.com/a/2450976
  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  // Creating the cards, and giving data-card and aria attributes to them
  function createCard(card_class) {
    let li = document.createElement('li');
    li.classList.add('card');
    li.classList.add('card-' + card_class);
    li.setAttribute('data-card', card_class);
    let i = document.createElement('i');
    i.classList.add('card-icon', 'fa', card_class);
    i.setAttribute('data-card', card_class);
    i.setAttribute('aria-label', 'Hidden Card');
    i.setAttribute('role', 'button');
    i.tabIndex = 0;
    li.appendChild(i);
    return li;
  }

  // Adding events for clicks and enter key presses on reset and info buttons.
  resetBtn.addEventListener('keyup', keyboardAccess);
  resetBtn.addEventListener('click', resetGame);
  modal_reset_btn.addEventListener('keyup', keyboardAccess);
  modal_reset_btn.addEventListener('click', resetGame);
  infoBtn.addEventListener('keyup', keyboardAccess);
  infoBtn.addEventListener('click', info);

  // updating the grade and the results message with every move
  function updateGrade() {
    if (moves > 12 && moves < 25) {
      if (grade !== 'Average') {
        grade = 'Average';
        gradeSpan.innerText = grade;
        msg_results.innerText = 'That\'s not so bad, I\'m sure you\'ll be better next time';
        starsList.removeChild(starsList.children[0]);
      }
    }
    if (moves > 24) {
      if (grade !== 'Poor...') {
        grade = 'Poor...';
        gradeSpan.innerText = grade;
        msg_results.innerText = 'Well, um, Come on! You gotta try harder to win this thing. You\'ll do it, I\'m sure of it.';
        starsList.removeChild(starsList.children[0]);
      }
    }
  }

  function clearDeck() {
    document.querySelectorAll('.card').forEach(function(card) {
      card.removeEventListener('keyup', keyboardAccess);
      card.removeEventListener('click', cardClick);
    });
    deck.innerHTML = '';
  }

  function generateCards() {
    let card_classes = shuffle(cardClassesList);
    for (let index = 0; index < 16; index++) {
      let card_class = card_classes[index];
      let new_elm = createCard(card_class);
      deck.appendChild(new_elm);
    }
  }

  function activateCards() {
    document.querySelectorAll('.card').forEach(function(card) {
      card.addEventListener('keyup', keyboardAccess);
      card.addEventListener('click', cardClick);

      function cardClick() {
        if (GameStart === false) {
          // set timer on first click
          GameStart = true;
          watch.start(function() {
            timeText.innerText = watch.getTime();
          });
        }
        if (card === lastFlipped || matches.includes(card) || pause || GameOver) {
          // prevents comparing cards to themselves or playing when game is over
          return;
        }

        card.classList.add('open', 'show');
        card.childNodes[0].setAttribute('aria-label', cardNames[card.childNodes[0].getAttribute('data-card')] + ', revealed');

        if (lastFlipped) { // a previous card was clicked; compare last clicked to this click
          let thisCard = card.childNodes[0].getAttribute('data-card');
          let lastCard = lastFlipped.childNodes[0].getAttribute('data-card');
          moves++;
          movesText.innerText = moves;
          updateGrade();

          if (thisCard === lastCard) {
            let message = 'match found!';
            audio.src = 'audio/match.ogg';
            audio.play();
            console.log(message);
            flash_msg(message);
            card.classList.add('match');
            card.childNodes[0].setAttribute('aria-label', cardNames[card.childNodes[0].getAttribute('data-card')] + ', matched');
            lastFlipped.classList.add('match');
            lastFlipped.childNodes[0].setAttribute('aria-label', cardNames[lastFlipped.childNodes[0].getAttribute('data-card')] + ', matched');
            matches.push(card);
            matches.push(lastFlipped);
            lastFlipped = null;
            if (matches.length === 16) {
              gameOver();
              return;
            }
          } else {
            let message = 'no match.';
            audio.src = 'audio/nomatch.ogg';
            audio.play();
            console.log(message);
            flash_msg(message);
            pause = true;
            setTimeout(function() {
              card.classList.remove('open', 'show');
              card.childNodes[0].setAttribute('aria-label', 'Hidden Card');
              lastFlipped.classList.remove('open', 'show');
              lastFlipped.childNodes[0].setAttribute('aria-label', 'Hidden Card');
              lastFlipped = null;
              pause = false;
            }, 1800);
          }
        } else {
          // first click, so save it as a reference
          lastFlipped = card;
          audio.src = 'audio/flip1.ogg';
          audio.play();
        }
      }
    });
  }

  function info() {
    alert('Grading System: \n\n\
    0-12 Moves = Great! \n\
    13-24 Moves = Average \n\
    25+ Moves = Poor...  \
    ');
  }

  function start() {
    generateCards();
    flashCards();
    activateCards();
    console.log('game started.');
  }

  /* sets the info in the modal */
  function gameOver() {
    GameOver = true;
    watch.stop();

    grade_results.innerText = grade;
    moves_results.innerText = moves;
    time_results.innerText = watch.getTime();

    modalInstance.open();
  }

  /* Resets the game */
  function resetGame(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // clears board then regenerate cards
    clearDeck();
    generateCards();
    flashCards();
    activateCards();
    watch.reset();

    // reset game state
    moves = 0;
    grade = 'Great!';
    GameOver = false;
    matches = [];
    lastFlipped = null;
    pause = false;
    GameStart = false;

    // reset DOM state
    starsList.innerHTML = '';
    starsList.innerHTML += '<li><i class="fa fa-star" aria-label="⭐"></i></li>';
    starsList.innerHTML += '<li><i class="fa fa-star" aria-label="⭐"></i></li>';
    starsList.innerHTML += '<li><i class="fa fa-star" aria-label="⭐"></i></li>';
    gradeSpan.innerText = grade;
    movesText.innerText = moves;
    timeText.innerText = watch.getTime();

    flash_msg('Game Restarted!');
    audio.src = 'audio/shuffle.ogg';
    audio.play();
    console.log('game restarted.');
  }

  function flash_msg(message) {
    msgText.innerText = message;
    msgText.setAttribute('aria-live', 'assertive');
    setTimeout(function() {
      msgText.innerText = '';
    }, 1725);
  }

  /* add the show/open classes then removes them after timeout */
  function flashCards() {
    pause = true;
    document.querySelectorAll('.card').forEach(function(card) {
      card.classList.add('open', 'show');
      card.childNodes[0].setAttribute('aria-label', cardNames[card.childNodes[0].getAttribute('data-card')] + ', temporarily revealed');
    });
    setTimeout(function() {
      document.querySelectorAll('.card').forEach(function(card) {
        card.classList.remove('open', 'show');
        card.childNodes[0].setAttribute('aria-label', 'Hidden Card');
        pause = false;
      });
    }, 3000);
  }

  function keyboardAccess(e) {
    if (e.keyCode === 13) {
      e.target.click();
    }
  }
  start();
});