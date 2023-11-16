

class Piece {
    constructor(colour, type) {
        this.colour = colour;
        this.type = type;
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const chessboardContainer = document.getElementById('chessboard-container');
    const chessboardArray = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ];

    const charToPNG = {'p':'bP', 'r':'bR', 'n':'bN', 'b':'bB', 'q':'bQ', 'k':'bK',
                       'P':'wP', 'R':'wR', 'N':'wN', 'B':'wB', 'Q':'wQ', 'K':'wK'};

    const charToUnicode = {'p':'♟︎', 'r':'♜', 'n':'♞', 'b':'♝', 'q':'♛', 'k':'♚',
                           'P':'♙', 'R':'♖', 'N':'♘', 'B':'♗', 'Q':'♕', 'K':'♔'};
    

    function createChessboard() {
        const squareColour = ['white', 'black'];
        let colourIndex = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add(squareColour[(colourIndex++)%2]);
                let piece = chessboardArray[i][j]; 
                if (piece in charToPNG) {
                    const img = document.createElement('img');
                    img.classList.add('piece');
                    img.src = '../images/pieces/' + charToPNG[piece] + '.png';
                    img.alt = charToUnicode[piece];
                    square.appendChild(img);
                }
                chessboardContainer.appendChild(square);
            }
            colourIndex++;
        }
    }

    createChessboard();
});
