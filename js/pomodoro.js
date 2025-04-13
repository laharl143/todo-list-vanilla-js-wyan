document.addEventListener("DOMContentLoaded", () => {
  let pomodoroTime = 25 * 60; // default 25 minutes
  let breakTime = 5 * 60; // default 5 minutes break
  let longBreakTime = 15 * 60; // Long break time after 4 cycles
  let isWorkTime = true;
  let timerInterval;
  let cycles = 0;
  let timerRunning = false;

  const display = document.getElementById("pomodoro-display");
  const statusDisplay = document.getElementById("pomodoro-status");
  const title = document.querySelector("h3"); // Grab the <h3> element for dynamic text update

  const startButton = document.getElementById("start-pomodoro");
  const resetButton = document.getElementById("reset-pomodoro");
  const workTimeInput = document.getElementById("work-time");
  const breakTimeInput = document.getElementById("break-time");

  // Format time into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Play a sound when the cycle ends
  const playSound = () => {
    const audio = new Audio("assets/sounds/alarm1.wav"); // Custom beep sound
    audio.play();
  };

  // Update title dynamically based on current state
  const updateTitle = () => {
    if (isWorkTime) {
      title.textContent = "Pomodoro Timer"; // Work time
    } else if (cycles % 4 === 0) {
      title.textContent = "Long Break Time"; // Long break after 4 cycles
    } else {
      title.textContent = "Break Time"; // Normal break
    }
  };

  // Start or Pause the timer
  const startPomodoro = () => {
    if (!timerRunning) {
      timerRunning = true;
      startButton.textContent = "Pause";
      startButton.disabled = true; // Disable start button during running

      updateTitle(); // Update the title when starting or resuming

      timerInterval = setInterval(() => {
        pomodoroTime--; // Decrease time every second
        display.textContent = formatTime(pomodoroTime);

        if (pomodoroTime <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;

          // Switch between work and break
          if (isWorkTime) {
            cycles++;
            if (cycles % 4 === 0) {
              // Long break after 4 Pomodoros
              pomodoroTime = longBreakTime;
              statusDisplay.textContent = "Long Break!";
            } else {
              pomodoroTime = breakTime;
              statusDisplay.textContent = "Break Time!";
            }
            playSound(); // Play sound when the Pomodoro ends
          } else {
            isWorkTime = true;
            pomodoroTime = workTimeInput.value * 60; // Use user-set work time
            statusDisplay.textContent = "Work Time!";
          }

          updateTitle(); // Update the title based on the current state

          startButton.textContent = "Start";
          startButton.disabled = false; // Re-enable start button when done
        }
      }, 1000);
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      startButton.textContent = "Resume";
      startButton.disabled = false; // Re-enable start button if paused
    }
  };

  // Reset the timer
  const resetPomodoro = () => {
    clearInterval(timerInterval);
    timerRunning = false;
    pomodoroTime = workTimeInput.value * 60; // Reset to custom work time if changed
    display.textContent = formatTime(pomodoroTime);
    statusDisplay.textContent = "";
    updateTitle(); // Reset the title back to Pomodoro timer
    startButton.textContent = "Start";
    startButton.disabled = false;
  };

  startButton.addEventListener("click", startPomodoro);
  resetButton.addEventListener("click", resetPomodoro);

  // Initial display
  display.textContent = formatTime(pomodoroTime);
  updateTitle(); // Set initial title on page load
});
