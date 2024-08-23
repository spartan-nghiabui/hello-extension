'use strict';

function setBadgeText(enabled) {
  const text = enabled ? 'ON' : 'OFF';
  void chrome.action.setBadgeText({ text: text });
}
function startUp() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      checkGoogleMeet(tabs[0].id, null, tabs[0]);
    }
  });
}

function checkGoogleMeet(tabId, changeInfo, tab) {
  // Check if the current tab's URL matches gg meet url
  if (tab.url && tab.url.includes('https://meet.google.com/')) {
    chrome.storage.sync.get('enabled', (data) => {
      setBadgeText(!!data.enabled);
    });
  } else {
    // Disable the extension's features
    chrome.action.disable(tabId);
  }
}

// Ensure the background script always runs.
chrome.runtime.onStartup.addListener(startUp);
chrome.runtime.onInstalled.addListener(startUp);
