export function calculateSimilarity(searchPrompt: string, value: string): number {
  const searchLower = searchPrompt.toLowerCase();
  const valueLower = value.toLowerCase();

  let lettersInCorrectOrder = 0;
  let similarCharacters = 0;
  let excessCharacters = 0;

  for (let i = 0; i < searchLower.length; i++) {
    const searchChar = searchLower[i];
    const valueChar = valueLower[i];

    if (searchChar === valueChar) {
      lettersInCorrectOrder++;
    }

    if (valueLower.includes(searchChar)) {
      similarCharacters++;
    }
  }

  for (let i = searchLower.length; i < valueLower.length; i++) {
    const valueChar = valueLower[i];

    if (!searchLower.includes(valueChar)) {
      excessCharacters++;
    }
  }

  const similarityScore = lettersInCorrectOrder + similarCharacters / 2 - excessCharacters;
  return similarityScore;
}
