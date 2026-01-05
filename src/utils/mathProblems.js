// Math problem generation utilities

const DIFFICULTY_CONFIG = {
  easy: {
    range: [1, 10],
    operations: ['add', 'subtract'],
    label: 'Easy (Ages 5-7)'
  },
  medium: {
    range: [1, 50],
    operations: ['add', 'subtract', 'multiply', 'divide'],
    label: 'Medium (Ages 7-9)'
  },
  hard: {
    range: [1, 100],
    operations: ['add', 'subtract', 'multiply', 'divide'],
    label: 'Hard (Ages 9-12)'
  }
}

const OPERATION_SYMBOLS = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷'
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(difficulty = 'easy', operations = null) {
  const config = DIFFICULTY_CONFIG[difficulty]
  const [min, max] = config.range

  // Use provided operations or default to difficulty's operations
  const availableOps = operations || config.operations
  const operation = availableOps[randomInt(0, availableOps.length - 1)]

  let num1, num2, answer

  switch (operation) {
    case 'add':
      num1 = randomInt(min, max)
      num2 = randomInt(min, max)
      answer = num1 + num2
      break

    case 'subtract':
      // Ensure no negative results
      num1 = randomInt(min, max)
      num2 = randomInt(min, num1)
      answer = num1 - num2
      break

    case 'multiply':
      // Keep multiplication reasonable
      const multiplyMax = difficulty === 'hard' ? 12 : (difficulty === 'medium' ? 10 : 5)
      num1 = randomInt(1, multiplyMax)
      num2 = randomInt(1, multiplyMax)
      answer = num1 * num2
      break

    case 'divide':
      // Ensure clean division (no remainders)
      num2 = randomInt(1, difficulty === 'hard' ? 12 : 10)
      answer = randomInt(1, difficulty === 'hard' ? 12 : 10)
      num1 = num2 * answer
      break
  }

  return {
    num1,
    num2,
    operation,
    symbol: OPERATION_SYMBOLS[operation],
    answer,
    difficulty
  }
}

function checkAnswer(problem, userAnswer) {
  return parseInt(userAnswer) === problem.answer
}

export {
  DIFFICULTY_CONFIG,
  OPERATION_SYMBOLS,
  generateProblem,
  checkAnswer
}
