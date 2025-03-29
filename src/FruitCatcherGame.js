import React, { useState, useEffect, useRef } from 'react';
import './FruitCatcherGame.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 60;
const FRUIT_SIZE = 40;
const FRUIT_TYPES = ['🍎', '🍌', '🍊', '🍓', '🍍'];
const GAME_DURATION = 60;

function FruitCatcherGame() {
  const [basketPosition, setBasketPosition] = useState(GAME_WIDTH / 2 - BASKET_WIDTH / 2);
  const [fruits, setFruits] = useState([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highScore, setHighScore] = useState(() => localStorage.getItem('highScore') || 0);
  
  const gameLoopRef = useRef(null);
  const fruitGeneratorRef = useRef(null);
  const timerRef = useRef(null);
  
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setFruits([]);
    setTimeLeft(GAME_DURATION);
    
    let speedMultiplier = 0.5;

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (fruitGeneratorRef.current) clearInterval(fruitGeneratorRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    gameLoopRef.current = setInterval(() => {
      setFruits(prevFruits => {
        return prevFruits
          .map(fruit => ({ ...fruit, y: fruit.y + fruit.speed * speedMultiplier }))
          .filter(fruit => {
            if (fruit.y + FRUIT_SIZE >= GAME_HEIGHT - BASKET_HEIGHT && 
                fruit.y <= GAME_HEIGHT &&
                fruit.x + FRUIT_SIZE >= basketPosition && 
                fruit.x <= basketPosition + BASKET_WIDTH) {
              setScore(prevScore => prevScore + 10);
              return false;
            }
            
            
            
            return true;
          });
      });
    }, 16);
    
    fruitGeneratorRef.current = setInterval(() => {
      const newFruit = {
        id: Date.now(),
        x: Math.random() * (GAME_WIDTH - FRUIT_SIZE),
        y: -FRUIT_SIZE,
        type: FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)],
        speed: 0.5 + Math.random() * 1
      };
      
      setFruits(prevFruits => [...prevFruits, newFruit]);
    }, 1500);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const endGame = () => {
    setGameActive(false);
    clearInterval(gameLoopRef.current);
    clearInterval(fruitGeneratorRef.current);
    clearInterval(timerRef.current);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActive) return;
      
      if (e.key === 'ArrowLeft') {
        setBasketPosition(prev => Math.max(0, prev - 20));
      } else if (e.key === 'ArrowRight') {
        setBasketPosition(prev => Math.min(GAME_WIDTH - BASKET_WIDTH, prev + 20));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);
  
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (fruitGeneratorRef.current) clearInterval(fruitGeneratorRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Fruit Catcher</h1>
      
      <div className="game-header">
        <div style={{marginLeft: '750px'}}>Score: {score}</div>
        <div style={{marginRight: '750px'}}>Time: {timeLeft}s</div>
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '18px', marginBottom: '10px' }}>High Score: {highScore}</div>
      
      {!gameActive && (
        <button 
          className="start-button"
          onClick={startGame}
        >
          {timeLeft === GAME_DURATION ? "Start Game" : "Play Again"}
        </button>
      )}
      
      <div 
        className="game-container"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {fruits.map(fruit => (
          <div 
            key={fruit.id} 
            style={{ 
              position: 'absolute', 
              left: `${fruit.x}px`, 
              top: `${fruit.y}px`,
              fontSize: `${FRUIT_SIZE}px`,
              lineHeight: '1',
              textAlign: 'center',
              color: 'black',
              fontWeight: 'bold'
            }}
          >
            {fruit.type} 
          </div>
        ))}
        
        <div
          className="basket"
          style={{
            left: `${basketPosition}px`,
            width: `${BASKET_WIDTH}px`,
            height: `${BASKET_HEIGHT}px`
          }}
        >
          <div className="basket-inner"></div>
        </div>
      </div>
      
      <div className="game-instructions">
        Use left and right arrow keys to move the basket
      </div>
    </div>
  );
}

export default FruitCatcherGame;