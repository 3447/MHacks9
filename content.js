document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.documentElement.style.width = '100%';
document.body.style.width = '100%';

var div = document.createElement('div');
div.style.height = '100%';
div.style.float = 'right';
div.style.width = '30%';
div.style.backgroundColor = 'snow';
div.style.position = 'relative';
div.style.zIndex = '1000';
var ul = document.createElement('ul');
document.body.appendChild(div);
div.appendChild(ul);

function startQuery(quer){
  var searchUrl = 'https://api.wolframalpha.com/v2/query' + '?appid=' + encodeURIComponent(appID) +
  '&input=' + quer + '&format=plaintext&output=JSON';
  var x = new XMLHttpRequest();
//  x.responseType = 'json';
  x.onload = function() {
    var response = JSON.parse(x.response);
    console.log(response);
    if (!response || !response["queryresult"]["success"] || response["queryresult"]["error"] ){
      console.log('Invalid search to Wolfram');
      return;
    }
    var pods = response["queryresult"]["pods"];
    console.log(pods);
    for(i = 0; i < pods.length; i++) {
      var li = document.createElement('li');
      var tex = document.createTextNode(pods[i].subpods[0].plaintext);
//      var descrip = document.createTextNode(pod[i].childNodes[3]]);
      li.appendChild(tex);
//      li2.appendChild(descrip);
      ul.appendChild(li);
//      ul.appendChild(li2);
    };
  };
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', searchUrl, true);
  x.send();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  if(request.message === "open_sidebar"){
    console.log("Selection event. Looking up: " + request.content);
    startQuery(request.content);
    return true;
  }});

/*
var isSidebarOpen = false;
function openInfo(lookup){

return true;
}

var firstChild = document.body.childNodes[0];
var toInsert = document.createElement("div");
toInsert.className = "ui right vertical sidebar";
toInsert.innerHTML = "<a class=\"item\">1</a><a class=\"item\">2</a><a class=\"item\">3</a>"
document.body.insertBefore(toInsert, firstChild);
*/
