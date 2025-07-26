const blockedSites = [
  "instagram.com",
  "www.instagram.com",
  "linkedin.com",
  "www.linkedin.com",
  "facebook.com",
  "www.facebook.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "tiktok.com",
  "www.tiktok.com",
  "reddit.com",
  "www.reddit.com",
  "snapchat.com",
  "www.snapchat.com",
  "pinterest.com",
  "www.pinterest.com",
  "twitch.tv",
  "www.twitch.tv",
  "discord.com",
  "www.discord.com",
];

const isBlockedSite = (url) => {
  return blockedSites.some((site) => url.includes(site));
};

const checkAndCloseTab = async (tabId, url) => {
  const result = await chrome.storage.sync.get(["studyMode", "timerEndTime"]);
  const isStudyMode = result.studyMode || false;
  const timerEndTime = result.timerEndTime;

  if (isStudyMode && timerEndTime) {
    const now = Date.now();
    if (now >= timerEndTime) {
      await endTimer();
      return;
    }
  }

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

const endTimer = async () => {
  await chrome.storage.sync.remove(["timerEndTime"]);
  await chrome.storage.sync.set({ studyMode: false });
};

const checkTimerExpired = async () => {
  const result = await chrome.storage.sync.get(["studyMode", "timerEndTime"]);
  const isStudyMode = result.studyMode || false;
  const timerEndTime = result.timerEndTime;

  if (isStudyMode && timerEndTime) {
    const now = Date.now();
    if (now >= timerEndTime) {
      await endTimer();
    }
  }
};

setInterval(checkTimerExpired, 1000);

const isStudySite = (url) => {
  return url && url.includes("manifoldkerala.com");
};

const activateStudyMode = async () => {
  const result = await chrome.storage.sync.get(["studyMode", "timerEndTime"]);
  const isStudyMode = result.studyMode || false;
  const timerEndTime = result.timerEndTime;

  if (!isStudyMode && !timerEndTime) {
    const defaultMinutes = 25;
    const newTimerEndTime = Date.now() + defaultMinutes * 60 * 1000;

    await chrome.storage.sync.set({
      studyMode: true,
      timerEndTime: newTimerEndTime,
      focusMinutes: defaultMinutes,
    });

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (isBlockedSite(tab.url)) {
          chrome.tabs.remove(tab.id);
        }
      });
    });
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkAndCloseTab(tabId, changeInfo.url);

    if (isStudySite(changeInfo.url)) {
      activateStudyMode();
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    checkAndCloseTab(tab.id, tab.url);

    if (isStudySite(tab.url)) {
      activateStudyMode();
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "studyModeChanged") {
    if (message.studyMode) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (isBlockedSite(tab.url)) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    }
  }
});
