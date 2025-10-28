export const generateKeySequence = (index: number): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let key = "";
  let i = index;
  while (i >= 0) {
    key = alphabet[i % 26] + key;
    i = Math.floor(i / 26) - 1;
  }
  return key;
};
