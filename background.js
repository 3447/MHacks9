function clickHandler(info, tab){
  if(info.menuItemId == "lookup"){
    if(info.selectionText){
      var text = encodeURIComponent(info.selectionText);
      console.log("Looking up " + text);
      chrome.tabs.sendMessage(tab.id, {message: "open_sidebar", content: text});
    }
  }
}

chrome.contextMenus.onClicked.addListener(clickHandler);

chrome.runtime.onInstalled.addListener(function() {
  var contexts = ["selection"];
  var id = chrome.contextMenus.create({"title": "Look This Up", "contexts": contexts, "id": "lookup"});
  console.log("Installed context listener with id " + id);
});
