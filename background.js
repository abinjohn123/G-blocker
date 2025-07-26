const blockedSites = [
  'instagram.com',
  'www.instagram.com',
  'linkedin.com',
  'www.linkedin.com'
];

const isBlockedSite = (url) => {
  return blockedSites.some(site => url.includes(site));
};

const checkAndCloseTab = async (tabId, url) => {
  const result = await chrome.storage.sync.get(['studyMode']);
  const isStudyMode = result.studyMode || false;
  
  if (isStudyMode && isBlockedSite(url)) {
    chrome.tabs.remove(tabId);
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkAndCloseTab(tabId, changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndCloseTab(tab.id, tab.url);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'studyModeChanged') {
    if (message.studyMode) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (isBlockedSite(tab.url)) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    }
  }
});