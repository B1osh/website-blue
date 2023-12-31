

const PieceType = Object.freeze({
    King: Symbol("king"),
    Queen: Symbol("queen"),
    Rook: Symbol("rook"),
    Knight: Symbol("knight"),
    Bishop: Symbol("bishop"),
    Pawn: Symbol("pawn"),
    Empty: Symbol("empty"),
    BadEgg: Symbol("badegg")
});


const pieceValue = (pieceType) => {
    return pieceType == PieceType.King ? 0 :
    pieceType == PieceType.Queen ? 9 :
    pieceType == PieceType.Rook ? 5 :
    pieceType == PieceType.Knight ? 3 :
    pieceType == PieceType.Bishop ? 3 :
    pieceType == PieceType.Pawn ? 1 :
    -1; 
}

const PieceColour = Object.freeze({
    White: Symbol("white"),
    Black: Symbol("black"),
    Gaia: Symbol("gaia")
});

const oppositeColour = (colour) => {
    if (colour === PieceColour.White) return PieceColour.Black;
    if (colour === PieceColour.Black) return PieceColour.White;
    return PieceColour.Gaia;
};

class Piece {

    constructor(colour, type) {
        if (Object.values(PieceColour).includes(colour) && Object.values(PieceType).includes(type)) {
            this.colour = colour;
            this.type = type;
        } else {
            this.colour = PieceColour.Gaia;
            this.type = PieceType.BadEgg;
        }
    }

    toString() {
        let colour = 
        this.colour === PieceColour.White ? "w" :
        this.colour === PieceColour.Black ? "b" :
        "g";

        let type =
        this.type === PieceType.King ? "K" :
        this.type === PieceType.Queen ? "Q" :
        this.type === PieceType.Rook ? "R" :
        this.type === PieceType.Knight ? "N" :
        this.type === PieceType.Bishop ? "B" :
        this.type === PieceType.Pawn ? "P" :
        "BadEgg";

        return colour.concat(type);

    }

    toUnicode() {
        const unicode = {'bP': '♟︎', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚',
                         'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔'};

        return this.toString() in unicode ? unicode[this.toString()] : '🥚';
    }

}



class GameState {

