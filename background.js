// FakeCheck — Background Service Worker (Manifest V3)
// Handles toolbar icon click → injects content script on demand

chrome.action.onClicked.addListener(async (tab) => {
  // Don't inject on chrome:// or edge:// pages
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
    return;
  }

  try {
    // Check if content script is already injected
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!window.__fakecheck_injected
    });

    if (results && results[0] && results[0].result) {
      // Already injected — toggle overlay via message
      chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    } else {
      // First time — inject CSS then JS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['overlay.css']
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
  } catch (err) {
    console.error('[FakeCheck] Injection error:', err);
  }
});
