// building board
const root = document.getElementById('root');
(function buildBoard() {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let square;
        if (i % 2 === 0 && j % 2 !== 0) {
          square = document.createElement('button');
          square.value = count;
          count++;
        } else if (i % 2 !== 0 && j % 2 === 0) {
          square = document.createElement('button');
          square.value = count;
          count++;
        } else {
          square = document.createElement('div');
        }
        root.appendChild(square);
      }
    }
})();

// black goes first
let isBlackTurn = true;

// display turn function
function displayTurn() {
   let color = isBlackTurn ? "Black" : "Red";
   let turn = document.getElementById('turn');
   turn.innerHTML = "Turn: " + color;
   turn.style.color = color;
};
displayTurn();

function displayWin(color) {
  let winScreen = document.getElementById('winScreen');
  let winner = document.createElement('span');
  let wins = document.createElement('span');
  wins.innerHTML = ' wins!';
  winner.innerHTML = color;
  if (color === 'Red')
    winScreen.style.color = 'red';
  let winFrames = [
    { transform: 'scale(.48) rotate(-8deg)' },
    { transform: 'scale(.56) rotate(-4deg)' },
    { transform: 'scale(.64) rotate(-2deg)' },
    { transform: 'scale(.72) rotate(0deg)' },
    { transform: 'scale(.80) rotate(2deg)' },
    { transform: 'scale(.88) rotate(4deg)' },
    { transform: 'scale(.96) rotate(6deg)' },
    { transform: 'scale(1.04) rotate(8deg)' }
  ];
  let animation = winner.animate(winFrames, {
    duration: 700,
    direction: 'alternate',
    iterations: Infinity
  });
  root.classList.add('hidden');
  winScreen.classList.remove('hidden');
  winScreen.appendChild(winner);
  winScreen.appendChild(wins);
  animation.play();
}

// display captured pieces
let capturedWhite = 0;
let capturedBlack = 0;
function displayCaptured() {
  let whitePiece = document.querySelector("#captured > span.whiteDraught");
  let blackPiece = document.querySelector("#captured > span.blackDraught");
  whitePiece.innerHTML = capturedWhite;
  blackPiece.innerHTML = capturedBlack;
}

// board = all playable squares
const board = document.querySelectorAll('button');

// visually populating pieces on the board
(function populateBoard() {
  for (let i = 0; i < board.length; i++) {
    if (i < 12) {
      let piece = document.createElement('span');
      piece.classList.add('whiteDraught');
      board[i].appendChild(piece);
    }
    else if (i > 19) {
      let piece = document.createElement('span');
      piece.classList.add('blackDraught');
      board[i].appendChild(piece);
    }
  }
})();

// helper functions
function findRow(position) {
  position++;
  if (position % 4 === 0) {
    return (position / 4) - 1;
  }
  else {
    return findRow(position);
  }
};
function findCol(position) {
  let row = findRow(position);
  let result = position % 4;
  result *= 2;
  return (row % 2) ? result : result + 1;
};

// should change that it always looks through all pieces, no need for param
function findPiece(position) {
   for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].position == position)
      return pieces[i];
   }
}

