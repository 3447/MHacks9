function clickHandler(info, tab){
  if(info.menuItemId == "lookup"){
    if(info.selectionText){
      var text = encodeURIComponent(info.selectionText);
      console.log("Looking up " + text);
      chrome.tabs.executeScript(null,
        {code: "var quer = ", text, ";"},
      function() {chrome.tabs.executeScript(null,file:"content.js")});
    }
  }
}

chrome.contextMenus.onClicked.addListener(clickHandler);

chrome.runtime.onInstalled.addListener(function() {
  var contexts = ["selection"];
  var id = chrome.contextMenus.create({"title": "Look This Up", "contexts": contexts, "id": "lookup"});
  console.log("Installed context listener with id " + id);
});
