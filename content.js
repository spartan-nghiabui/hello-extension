'use strict';

const highlight = 'cyan';
let textToHighlight = '';

// Function to highlight text
function highlightText() {
  const highlightedClass = 'stratos-highlight';
  const textNodes = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node;

  while ((node = textNodes.nextNode())) {
    const parent = node.parentElement;
    if (
      node.textContent.includes(textToHighlight) &&
      !parent.classList.contains(highlightedClass)
    ) {
      highlightElement(parent);
    }
  }
}

// Function to remove highlight
function removeHighlight() {
  const highlightedElements = document.querySelectorAll('.stratos-highlight');
  highlightedElements.forEach((element) => {
    element.style.background = ''; // Reset the background style
    element.classList.remove('stratos-highlight'); // Remove the highlight class
  });
}

// Highlight the parent element
function highlightElement(elem) {
  elem.style.background = highlight;
  elem.classList.add('stratos-highlight');
}

// Create a MutationObserver to watch for changes to the DOM.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(processNode);
    } else {
      processNode(mutation.target);
    }
  });
});

// Process a single node to highlight text
function processNode(node) {
  if (node.childNodes.length > 0) {
    Array.from(node.childNodes).forEach(processNode);
  }
  if (
    node.nodeType === Node.TEXT_NODE &&
    node.textContent !== null &&
    node.textContent.trim().length > 0
  ) {
    const parent = node.parentElement;
    if (
      parent !== null &&
      (parent.tagName === 'SCRIPT' || parent.style.background === highlight)
    ) {
      // Already highlighted
      return;
    }
    if (node.textContent.includes(textToHighlight)) {
      highlightElement(parent);
    }
  }
}

// Enable the content script by default.
let enabled = true;

chrome.storage.sync.get(['enabled', 'item'], (data) => {
  if (data.enabled === false) {
    enabled = false;
  }
  if (data.item) {
    textToHighlight = data.item;
  }

  // Only start observing the DOM if the extension is enabled and there is text to highlight.
  if (enabled && textToHighlight.trim().length > 0) {
    observer.observe(document, {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
    });
    // Loop through all elements on the page for initial processing.
    processNode(document);
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleHighlight') {
    if (message.enabled) {
      observer.observe(document, {
        attributes: false,
        characterData: true,
        childList: true,
        subtree: true,
      });
      highlightText();
    } else {
      observer.disconnect();
      removeHighlight();
    }
  } else if (message.action === 'updateText') {
    textToHighlight = message.textToHighlight;
    removeHighlight(); // Remove existing highlights
    highlightText(); // Apply new highlights
  }
});
