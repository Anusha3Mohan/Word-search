import React, { useState, useEffect } from 'react';
import './App.css';
import celebrationImage from './assets/images/tenor.gif'; // Update the path as needed

const wordsByDifficulty = {
  easy: ['CAT', 'DOG','COW'],
  medium: ['PINK', 'VIOLET', 'ORANGE', 'YELLOW'],
  hard: ['MOTHERBOARD', 'COMPUTER', 'SOFTWARE', 'KEYBOARD', 'VARIABLES', 'COMPONENTS'],
};

const generateGrid = (words, size) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));

  words.forEach(word => {
    let placed = false;

    while (!placed) {
      const direction = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (direction === 0) { // Horizontal
        if (col + word.length <= size) { // Check if it fits in the grid
          let canPlace = true;

          for (let i = 0; i < word.length; i++) {
            if (grid[row][col + i] !== '') {
              canPlace = false; // Collision with existing letters
              break;
            }
          }

          if (canPlace) {
            for (let j = 0; j < word.length; j++) {
              grid[row][col + j] = word[j]; // Place the word
            }
            placed = true; // Mark the word as placed
          }
        }
      } else { // Vertical
        if (row + word.length <= size) { // Check if it fits in the grid
          let canPlace = true;

          for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col] !== '') {
              canPlace = false; // Collision with existing letters
              break;
            }
          }

          if (canPlace) {
            for (let j = 0; j < word.length; j++) {
              grid[row + j][col] = word[j]; // Place the word
            }
            placed = true; // Mark the word as placed
          }
        }
      }
    }
  });

  // Fill empty cells with random letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Fill with random letters
      }
    }
  }

  return grid;
};

const WordSearch = () => {
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [timer, setTimer] = useState(60); // 60 seconds timer
  const [isGameActive, setIsGameActive] = useState(true);

  useEffect(() => {
    setGrid(generateGrid(wordsByDifficulty[difficulty], 10));
    setTimer(60); // Reset timer on new game
    setIsGameActive(true);
  }, [difficulty]);

  useEffect(() => {
    if (foundWords.length === wordsByDifficulty[difficulty].length) {
      setShowWinPopup(true);
      setIsGameActive(false);
    }
  }, [foundWords]);

  useEffect(() => {
    if (timer > 0 && isGameActive) {
      const intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0) {
      setIsGameActive(false);
      alert("Time's up!"); // Notify the player when time's up
    }
  }, [timer, isGameActive]);

  const handleMouseDown = (row, col) => {
    setSelectedCells([[row, col]]);
  };

  const handleMouseEnter = (row, col) => {
    if (selectedCells.length > 0) {
      setSelectedCells(prev => [...prev, [row, col]]);
    }
  };

  const handleMouseUp = () => {
    if (selectedCells.length > 1) {
      checkSelectedWord();
    }
    setSelectedCells([]);
  };

  const checkSelectedWord = () => {
    const selectedRows = selectedCells.map(cell => cell[0]);
    const selectedCols = selectedCells.map(cell => cell[1]);

    const allSameRow = selectedRows.every(row => row === selectedRows[0]);
    const allSameCol = selectedCols.every(col => col === selectedCols[0]);

    if (allSameRow || allSameCol) {
      const selectedWord = selectedCells
        .map(cell => grid[cell[0]][cell[1]])
        .join('');

      if (wordsByDifficulty[difficulty].includes(selectedWord) && !foundWords.includes(selectedWord)) {
        setFoundWords(prev => [...prev, selectedWord]);
        setScore(prev => prev + 1);
      }
    }
  };

  const resetGame = () => {
    setGrid(generateGrid(wordsByDifficulty[difficulty], 10));
    setFoundWords([]);
    setScore(0);
    setSelectedCells([]);
    setShowWinPopup(false);
    setTimer(60); // Reset timer
    setIsGameActive(true); // Restart game
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    resetGame(); // Reset the game when difficulty changes
  };

  return (
    <div className="word-search">
      <h1 style={{ fontWeight: "bolder", fontFamily: "serif" }}>Word Search</h1>
      <h2>Score: {score} / {wordsByDifficulty[difficulty].length}</h2> {/* Show total words to find */}
      <h2>Time Left: {timer} seconds</h2> {/* Timer Display */}

      {/* Difficulty Selector */}
      <div className="difficulty-selector">
        <label htmlFor="difficulty">Choose Difficulty:</label>
        <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Centered Reset Button */}
      <div className="reset-button-container">
        <button className="reset-button" onClick={resetGame}>Reset Game</button>
      </div>

      {/* Flex Container for Grid and Word List */}
      <div className="flex-container">
        <div className="grid" onMouseUp={handleMouseUp}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((letter, colIndex) => {
                const isSelected = selectedCells.some(cell => cell[0] === rowIndex && cell[1] === colIndex);
                return (
                  <div
                    key={colIndex}
                    className={`cell ${isSelected ? 'selected' : ''}`}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="word-list">
          <h2>Words to Find:</h2>
          <ul>
            {wordsByDifficulty[difficulty].map((word, index) => (
              <li key={index} className={foundWords.includes(word) ? 'found' : ''}>
                {foundWords.includes(word) && <span className="tick">✔️</span>} {word}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Winning Popup with Celebration Image */}
      {showWinPopup && (
        <div className={`popup ${showWinPopup ? 'active' : ''}`}>
          <div className="popup-content">
            <h2>Congratulations!</h2>
            <p>You found all the words!</p>
            <img src={celebrationImage} alt="Celebration" className="celebration-image" />
            <button className="play-again-button" onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <WordSearch />
    </div>
  );
}

export default App;
