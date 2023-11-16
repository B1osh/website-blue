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

    const squareColour = ['white', 'black']

    function createChessboard() {
        let colourIndex = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add(squareColour[(colourIndex++)%2]);
                square.textContent = chessboardArray[i][j];
                chessboardContainer.appendChild(square);
            }
            colourIndex++;
        }
    }

    createChessboard();
});
