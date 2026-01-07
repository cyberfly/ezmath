// Hint generation utilities for visual math hints

/**
 * Generate visual hint data for a math problem
 * @param {Object} problem - {num1, num2, operation, answer}
 * @returns {Object} - Hint data with type and visual elements
 */
function generateHint(problem) {
  if (!problem) return { type: 'text', message: 'Think carefully!' }

  const { num1, num2, operation, answer } = problem

  switch (operation) {
    case 'add':
      return generateAdditionHint(num1, num2)
    case 'subtract':
      return generateSubtractionHint(num1, num2)
    case 'multiply':
      return generateMultiplicationHint(num1, num2)
    case 'divide':
      return generateDivisionHint(num1, num2, answer)
    default:
      return { type: 'text', message: 'Think carefully!' }
  }
}

function generateAdditionHint(num1, num2) {
  // For small numbers: show counting objects
  if (num1 <= 10 && num2 <= 10) {
    return {
      type: 'counting',
      group1: num1,
      group2: num2,
      message: `Count ${num1} circles, then add ${num2} more!`,
      instruction: 'Count all the circles together'
    }
  }

  // For larger numbers: show number line jumps
  return {
    type: 'numberLine',
    start: num1,
    jump: num2,
    direction: 'right',
    message: `Start at ${num1}, jump forward ${num2} spaces`,
    instruction: 'Where do you land?'
  }
}

function generateSubtractionHint(num1, num2) {
  // For small numbers: show crossing out
  if (num1 <= 12) {
    return {
      type: 'takeAway',
      total: num1,
      remove: num2,
      message: `Start with ${num1} circles, cross out ${num2}`,
      instruction: 'How many are left?'
    }
  }

  // For larger numbers: show number line
  return {
    type: 'numberLine',
    start: num1,
    jump: num2,
    direction: 'left',
    message: `Start at ${num1}, jump back ${num2} spaces`,
    instruction: 'Where do you land?'
  }
}

function generateMultiplicationHint(num1, num2) {
  // Choose smaller number for groups to keep visualization manageable
  const groups = Math.min(num1, num2)
  const itemsPerGroup = Math.max(num1, num2)

  // For reasonable sizes: show array/groups
  if (groups <= 6 && itemsPerGroup <= 6) {
    return {
      type: 'array',
      rows: groups,
      columns: itemsPerGroup,
      message: `${groups} groups with ${itemsPerGroup} in each group`,
      instruction: 'Count all the dots!'
    }
  }

  // For larger: show skip counting
  return {
    type: 'skipCount',
    base: itemsPerGroup,
    times: groups,
    message: `Skip count by ${itemsPerGroup}, do it ${groups} times`,
    instruction: `${itemsPerGroup}, ${itemsPerGroup * 2}, ${itemsPerGroup * 3}...`
  }
}

function generateDivisionHint(num1, num2, answer) {
  // Show grouping visualization
  if (num1 <= 24 && num2 <= 6) {
    return {
      type: 'grouping',
      total: num1,
      groupSize: num2,
      groups: answer,
      message: `Share ${num1} items into groups of ${num2}`,
      instruction: 'How many groups can you make?'
    }
  }

  // For larger: show reverse multiplication
  return {
    type: 'reverseMultiply',
    divisor: num2,
    dividend: num1,
    message: `What times ${num2} equals ${num1}?`,
    instruction: `Think: ${num2} x ? = ${num1}`
  }
}

export { generateHint }
