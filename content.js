chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  if(request.message === "open_sidebar"){
    console.log("Selection event. Looking up: " + request.content);
    openInfo(request.content);
  }
});

var isSidebarOpen = false;
function openInfo(lookup){

  return true;
}

var firstChild = document.body.childNodes[0];
var toInsert = document.createElement("div");
toInsert.className = "ui right vertical sidebar";
toInsert.innerHTML = "<a class=\"item\">1</a><a class=\"item\">2</a><a class=\"item\">3</a>"
document.body.insertBefore(toInsert, firstChild);
