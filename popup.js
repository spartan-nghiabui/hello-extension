'use strict';

document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    const googleMeetUrlPattern = 'https://meet.google.com/';

    if (currentTab.url && currentTab.url.includes(googleMeetUrlPattern)) {
      document.getElementById('popup-content').style.display = 'block';
      document.getElementById('not-google-meet-message').style.display = 'none';
    } else {
      document.getElementById('popup-content').style.display = 'none';
      document.getElementById('not-google-meet-message').style.display =
        'block';
    }
  });

  // Handle the ON/OFF switch
  const checkbox = document.getElementById('enabled');
  chrome.storage.sync.get('enabled', (data) => {
    checkbox.checked = !!data.enabled;
    void setBadgeText(data.enabled);
  });

  checkbox.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const enabled = event.target.checked;
      void chrome.storage.sync.set({ enabled });
      void setBadgeText(enabled);

      // Send a message to the content script to enable/disable highlighting
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleHighlight',
          enabled,
        });
      });
    }
  });

  // Handle the input field
  const input = document.getElementById('item');
  chrome.storage.sync.get('item', (data) => {
    input.value = data.item || '';
  });

  input.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      const item = event.target.value;
      void chrome.storage.sync.set({ item });

      // Send a message to the content script to update the highlighted text
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateText',
          textToHighlight: item,
        });
      });
    }
  });
});

function setBadgeText(enabled) {
  const text = enabled ? 'ON' : 'OFF';
  void chrome.action.setBadgeText({ text: text });
}
