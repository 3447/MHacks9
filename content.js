document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.documentElement.style.width = '100%';
document.body.style.width = '100%';

var open = false;
function showPane()
{
  var div = document.createElement('div');
  div.id = 'sidepane';
  div.style.height = '100%';
  div.style.right = '0px';
  div.style.top = '0px';
  div.style.width = '30%';
  div.style.backgroundColor = 'snow';
  div.style.position = 'fixed';
  div.style.zIndex = '1000';
  var ul = document.createElement('ul');
  ul.id = 'descrips';
  document.body.appendChild(div);
  div.appendChild(ul);
  open = true;
}


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
    var ul = document.getElementById('descrips');
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

function clearQuery()
{
  var clear = document.getElementById('descrips');
  while(clear.firstChild){
    clear.removeChild(clear.firstChild);
  }
}

function endQuery()
{
  var ex = document.getElementById('sidepane');
  document.body.removeChild(ex);
  open = false;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  console.log(open);
  if(request.message === "open_sidebar" && open == false){
    console.log("Selection event. Looking up: " + request.content);
    showPane();
    startQuery(request.content);
    return true;
  }
  else if(request.message === "close_sidebar" && open == true){
    console.log("Closing tab");
    endQuery();
    return true;
  }
  else if(request.message === "open_sidebar" && open == true){
    console.log("Selection. Clearing then looking up: " + request.content);
    clearQuery();
    startQuery(request.content);
    return true;
  }
});

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