// piece prototype
function Piece(isBlack, i) {
  this.isBlack = isBlack;
  this.position = i;
  this.isKing = false;
  this.openMoves = [];
  this.jumpees = [];
}
Piece.prototype.displayMe = function() {
  let piece = document.createElement('span');
   if (this.isBlack) {
     piece.classList.add('blackDraught');
   } else {
     piece.classList.add('whiteDraught');
   }
   if (this.isKing) {
     piece.innerHTML = 'K';
   }
   board[this.position].appendChild(piece);
}
Piece.prototype.startMove = function() {
   // this.value == button that was pressed
   let piece = findPiece(this.value);
   // reset
   board.forEach(elem => {
      elem.classList.remove('selected');
      elem.classList.remove('openMoves');
      elem.removeEventListener('click', piece.finishMove);
   });
   // selecting the square that was clicked
   board[this.value].classList.add('selected');
   let openMoves = piece.openMoves;
   openMoves.forEach(position => {
      board[position].classList.add('openMoves');
      board[position].addEventListener('click', piece.finishMove);
   });
};
Piece.prototype.finishMove = function() {
   let oldSpace = document.querySelector('.selected');
   let oldPosition = Number(oldSpace.value);
   let newPosition = Number(this.value);
   let piece = findPiece(oldPosition);
   let myPieces = isBlackTurn ? blackPieces : whitePieces;
   // checking to see if move should resulting in a king-ing
   if (!piece.isKing && isBlackTurn && findRow(newPosition) === 0) {
      piece.isKing = true;
   } else if (!piece.isKing && !isBlackTurn && findRow(newPosition) === 7) {
      piece.isKing = true;
   }
   // animation
   let span = oldSpace.firstChild;
   let x = oldSpace.clientHeight;
   let y = oldSpace.clientHeight;
   if (oldPosition > newPosition) {
     y = y * -1;
   }
   if (findCol(newPosition) < findCol(oldPosition)) {
     x = x * -1;
   }
   let movement = [
     { transform: 'translate(0px, 0px)' },
     { transform: 'translate(' + x + 'px,' + y + 'px)' }
   ];
   let animation = span.animate(movement, {
     duration: 200,
   });
   // remove stuff during animation
   myPieces.forEach((piece, i) => {
      piece.openMoves = [];
      piece.jumpees = [];
   });
   board.forEach(elem => {
      elem.classList.remove('selected');
      elem.classList.remove('openMoves');
      elem.removeEventListener('click', piece.startMove);
      elem.removeEventListener('click', piece.finishMove);
   });
   animation.onfinish = passTurn;
   function passTurn() {
      oldSpace.innerHTML = '';
      piece.position = newPosition;
      piece.displayMe();
      isBlackTurn = !isBlackTurn
      displayTurn();
      turn();
   };
};
Piece.prototype.startJump = function() {
   let oldPosition = Number(this.value);
   let piece = findPiece(this.value);
   let openMoves = piece.openMoves;
   board.forEach(elem => {
      elem.classList.remove('selected');
      elem.classList.remove('openMoves');
      elem.removeEventListener('click', piece.finishJump);
   });
   board[oldPosition].classList.add('selected');
   openMoves.forEach(x => {
      board[x].classList.add('openMoves');
      board[x].addEventListener('click', piece.finishJump);
   });
};
Piece.prototype.finishJump = function() {
   let oldSpace = document.querySelector('.selected');
   let oldPosition = Number(oldSpace.value);
   let newPosition = Number(this.value);
   let piece = findPiece(oldPosition);
   let myPieces = isBlackTurn ? blackPieces : whitePieces;
   let openMoves = piece.openMoves;
   let jumpees = piece.jumpees;
   let jumpee;
   // locating jumpee
   openMoves.forEach((x, i) => {
      if (x == newPosition) {
         jumpee = jumpees[i];
      }
   });
   // deleting jumpee from pieces and enemy pieces array
   let jumpeePiece = findPiece(jumpee);
   let index1 = pieces.indexOf(jumpeePiece);
   let enemyArray = isBlackTurn ? whitePieces : blackPieces;
   let index2 = enemyArray.indexOf(jumpeePiece);
   if (index1 !== -1) {
      pieces.splice(index1, 1);
   }
   if (index2 !== -1) {
      enemyArray.splice(index2, 1);
   }
   if (isBlackTurn) {
     capturedWhite++;
   } else {
     capturedBlack++;
   }
   displayCaptured();
   // animation
   let span = oldSpace.firstChild;
   let x = oldSpace.clientHeight * 2;
   let y = oldSpace.clientHeight * 2;
   if (oldPosition > newPosition) {
     y = y * -1;
   }
   if (findCol(newPosition) < findCol(oldPosition)) {
     x = x * -1;
   }
   let movement = [
     { transform: 'translate(0px, 0px)' },
     { transform: 'translate(' + x + 'px,' + y + 'px)' }
   ];
   let animation = span.animate(movement, {
     duration: 200,
   });
   piece.jumpees = [];
   myPieces.forEach(piece => {
      piece.openMoves = [];
      piece.jumpees = [];
   });
   board.forEach(elem => {
      elem.classList.remove('selected');
      elem.classList.remove('openMoves');
      elem.removeEventListener('click', piece.startJump);
      elem.removeEventListener('click', piece.startMove);
      elem.removeEventListener('click', piece.finishJump);
   });
   board[jumpee].innerHTML = '';
   // pass turn function
   function passTurn() {
      isBlackTurn = !isBlackTurn;
      displayTurn();
      turn();
   };
   animation.onfinish = function() {
     oldSpace.innerHTML = '';
     piece.position = newPosition;
     // king me check
     if (!piece.isKing && isBlackTurn && findRow(newPosition) === 0) {
        piece.isKing = true;
        piece.displayMe();
        passTurn();
     } else if (!piece.isKing && !isBlackTurn && findRow(newPosition) === 7) {
        piece.isKing = true;
        piece.displayMe();
        passTurn();
     } else {
        piece.displayMe();
        // this is because findMoves only accepts arrays
        // i could probably get it to accept either
        // because this is sloppy
        let positionArray = [newPosition];
        // checking for double / triple / etc jumps
        findMoves(positionArray);
        if (piece.jumpees.length > 0) {
           board.forEach(elem => {
              elem.classList.remove('selected');
              elem.classList.remove('openMoves');
              elem.removeEventListener('click', piece.startJump);
              elem.removeEventListener('click', piece.finishJump);
           });
           let openMoves = piece.openMoves;
           board[newPosition].classList.add('selected');
           openMoves.forEach((x, i) => {
              board[x].classList.add('openMoves');
              board[x].addEventListener('click', piece.finishJump);
           });
        } else {
          passTurn();
        }
     }
   };

};

