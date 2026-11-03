import { useRef, useState } from "react";
import { PLAYER_O, PLAYER_X, Square } from "./Square";

const BOARD_SIDES = 3;
const BOARD_INDICES = [...Array(BOARD_SIDES).keys()];
const CELL_COUNT = BOARD_SIDES * BOARD_SIDES;

const WIN_POSITIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export function Board() {
    const [status, setStatus] = useState(new Array(CELL_COUNT).fill(undefined));
    const [winner, setWinner] = useState();
    const [gameOver, setGameOver] = useState(false);
    const [lastCell, setLastCell] = useState();
    const [robotMode, setRobotMode] = useState(false);
    const [darkTheme, setDarkTheme] = useState(false);
    const [wins, setWins] = useState({ [PLAYER_X]: 0, [PLAYER_O]: 0 });
    const lastPlayer = useRef();

    function handleClick(idx, player) {
        if (player !== PLAYER_O && player !== PLAYER_X) return;
        if (robotMode && player !== PLAYER_X) return;
        if (!robotMode && lastPlayer.current === player) return;
        if (status[idx] || gameOver) return;

        if (!robotMode) lastPlayer.current = player;

        const newStatus = [...status];
        newStatus[idx] = player;
        let nextLastCell = idx;
        let nextWinner = getWinner(newStatus);

        if (robotMode && !nextWinner && !newStatus.every(Boolean)) {
            const emptyCells = newStatus.flatMap((cell, index) =>
                cell ? [] : [index],
            );
            const robotCell =
                emptyCells[Math.floor(Math.random() * emptyCells.length)];
            newStatus[robotCell] = PLAYER_O;
            nextLastCell = robotCell;
            nextWinner = getWinner(newStatus);
        }

        setStatus(newStatus);
        setLastCell(nextLastCell);
        setWinner(nextWinner);
        setGameOver(Boolean(nextWinner) || newStatus.every(Boolean));
        if (nextWinner) {
            setWins((currentWins) => ({
                ...currentWins,
                [nextWinner]: currentWins[nextWinner] + 1,
            }));
        }
    }

    function handlePlayAgain() {
        setStatus(new Array(CELL_COUNT).fill(undefined));
        setWinner(undefined);
        setGameOver(false);
        setLastCell(undefined);
        lastPlayer.current = undefined;
    }

    function handleRobotModeToggle() {
        handlePlayAgain();
        setRobotMode((enabled) => !enabled);
    }

    return (
        <main className={`app-shell${darkTheme ? " dark-theme" : ""}`}>
            <div className="outside">
                <button
                    className="robot-toggle"
                    onClick={handleRobotModeToggle}
                    aria-pressed={robotMode}
                >
                    {robotMode ? "Stop playing with robot" : "Play with robot"}
                </button>
                {robotMode && (
                    <div className="robot-hint">You are X; robot is O.</div>
                )}

                <div className="board">
                    {BOARD_INDICES.map((rowIndex) => (
                        <div className="board-row" key={rowIndex}>
                            {BOARD_INDICES.map((columnIndex) => {
                                const index =
                                    rowIndex * BOARD_SIDES + columnIndex;
                                return (
                                    <Square
                                        key={index}
                                        value={status[index]}
                                        highlight={index === lastCell}
                                        onSquareClick={(player) =>
                                            handleClick(index, player)
                                        }
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div className="game-status">
                        {gameOver && winner && (
                            <div>Game over! {winner} won</div>
                        )}
                        {gameOver && !winner && <div>Draw! No winner</div>}
                        {gameOver && (
                            <button
                                className="reset-button"
                                onClick={handlePlayAgain}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                    <div className="win-counter" aria-label="Win counts">
                        <span>X wins: {wins[PLAYER_X]}</span>
                        <span>O wins: {wins[PLAYER_O]}</span>
                    </div>
                    <button
                        className="theme-toggle"
                        onClick={() => setDarkTheme((enabled) => !enabled)}
                        aria-pressed={darkTheme}
                    >
                        {darkTheme ? "Világos téma" : "Sötét téma"}
                    </button>
                </div>
            </div>
        </main>
    );
}

function getWinner(board) {
    const winningPosition = WIN_POSITIONS.find(([first, second, third]) => {
        return (
            board[first] &&
            board[first] === board[second] &&
            board[first] === board[third]
        );
    });

    return winningPosition ? board[winningPosition[0]] : undefined;
}

export default Board;
