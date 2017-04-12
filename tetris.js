const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
  let rowCount = 1;
  outer: for( let y = arena.length -1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;

    playSounds();
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

// const matrix = [
//     [0, 0, 0],
//     [1, 1, 1],
//     [0, 1, 0]
// ];

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
        arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ];
  } else if (type == 'O') {
    return [
        [2, 2],
        [2, 2]
    ];
  } else if (type === 'L') {
    return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3]
    ];
  }  else if (type === 'J') {
    return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0]
    ];
  }  else if (type === 'I') {
    return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0]
    ];
  }  else if (type === 'S') {
    return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0]
    ];
  }  else if (type === 'Z') {
    return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ];
  }

}

function draw() {
  context.fillStyle = '#000'; // #000
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x,
                           y + offset.y,
                           1, 1);
        }
      });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}


function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  audio.volume = 0.04;
  audio.play()

  const pieces = 'ILJOTSZ'
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  // floor: | 0
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);

  //clear screen after game is over
  // ----------------------- modal play again?
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    //move piece off the wall by length of piece
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      //if offset is greater than the length then rotate the piece
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

//transpose the matrix
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [
          matrix[x][y],
          matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}
//
var sounds = ["http://peal.io/download/3zt9h",
              "http://peal.io/download/6utip",
              "http://peal.io/download/aof4e",
              "http://peal.io/download/2a98y",
              "http://peal.io/download/yp4lw",
              "http://peal.io/download/9m65z",
              "http://peal.io/download/w9l11",
              "http://peal.io/download/s5no7",
              "http://peal.io/download/406yh",
              "http://peal.io/download/vedk7",
              "http://peal.io/download/h0hox",
              "http://peal.io/download/hrjlu"  ],

oldSounds = [];

function playSounds() {
  var index = Math.floor(Math.random() * (sounds.length)),
  thisSound = sounds[index];

  oldSounds.push(thisSound);
  sounds.splice(index, 1);

  if (sounds.length < 1) {
    sounds = oldSounds.splice(0, oldSounds.length);
  }

  $("#element").html("<audio autoplay><source src=\"" + thisSound + "\" type=\"audio/mpeg\"><embed src=\"" + thisSound + "\" hidden=\"true\" autostart=\"true\" /></audio>");
}

let audio = new Audio('./public/audio/tetris_theme.mp3');

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time;

  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw()
  requestAnimationFrame(update);
}

// function pause() {
//   while (true) {
//     dropCounter = 0;
//     // if (pause()) {
//     //   break;
//     // }
//   }
// }


function updateScore() {
  document.getElementById('score').innerText = player.score;
}

const colors = [
  null,
  'red',
  'blue',
  'violet',
  'green',
  'purple',
  'orange',
  'pink'
];

const arena = createMatrix(12, 20);
// console.log(arena); console.table(arena);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    playerMove(-1);
    // player.pos.x--;
  } else if (event.keyCode === 39) {
    playerMove(1);
    // player.pos.x++;
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  } else if (event.keyCode === 80) {
    pause();
  }

});

// modal

$(document).ready(function () {

    $(".close").click(function () {
        $("#about").fadeIn('slow')
        $("about").fadeIn('slow')
        $("#myModal").fadeOut("slow");
    });

    $("#start").click(function () {
        playerReset();
        updateScore();
        update();
        $("#myModal").fadeOut("slow");
        $("canvas").addClass('canvas')
        $("#score-border").addClass('score-border')
    });

    $(document).keypress(function(e){
      if(e.which == 13) {
        playerReset();
        updateScore();
        update();
        $("#myModal").fadeOut("slow");
        $("canvas").addClass('canvas')
        $("#score-border").addClass('score-border')
      }
    });

});
