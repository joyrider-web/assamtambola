// Voice announcer using Web Speech API
export function speak(text: string, rate = 1, pitch = 1) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  
  // Try to find an English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (englishVoice) utterance.voice = englishVoice;
  
  window.speechSynthesis.speak(utterance);
}

export function announceNumber(num: number) {
  speak(`Number ${num}`, 0.9, 1.1);
}

export function announceGameStart() {
  speak('The Tambola game has started! Good luck everyone!', 0.85, 1);
}

export function announceGameOver() {
  speak('The game is over! Thank you for playing!', 0.85, 1);
}

export function announceWinner(playerName: string, prizeType: string) {
  const prizeLabel = prizeType === 'first_full_house' 
    ? 'First Full House' 
    : prizeType === 'full_sheet_bonus_2' 
    ? 'Full Sheet Bonus, Second Winner' 
    : 'Full Sheet Bonus, Third Winner';
  speak(`Congratulations ${playerName}! Winner of ${prizeLabel}!`, 0.85, 1.1);
}
