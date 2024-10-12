'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Coordinate = [number, number]

const INITIAL_SNAKE: Coordinate[] = [[5, 5]]
const INITIAL_FOOD: Coordinate = [10, 10]
const INITIAL_DIRECTION: Direction = 'RIGHT'
const GAME_SPEED = 150 // milliseconds

export default function ModernRealisticSnakeGame() {
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Coordinate>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isEating, setIsEating] = useState(false)
  const [isChewing, setIsChewing] = useState(false)
  const [gridSize, setGridSize] = useState(20)
  const [cellSize, setCellSize] = useState(30)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const updateGameArea = useCallback(() => {
    if (gameAreaRef.current) {
      const { width, height } = gameAreaRef.current.getBoundingClientRect()
      const minDimension = Math.min(width, height)
      const newGridSize = Math.floor(minDimension / 30)
      setGridSize(newGridSize)
      setCellSize(minDimension / newGridSize)
    }
  }, [])

  useEffect(() => {
    updateGameArea()
    window.addEventListener('resize', updateGameArea)
    return () => window.removeEventListener('resize', updateGameArea)
  }, [updateGameArea])

  const moveSnake = useCallback(() => {
    const newSnake = [...snake]
    const [headY, headX] = newSnake[0]

    let newHead: Coordinate
    switch (direction) {
      case 'UP':
        newHead = [headY - 1, headX]
        break
      case 'DOWN':
        newHead = [headY + 1, headX]
        break
      case 'LEFT':
        newHead = [headY, headX - 1]
        break
      case 'RIGHT':
        newHead = [headY, headX + 1]
        break
    }

    if (newHead[0] < 0 || newHead[0] >= gridSize || newHead[1] < 0 || newHead[1] >= gridSize) {
      setGameOver(true)
      return
    }

    newSnake.unshift(newHead)

    if (newHead[0] === food[0] && newHead[1] === food[1]) {
      setScore(prevScore => {
        const newScore = prevScore + 1
        if (newScore > highScore) {
          setHighScore(newScore)
        }
        return newScore
      })
      setIsEating(true)
      setTimeout(() => {
        setIsEating(false)
        setIsChewing(true)
        setTimeout(() => setIsChewing(false), 500)
      }, 300)
      generateFood()
    } else {
      newSnake.pop()
    }

    if (isCollision(newHead)) {
      setGameOver(true)
      return
    }

    setSnake(newSnake)
  }, [snake, direction, food, highScore, gridSize])

  const isCollision = (head: Coordinate): boolean => {
    return snake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1])
  }

  const generateFood = () => {
    let newFood: Coordinate
    do {
      newFood = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize)
      ]
    } while (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]))
    setFood(newFood)
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev)
        break
      case 'ArrowDown':
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev)
        break
      case 'ArrowLeft':
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev)
        break
      case 'ArrowRight':
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev)
        break
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  useEffect(() => {
    if (!gameOver) {
      const gameLoop = setInterval(moveSnake, GAME_SPEED)
      return () => clearInterval(gameLoop)
    }
  }, [gameOver, moveSnake])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    setGameOver(false)
    setScore(0)
    setIsEating(false)
    setIsChewing(false)
  }

  const renderSnakeSegment = (segment: Coordinate, index: number) => {
    const [y, x] = segment
    const isHead = index === 0

    return (
      <g key={index} transform={`translate(${x * cellSize}, ${y * cellSize})`}>
        <path
          d={`M${cellSize * 0.1},${cellSize * 0.3} 
             Q${cellSize * 0.05},${cellSize * 0.15} ${cellSize * 0.2},${cellSize * 0.1} 
             L${cellSize * 0.8},${cellSize * 0.1} 
             Q${cellSize * 0.95},${cellSize * 0.15} ${cellSize * 0.9},${cellSize * 0.3}
             L${cellSize * 0.9},${cellSize * 0.7}
             Q${cellSize * 0.95},${cellSize * 0.85} ${cellSize * 0.8},${cellSize * 0.9}
             L${cellSize * 0.2},${cellSize * 0.9}
             Q${cellSize * 0.05},${cellSize * 0.85} ${cellSize * 0.1},${cellSize * 0.7} Z`}
          fill={isHead ? "#2E7D32" : "#4CAF50"}
          stroke="#1B5E20"
          strokeWidth="1"
        />
        {isHead && (
          <>
            <circle cx={cellSize * 0.3} cy={cellSize * 0.3} r={cellSize * 0.08} fill="white" />
            <circle cx={cellSize * 0.7} cy={cellSize * 0.3} r={cellSize * 0.08} fill="white" />
            <circle cx={cellSize * 0.3} cy={cellSize * 0.3} r={cellSize * 0.04} fill="black" />
            <circle cx={cellSize * 0.7} cy={cellSize * 0.3} r={cellSize * 0.04} fill="black" />
            {(isEating || isChewing) && (
              <path
                d={`M${cellSize * 0.3},${cellSize * 0.7} Q${cellSize * 0.5},${cellSize * (isEating ? 0.8 : 0.75)} ${cellSize * 0.7},${cellSize * 0.7}`}
                fill="none"
                stroke="white"
                strokeWidth="2"
                className={isEating ? "animate-pulse" : isChewing ? "animate-bounce" : ""}
              />
            )}
          </>
        )}
      </g>
    )
  }

  const renderApple = () => {
    const [y, x] = food
    return (
      <g 
        transform={`translate(${x * cellSize}, ${y * cellSize})`}
        className={isEating ? "animate-bounce" : ""}
      >
        <path
          d={`M${cellSize * 0.5},${cellSize * 0.2}
             C${cellSize * 0.3},${cellSize * 0.1} ${cellSize * 0.1},${cellSize * 0.2} ${cellSize * 0.1},${cellSize * 0.5}
             C${cellSize * 0.1},${cellSize * 0.8} ${cellSize * 0.3},${cellSize * 0.9} ${cellSize * 0.5},${cellSize * 0.9}
             C${cellSize * 0.7},${cellSize * 0.9} ${cellSize * 0.9},${cellSize * 0.8} ${cellSize * 0.9},${cellSize * 0.5}
             C${cellSize * 0.9},${cellSize * 0.2} ${cellSize * 0.7},${cellSize * 0.1} ${cellSize * 0.5},${cellSize * 0.2}`}
          fill="#FF0000"
        />
        <path
          d={`M${cellSize * 0.5},${cellSize * 0.2} 
             Q${cellSize * 0.6},${cellSize * 0.1} ${cellSize * 0.7},${cellSize * 0.15}`}
          fill="none"
          stroke="#00AA00"
          strokeWidth={cellSize * 0.05}
        />
      </g>
    )
  }

  const renderCloud = (x: number, y: number, scale: number) => (
    <path
      d={`M${x},${y} 
         c-4.5-11.1-16.6-15.7-27.1-10.3c-2.4-9.5-11-16.5-21.1-16.5c-12.1,0-22,9.9-22,22
         c0,0.8,0.1,1.6,0.2,2.4c-9.8,1.6-17.2,10.1-17.2,20.3c0,11.4,9.2,20.6,20.6,20.6h63.7c9.4,0,17-7.6,17-17
         C${x + 14},${y - 6.4} ${x + 8.1},${y - 13.8} ${x},${y}z`}
      fill="#FFFFFF"
      opacity="0.8"
      transform={`scale(${scale})`}
    />
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 dark:from-sky-900 dark:to-sky-700 text-gray-900 dark:text-gray-100 p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full">
          {renderCloud(100, 50, 0.5)}
          {renderCloud(300, 100, 0.7)}
          {renderCloud(500, 30, 0.6)}
          {renderCloud(700, 80, 0.8)}
        </svg>
      </div>
      <div className="flex justify-between items-center w-full max-w-[80vmin] mb-4 z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white dark:text-gray-200 drop-shadow-lg">Modern Snake Game</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="bg-white dark:bg-gray-800"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      <div className="mb-2 sm:mb-4 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white dark:text-gray-200 drop-shadow-md">
        <span className="mr-4">Score: {score}</span>
        <span>High Score: {highScore}</span>
      </div>
      <div 
        ref={gameAreaRef}
        className="w-full max-w-[80vmin] aspect-square bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${gridSize * cellSize} ${gridSize * cellSize}`}
          className="border-4 border-gray-200 dark:border-gray-700"
        >
          <defs>
            <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {snake.map(renderSnakeSegment)}
          {renderApple()}
        </svg>
      </div>
      {gameOver && (
        <div className="mt-4 text-center z-10">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-white dark:text-gray-200 drop-shadow-lg">Game Over!</p>
          <Button onClick={resetGame} className="text-base sm:text-lg md:text-xl bg-green-500 hover:bg-green-600 text-white">Restart  Game</Button>
        </div>
      )}
      <div className="mt-4 text-center text-sm sm:text-base md:text-lg text-white dark:text-gray-200 drop-shadow-md z-10">
        <p>Use arrow keys to control the snake.</p>
        <p>Eat red apples to grow and increase your score!</p>
      </div>
    </div>
  )
}