// making pieces
var whitePieces = [];
var blackPieces = [];
for (let i = 0; i < 12; i++) {
  let temp = new Piece(false, i);
  whitePieces.push(temp);
}
for (let i = 20; i < 32; i++) {
  let temp = new Piece(true, i);
  blackPieces.push(temp);
}
const pieces = blackPieces.concat(whitePieces);


function findMoves(positions) {
   let jumpBool = false;
   let allNormalMovePositions = [];
   positions.forEach(position => {
      let emptyMoves = [];
      let jumpMoves = [];
      let jumpees = [];

      let piece = findPiece(position);
   //   let enemyColor = isBlackTurn ? white : black;
   //   let enemyKing = isBlackTurn ? whiteKing : blackKing;
      let myCol = findCol(position);
      let myRow = findRow(position);
      let isEvenRow = (myRow % 2 === 0) ? true : false;
      if (isBlackTurn || piece.isKing) {
         if (myCol != 7 && myRow != 0) {
            let NE = isEvenRow ? position - 3 : position - 4;
            let enemyPiece = findPiece(NE);
            if (!board[NE].innerHTML) {
               emptyMoves.push(NE);
            } else if (enemyPiece &&
                     piece.isBlack !== enemyPiece.isBlack &&
                     myCol != 6 &&
                     findRow(position - 7) >= 0 &&
                     findCol(position - 7) < 8 &&
                     !board[position - 7].innerHTML) {
                  jumpMoves.push(position - 7);
                  jumpees.push(NE);
                  jumpBool = true;
            }
         }
         if (myCol != 0 && myRow !=0) {
            let NW = isEvenRow ? position - 4 : position - 5;
            let enemyPiece = findPiece(NW);
            // not sure about the or half of this. i'll have to reassess
            if (!board[NW].innerHTML || !board[NW]) {
               emptyMoves.push(NW);
            } else if (enemyPiece &&
              piece.isBlack !== enemyPiece.isBlack &&
              myCol != 1 &&
              findRow(position - 9) >= 0 &&
              findCol(position - 9) >= 0 &&
              !board[position - 9].innerHTML) {
                  jumpMoves.push(position - 9);
                  jumpees.push(NW);
                  jumpBool = true;
               }
            }
         }
      if (!isBlackTurn || piece.isKing) {
         if (myCol != 7 && myRow != 7) {
            let SE = isEvenRow ? position + 5 : position + 4;
            let enemyPiece = findPiece(SE);
            if (!board[SE].innerHTML) {
               emptyMoves.push(SE);
            } else if (enemyPiece &&
              piece.isBlack !== enemyPiece.isBlack &&
                     myCol != 6 &&
                     // not sure about this line of logic
                     findCol(position + 9) < 8 &&
                     findRow(position + 9) < 8 &&
                     !board[position + 9].innerHTML) {
               jumpMoves.push(position + 9);
               jumpees.push(SE);
               jumpBool = true;
            }
         }
         if (myCol != 0 && myRow !=7) {
            let SW = isEvenRow ? position + 4 : position + 3;
            let enemyPiece = findPiece(SW);
            if (!board[SW].innerHTML) {
               emptyMoves.push(SW);
            } else if (enemyPiece &&
              piece.isBlack !== enemyPiece.isBlack &&
                     myCol != 1 &&
                     findRow(position + 7) < 8 &&
                     findCol(position + 7) >= 0 &&
                     !board[position + 7].innerHTML) {
               jumpMoves.push(position + 7);
               jumpees.push(SW);
               jumpBool = true;
            }
         }
      }
      if (jumpMoves.length !== 0) {
         piece.openMoves = jumpMoves;
         piece.jumpees = jumpees;
         board[position].addEventListener('click', piece.startJump);
         return true;
      } else if (emptyMoves.length !== 0) {
         piece.openMoves = emptyMoves;
         allNormalMovePositions.push(position);
         board[position].addEventListener('click', piece.startMove);
      }
   });
   if (jumpBool) {
      positions.forEach((elem, i) => board[elem].removeEventListener('click', pieces[i].startMove));
   }
};

function turn() {
   if (blackPieces.length === 0) {
      displayWin('Red');
   } else if (whitePieces.length === 0) {
      displayWin('Black');
   } else {
      let blackPosition = blackPieces.map(elem => elem.position);
      let whitePosition = whitePieces.map(elem => elem.position);
      let myPosition = isBlackTurn ? blackPosition : whitePosition;
      findMoves(myPosition);
   }
};
function newGame() {
  location.reload();
}
const newGameButton = document.getElementById('newGame');
newGameButton.addEventListener('click', newGame);
turn();
