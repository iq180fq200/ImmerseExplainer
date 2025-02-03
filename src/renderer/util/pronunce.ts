// use the Web Speech API, which is built into browsers and Chromium.
export function pronounceWord(word: string) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(word);
  // TODO: add support to other languages
  utterance.lang = 'en-US'; // Change for other languages
  synth.speak(utterance);
}