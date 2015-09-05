chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('index.html')});
});

/*
chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create('index.html', {
  	id: "host",
    bounds: {
      width: 800,
      height: 600,
      left: 100,
      top: 100
    },
    minWidth: 800,
    minHeight: 600,
    frame: 'none'
  });
});
*/