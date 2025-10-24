const Timer = {
  timerInterval: null,
  startTime: null,
  elapsedTime: 0,
  isPaused: false,

  start() {
    this.startTime = Date.now() - this.elapsedTime;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      this.elapsedTime = Date.now() - this.startTime;
      const seconds = Math.floor(this.elapsedTime / 1000) % 60;
      const minutes = Math.floor(this.elapsedTime / (1000 * 60)) % 60;
      const hours = Math.floor(this.elapsedTime / (1000 * 60 * 60));

      const formattedTime =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

      const gameTimeEl = document.getElementById("gameTime");
      if (gameTimeEl) {
        gameTimeEl.textContent = `Time: ${formattedTime}`;
      }
    }, 1000);
  },

  pause() {
    this.isPaused = true;
  },

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startTime = Date.now() - this.elapsedTime;
  },

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.isPaused = false;

    const gameTimeEl = document.getElementById("gameTime");
    if (gameTimeEl) {
      gameTimeEl.textContent = `Time: 00:00:00`;
    }
  },
};

export default Timer;