    constructor() {
        this.readFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        //this.readFEN("8/2P5/4k3/8/8/4K3/2p5/8 w - - 0 1");
        this.activePiece = null;
        this.activeSquare = null;
        this.clickedSquare = null;
    }

    
    readFEN(fen) {
        const fenSplit = fen.split(' ');


        // Pieces

        const charToPiece = {'p':new Piece(PieceColour.Black, PieceType.Pawn), 'r':new Piece(PieceColour.Black, PieceType.Rook), 'n':new Piece(PieceColour.Black, PieceType.Knight), 'b':new Piece(PieceColour.Black, PieceType.Bishop), 'q':new Piece(PieceColour.Black, PieceType.Queen), 'k':new Piece(PieceColour.Black, PieceType.King),
                               'P':new Piece(PieceColour.White, PieceType.Pawn), 'R':new Piece(PieceColour.White, PieceType.Rook), 'N':new Piece(PieceColour.White, PieceType.Knight), 'B':new Piece(PieceColour.White, PieceType.Bishop), 'Q':new Piece(PieceColour.White, PieceType.Queen), 'K':new Piece(PieceColour.White, PieceType.King)};

        let piecePositions = fenSplit[0];
        let charIndex = 0;
        let board = []
        let currentRow = []

        while (charIndex < piecePositions.length) {
            let nextChar = piecePositions[charIndex];

            if (nextChar === '/') {
                board.push(currentRow);
                currentRow = [];
            }
            else if (nextChar >= '1' && nextChar <= '9') {
                let empties = Array.from({length: parseInt(nextChar)}, () => new Piece(PieceColour.Gaia, PieceType.Empty));
                currentRow.push(...empties);
            }
            else if (nextChar in charToPiece) {
                currentRow.push(charToPiece[nextChar]);
            }
            else {
                currentRow.push(new Piece(PieceColour.Gaia, PieceType.BadEgg));
            }
            charIndex++;
        }
        board.push(currentRow);
        this.board = board;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
            }
        }

        // Colour to move

        this.toMove = fenSplit[1] === 'b' ? PieceColour.Black : PieceColour.White;
        
        // Castling availability

        this.castlingAvailability = [];
        let castlingAvailability = fenSplit[2];
        let castlingString = "KQkq";
        for (let i = 0; i < 4; i++) {
            this.castlingAvailability[i] = castlingAvailability.includes(castlingString.charAt(i));
        }

        // En passant
        let enpassantTarget = fenSplit[3];
        this.enpassantTarget = enpassantTarget[0] === '-' ? null : stringToSquare(enpassantTarget);

        // Counters

        this.fiftymoveCounter = parseInt(fenSplit[4]);
        this.moveCounter = parseInt(fenSplit[5]);

    }

    showChessboard(container) {
        container.replaceChildren();
        const squareColour = ['white', 'black'];
        let colourIndex = 0;

        const mouseUpHandler = (i, j) => {
            return () => this.mouseUpFunction([i, j], container);
        };
    
        const mouseDownHandler = (i, j) => {
            return () => this.mouseDownFunction([i, j], container);
        };

        

        document.addEventListener('mousemove', function(event) {const floating = document.getElementById('floater'); if (floating) {floating.style.left = event.clientX + 'px'; floating.style.top = event.clientY + 'px'}});

        let selectedSquare = this.activeSquare || this.clickedSquare;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                
                // Colour square if it has been clicked on
                if (this.clickedSquare != null && this.clickedSquare[1] === i && this.clickedSquare[0] === j) {
                    square.style.backgroundColor = '#7E9E7A';
                    colourIndex++;
                } else {
                    square.classList.add(squareColour[(colourIndex++)%2]);
                }

                // Show legal moves
                if (selectedSquare != null) {
                    let moves = this.getLegalMoves(selectedSquare);
                    for (const move of moves) {
                        if (move[0] === j && move[1] === i) {
                            const circle = document.createElement('div');
                            circle.className = 'circle';
                            square.appendChild(circle);
                            break;
                        }
                    }
                }

                let piece = this.board[i][j]; 
                if (piece.type != PieceType.Empty) {
                    const img = document.createElement('img');
                    img.classList.add('piece');
                    img.src = '../images/pieces/' + piece.toString() + '.png';
                    img.alt = piece.toUnicode();
                    img.draggable = false;
                    square.appendChild(img);
                }
                square.addEventListener('mouseup', mouseUpHandler(j,i, container));
                square.addEventListener('mousedown', mouseDownHandler(j,i, container));
                square.addEventListener("dragstart",(event)=>{event.preventDefault();});
                square.addEventListener('drop', (event) => {event.preventDefault();});
                container.appendChild(square);
            }
            colourIndex++;
        }
    }


    handleMoveInput(textBox, event, container) {
        
        if(event.keyCode != 13) return;
        
        let split = textBox.value.split('=');

        let moves = split[0].split('-');
        textBox.value = "";

        if (moves.length != 2 || moves[0].length != 2 || moves[1].length != 2) {
            window.alert("Invalid move!");
            return;
        }
        
        let start = this.ctoi(moves[0]);
        let finish = this.ctoi(moves[1]);

        // Check for promotion
        let promoteTo = PieceType.Queen;
        if (split.length === 2) {
            promoteTo =
            split[1] === "R" ? PieceType.Rook :
            split[1] === "N" ? PieceType.Knight :
            split[1] === "B" ? PieceType.Bishop :
            PieceType.Queen;
        }

        this.makeMove(start, finish, promoteTo);
        this.showChessboard(container);

    }

    mouseUpFunction(square, container) {
        this.activePiece = null;
        if (this.clickedSquare === null && this.activeSquare != null && square[0] === this.activeSquare[0] && square[1] === this.activeSquare[1] && this.itop(square).colour === this.toMove) {
            this.clickedSquare = square;
        }
        else if (this.clickedSquare != null) {
            this.makeMove(this.clickedSquare, square);
            if (this.itop(square).colour === this.toMove) {
                this.clickedSquare = square;
            } else {
                this.clickedSquare = null;
            }
        }
        else {
            this.makeMove(this.activeSquare, square);
        }
        this.activeSquare = null;
        this.showChessboard(container);

        const floater = document.getElementById('floater');
        if (floater) container.removeChild(floater);
    }

    mouseDownFunction(square, container) {
        let piece = this.itop(square);

        if (piece.colour === this.toMove) {
            this.clickedSquare = null;
            this.showChessboard(container);
        }
        if (piece.colour != PieceColour.Gaia) {
            this.activePiece = piece;
            this.activeSquare = square;

            const floater = document.createElement('img');
            floater.id = 'floater';
            floater.classList.add('piece');
            floater.classList.add('floating');
            floater.src = '../images/pieces/' + piece.toString() + '.png';
            floater.alt = piece.toUnicode();
            floater.draggable = false;
            container.appendChild(floater);
        }

        
    }

    // Coordinates to index : a1 -> [0, 0], e2 -> [4,1], etc.
    ctoi(coordinate) {
        let indeces = [coordinate.charCodeAt(0) - 97, 56 - coordinate.charCodeAt(1)];

        if (indeces[0] < 0 || indeces[0] > 7 || indeces[1] < 0 || indeces[1] > 7) return null;
        return indeces;
    }

    // Indeces to piece
    itop(indeces) {
        return this.board[indeces[1]][indeces[0]];
    }

    isPiecesBetween(start, finish) {
        let xDif = Math.abs(finish[0] - start[0]);
        let yDif = Math.abs(finish[1] - start[1]);
        if (xDif != 0 && yDif != 0 && xDif != yDif) return false;

        
        let xDir = Math.sign(finish[0] - start[0])
        let yDir = Math.sign(finish[1] - start[1])

        let nextSquare = [start[0] + xDir, start[1] + yDir]

        while (nextSquare[0] != finish[0] || nextSquare[1] != finish[1]) {
            if (this.itop(nextSquare).type != PieceType.Empty) return true;
            nextSquare = [nextSquare[0] + xDir, nextSquare[1] + yDir];
        }

        return false;
    }

    getLegalMoves(start) {
        let moves = []
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isLegalMove(start, [i,j])) moves.push([i,j]);
            }
        }

        return moves;
    }

    allPieceLocations(colour) {
        let pieces = []
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.itop([i, j]).colour === colour) pieces.push([i,j]);
            }
        }

        return pieces;
    }

    kingLocation(colour) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let currentPiece = this.itop([i, j]);
                if (currentPiece.type === PieceType.King && currentPiece.colour === colour) return [i, j];
            }
        }
        return null;
    }

    isCheck(colour) {
        let kingLocation = this.kingLocation(colour);
        let enemyPieces = this.allPieceLocations(oppositeColour(colour));

        for (let i = 0; i < enemyPieces.length; i++) {
            if (this.isLegalMove(enemyPieces[i], kingLocation, false)) return true;
        }
        return false;
    }

    checkCheck(start, finish) {
        let check = false;
        let startPiece = this.itop(start);
        let finishPiece = this.itop(finish);

        // Make the move
        this.board[start[1]][start[0]] = new Piece(PieceColour.Gaia, PieceType.Empty);
        this.board[finish[1]][finish[0]] = startPiece;
        // Check for check
        if (this.isCheck(startPiece.colour)) check = true;
        
        // Restore the board
        this.board[finish[1]][finish[0]] = finishPiece;
        this.board[start[1]][start[0]] = startPiece;
        //this.toMove = oppositeColour(this.toMove);

        // Return
        return check;
    }

    isLegalMove(start, finish, checkFlag = true) {
        let startPiece = this.itop(start);
        let finishPiece = this.itop(finish);

        // Check if start square contains a moveable piece of the right colour and if finish square does not contain friendly piece
        // Also fails if start square = finish square
        if ((startPiece.colour != this.toMove && checkFlag) || startPiece.colour === finishPiece.colour) return false;

        let xDif = Math.abs(finish[0] - start[0]);
        let yDif = Math.abs(finish[1] - start[1]);
        if (startPiece.type === PieceType.King) {
            
            // Castling
            // Check piece colour then if it is attempting castling, then check if it is in check or moving through check
                 if (startPiece.colour === PieceColour.White && this.castlingAvailability[0] && finish[0] === 6 && finish[1] === 7) {if (this.isCheck(this.toMove) || this.checkCheck(start, [5,7]) || this.isPiecesBetween(start,finish)) return false;} // White king side
            else if (startPiece.colour === PieceColour.White && this.castlingAvailability[1] && finish[0] === 2 && finish[1] === 7) {if (this.isCheck(this.toMove) || this.checkCheck(start, [3,7]) || this.isPiecesBetween(start,finish)) return false;} // White queen si || this.isPiecesBetween(start,finish)de
            else if (startPiece.colour === PieceColour.Black && this.castlingAvailability[2] && finish[0] === 6 && finish[1] === 0) {if (this.isCheck(this.toMove) || this.checkCheck(start, [5,0]) || this.isPiecesBetween(start,finish)) return false;} // Black king side
            else if (startPiece.colour === PieceColour.Black && this.castlingAvailability[3] && finish[0] === 2 && finish[1] === 0) {if (this.isCheck(this.toMove) || this.checkCheck(start, [3,0]) || this.isPiecesBetween(start,finish)) return false;} // Black queen side
            // Regular King move
            else if (xDif > 1 || yDif > 1) return false;
        }
        else if (startPiece.type === PieceType.Queen) {
            if (xDif != 0 && yDif != 0 && xDif != yDif || this.isPiecesBetween(start, finish)) return false;
        }
        else if (startPiece.type === PieceType.Rook) {
            if (xDif != 0 && yDif != 0 || this.isPiecesBetween(start, finish)) return false;
        }
        else if (startPiece.type === PieceType.Knight) {
            if ((xDif != 1 || yDif != 2) && (xDif != 2 || yDif != 1)) return false;
        }
        else if (startPiece.type === PieceType.Bishop) {
            if (xDif != yDif || this.isPiecesBetween(start, finish)) return false;
        }
        else if (startPiece.type === PieceType.Pawn) {
            let c = startPiece.colour === PieceColour.White ? -1 : 1;

            // Only 1 forward and (0 sideways and empty finish or 1 sideways and (enemy finish or en passant target))
            // 2 forward and 1 square forward empty and 2 squares forward empty and on starting rank
            if ((finish[1] === start[1] + c && (xDif === 0 && finishPiece.type === PieceType.Empty || xDif === 1 && (finishPiece.colour === oppositeColour(startPiece.colour) || this.enpassantTarget && finish[0] === this.enpassantTarget[0] && finish[1] === this.enpassantTarget[1])))
            || (finish[1] === start[1] + 2*c && !this.isPiecesBetween(start, finish) && finishPiece.type === PieceType.Empty && xDif === 0 && start[1] === (7+c) % 7)) {} else {return false;}

        }

        if (!checkFlag) return true;
        
        // Check if in check by making move and running isCheck()
        let legalMove = true;
        this.board[finish[1]][finish[0]] = startPiece;
        this.board[start[1]][start[0]] = new Piece(PieceColour.Gaia, PieceType.Empty);
        this.toMove = oppositeColour(this.toMove);
        if (this.isCheck(oppositeColour(this.toMove))) legalMove = false;
        
        // Return the board back
        this.board[finish[1]][finish[0]] = finishPiece;
        this.board[start[1]][start[0]] = startPiece;
        this.toMove = oppositeColour(this.toMove);
        return legalMove;

    }

    makeMove(start, finish, promoteTo=PieceType.Queen) {

        // Check entered move was valid
        if (start === null || finish === null) {
            //window.alert("Invalid move!");
            return;
        }

        // Check entered move was legal
        if (!this.isLegalMove(start, finish)) {
            //window.alert("Illegal move!");
            return;
        }

        let startPiece = this.itop(start);
        let finishPiece = this.itop(finish);

        // Make the move
        this.board[finish[1]][finish[0]] = this.board[start[1]][start[0]];
        this.board[start[1]][start[0]] = new Piece(PieceColour.Gaia, PieceType.Empty);

        // Check for promotion
        if (startPiece.type === PieceType.Pawn && (finish[1] === 0 || finish[1] === 7)) {
                this.board[finish[1]][finish[0]] = new Piece(this.toMove, promoteTo);
        }

        // Check for castling
        if (startPiece.type === PieceType.King && start[0] == 4) {
            // Move the rook
            if (finish[0] === 6) {
                this.board[finish[1]][5] = new Piece(this.toMove, PieceType.Rook);
                this.board[finish[1]][7] = new Piece(PieceColour.Gaia, PieceType.Empty);
            }
            else if (finish[0] === 2) {
                this.board[finish[1]][3] = new Piece(this.toMove, PieceType.Rook);
                this.board[finish[1]][0] = new Piece(PieceColour.Gaia, PieceType.Empty);
            }
        }

        // Update castling availability
        this.castlingAvailability[0] = this.castlingAvailability[0] && (start[0] != 4 || start[1] != 7) && (start[0] != 7 || start[1] != 7) && (finish[0] != 7 || finish[1] != 7);
        this.castlingAvailability[1] = this.castlingAvailability[1] && (start[0] != 4 || start[1] != 7) && (start[0] != 0 || start[1] != 7) && (finish[0] != 0 || finish[1] != 7);
        this.castlingAvailability[2] = this.castlingAvailability[2] && (start[0] != 4 || start[1] != 0) && (start[0] != 7 || start[1] != 0) && (finish[0] != 7 || finish[1] != 0);
        this.castlingAvailability[3] = this.castlingAvailability[3] && (start[0] != 4 || start[1] != 0) && (start[0] != 0 || start[1] != 0) && (finish[0] != 0 || finish[1] != 0);

        // Check for en passant capture
        if (startPiece.type === PieceType.Pawn && this.enpassantTarget && finish[0] === this.enpassantTarget[0] && finish[1] === this.enpassantTarget[1]) {
            this.board[start[1]][finish[0]] = new Piece(PieceColour.Gaia, PieceType.Empty);
        }
        
        // Check for new en passant target square
        if (startPiece.type === PieceType.Pawn && Math.abs(start[1] - finish[1]) === 2) {
            this.enpassantTarget = [start[0], (start[1] + finish[1])/2];
        } else this.enpassantTarget = null;

        // Change who's move it is
        this.toMove = oppositeColour(this.toMove);

        // Update move counts
        if (this.toMove === PieceColour.White) this.moveCounter++;

        if (finishPiece.colour != PieceColour.Gaia || startPiece.type === PieceType.Pawn) {
            this.fiftymoveCounter = 0;
        }
        else {
            this.fiftymoveCounter++;
        }

        // Check for game over
        this.checkGameOver();
    }

    checkGameOver() {
        let pieces = this.allPieceLocations(this.toMove);
        for (let i = 0; i < pieces.length; i++) {
            let moves = this.getLegalMoves(pieces[i]);
            if (moves.length > 0) return;
        }

        if (this.isCheck(this.toMove)) {
            setTimeout(function() { alert('Checkmate!'); }, 1);
        }else{
            setTimeout(function() { alert('Stalemate!'); }, 1);
        }

    }

}

