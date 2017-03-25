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
    var importantTitle = {"definition":null, "definitions":null, "synonym":null, "synonyms":null, "antonym":null, "antonyms":null,
                          "pronounciation":null, "image":null, "basic movie information":null, "cast":null, "wikipedia summary":null,
                          "basic series information":null, "latest trade":null, "chemical names and formulas":null,
                          "administrative regions": null, "current weather":null, "unit conversions":null, "basic information":null,
                          "notable facts":null, "location and owner":null, "basic properties":null};
    var importantIDs = {"observancedate (country)":null, "notableeventfordate":null};

    var pods = response["queryresult"]["pods"];
    console.log(pods);

    for(i = 0; i < pods.length; i++) {
      lowercase = pods[i].title.toLowerCase();
      if(lowercase === "wikipedia summary"){
        importantTitle[lowercase] = getWikipediaSummary(quer);
      }
      else if(lowercase in importantTitle){
        importantTitle[lowercase] = pods[i].subpods[0].plaintext;
      }
      else if(lowercase in importantIDs){
        importantIDs[lowercase] = pods[i].subpods[0].plaintext;
      }
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
