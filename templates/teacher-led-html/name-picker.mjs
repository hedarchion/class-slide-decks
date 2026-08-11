/**
 * Create a local, no-repeat student name picker for a teacher-led deck.
 * Pass only the selected class's roster; never pass assessment data.
 */
export function createNamePicker(names) {
  const original = [...names];
  let remaining = [];

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const reset = () => {
    remaining = shuffle(original);
  };

  reset();

  return {
    draw() {
      if (remaining.length === 0) return null;
      return remaining.pop();
    },
    reset,
    get remainingCount() {
      return remaining.length;
    },
  };
}
