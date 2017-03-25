function clickHandler(info, tab){
  if(info.menuItemId == "lookup"){
    if(info.selectionText){
      var text = encodeURIComponent(info.selectionText);
      console.log("Looking up " + text);
      // chrome.tabs.executeScript(null,
      //   {code: "var quer = ", text, ";"},
      // function() {chrome.tabs.executeScript(null,file:"content.js")});
      chrome.tabs.sendMessage(tab.id, {message: "open_sidebar", content: text});
    }
  }
}

function keyHandler(command, tab){
  if (command == "Look_up")
  {
    console.log("lookup");
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
      console.log(selection);
        if (selection[0].length > 0)
        {
          console.log("highlighted");
          chrome.tabs.sendMessage(tab.id, {message: "open_sidebar", content: selection[0]});
        }
        else {
          console.log("empty");
          chrome.tabs.sendMessage(tab.id, {message: "close_sidebar", content: ""});
        }
    });
    //chrome.tabs.sendMessage(tab.id, {message: "toggle_sidebar", content:})
  }
}

chrome.contextMenus.onClicked.addListener(clickHandler);

chrome.runtime.onInstalled.addListener(function() {
  var contexts = ["selection"];
  var id = chrome.contextMenus.create({"title": "Look This Up", "contexts": contexts, "id": "lookup"});
  console.log("Installed context listener with id " + id);
});


chrome.commands.onCommand.addListener(function(command) {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabArray) { keyHandler(command, tabArray[0]); }
    );
});
