document.addEventListener('DOMContentLoaded', () => {
  const studyModeToggle = document.getElementById('studyMode');
  const statusElement = document.getElementById('status');
  const focusMinutesInput = document.getElementById('focusMinutes');
  const timerSetup = document.getElementById('timerSetup');
  const timerDisplay = document.getElementById('timerDisplay');
  const countdown = document.getElementById('countdown');

  let timerInterval = null;

  chrome.storage.sync.get(['studyMode', 'timerEndTime', 'focusMinutes'], (result) => {
    const isStudyMode = result.studyMode || false;
    const timerEndTime = result.timerEndTime;
    const focusMinutes = result.focusMinutes || 30;
    
    focusMinutesInput.value = focusMinutes;
    
    if (isStudyMode && timerEndTime) {
      const now = Date.now();
      if (now < timerEndTime) {
        startTimer(timerEndTime);
        studyModeToggle.checked = true;
      } else {
        endTimer();
      }
    } else {
      studyModeToggle.checked = false;
      updateStatus(false);
    }
  });

  studyModeToggle.addEventListener('change', () => {
    const isStudyMode = studyModeToggle.checked;
    
    if (isStudyMode) {
      const minutes = parseInt(focusMinutesInput.value);
      const timerEndTime = Date.now() + (minutes * 60 * 1000);
      
      chrome.storage.sync.set({ 
        studyMode: true, 
        timerEndTime: timerEndTime,
        focusMinutes: minutes
      }, () => {
        startTimer(timerEndTime);
        chrome.runtime.sendMessage({
          action: 'studyModeChanged',
          studyMode: true,
          timerEndTime: timerEndTime
        });
      });
    } else {
      endTimer();
    }
  });

  const startTimer = (endTime) => {
    timerSetup.style.display = 'none';
    timerDisplay.style.display = 'block';
    document.querySelector('.toggle-container').style.display = 'none';
    updateStatus(true);
    
    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0) {
        endTimer();
        return;
      }
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    updateCountdown();
    timerInterval = setInterval(updateCountdown, 1000);
  };

  const endTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    timerSetup.style.display = 'block';
    timerDisplay.style.display = 'none';
    document.querySelector('.toggle-container').style.display = 'flex';
    studyModeToggle.checked = false;
    
    chrome.storage.sync.remove(['timerEndTime'], () => {
      chrome.storage.sync.set({ studyMode: false }, () => {
        updateStatus(false);
        chrome.runtime.sendMessage({
          action: 'studyModeChanged',
          studyMode: false
        });
      });
    });
  };

  const updateStatus = (isStudyMode) => {
    if (isStudyMode) {
      statusElement.textContent = 'Focus mode active';
      statusElement.className = 'status active';
    } else {
      statusElement.textContent = 'Ready to focus';
      statusElement.className = 'status';
    }
  };
});