document.addEventListener('DOMContentLoaded', () => {
  const studyModeToggle = document.getElementById('studyMode');
  const statusElement = document.getElementById('status');

  chrome.storage.sync.get(['studyMode'], (result) => {
    const isStudyMode = result.studyMode || false;
    studyModeToggle.checked = isStudyMode;
    updateStatus(isStudyMode);
  });

  studyModeToggle.addEventListener('change', () => {
    const isStudyMode = studyModeToggle.checked;
    
    chrome.storage.sync.set({ studyMode: isStudyMode }, () => {
      updateStatus(isStudyMode);
      
      chrome.runtime.sendMessage({
        action: 'studyModeChanged',
        studyMode: isStudyMode
      });
    });
  });

  const updateStatus = (isStudyMode) => {
    statusElement.textContent = isStudyMode ? 'Study mode is ON' : 'Study mode is OFF';
    statusElement.className = isStudyMode ? 'status active' : 'status';
  };
});