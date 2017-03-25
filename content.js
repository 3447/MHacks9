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
  x.onload = function(){
    parseResponse(x.response);
  }
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', searchUrl, true);
  x.send();
}

function parseResponse(respond){
  var response = JSON.parse(respond);
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

  for(i = 1; i < pods.length; i++) {
    lowercase = pods[i].title.toLowerCase();
    if(lowercase === "wikipedia summary"){
      importantTitle[lowercase] = true;
      getWikipediaSummary(pods[0].subpods[0].plaintext);
    }
    else if(lowercase === "image"){
      importantTitle[lowercase] = pods[i].subpods[0].imagesource;
    }
    else if(lowercase in importantTitle){
      importantTitle[lowercase] = pods[i].subpods[0].plaintext;
    }
    else if(lowercase in importantIDs){
      importantIDs[lowercase] = pods[i].subpods[0].plaintext;
    }
  };
  for(var key in importantTitle){
    if(importantTitle.hasOwnProperty(key) && importantTitle[key] !== null){
      if(key.toLowerCase() === "wikipedia summary"){
        var li = document.createElement("li");
        li.setAttribute("id", "wikipedia-li");
        li.innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p><img alt=\"loading\" src=\"images/loading.gif\" />&nbsp&nbspLoading</p>";
        ul.appendChild(li);
        continue;
      }
      else if(key.toLowerCase() === "image"){
        var li = document.createElement("li");
        li.innerHTML = "<p class=\"key\"><b>Image</b></p><p><img class=\"sidebar-image\" src=\"" + importantTitle[key] + "\" /></p>";
        ul.appendChild(li);
        continue;
      }
      var li = document.createElement("li");
      li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p><p class=\"value\">" + importantTitle[key];
      ul.appendChild(li);
    }
  }
  for(var key in importantIDs){
    if(importantIDs.hasOwnProperty(key) && importantIDs[key] !== null){
      var li = document.createElement("li");
      li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p><p class=\"value\">" + importantIDs[key];
      ul.appendChild(li);
    }
  }
}

function getWikipediaSummary(term){
  var url = "https://en.wikipedia.org/w/api.php?format=json&action=query&exsentences=3&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(term);
  var x = new XMLHttpRequest();
  //  x.responseType = 'json';
  x.onload = function(){
    var response = JSON.parse(x.response);
    if("missing" in response.query){
      document.getElementById("wikipedia-li").remove();
    }
    var pageid = Object.keys(response.query.pages)[0];
    if(response.query.pages[pageid].extract == ""){
      document.getElementById("wikipedia-li").remove();
    }
    document.getElementById("wikipedia-li").innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + response.query.pages.pageid.extract + "</p>"
  }
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', url, true);
  x.setRequestHeader( 'Api-User-Agent', 'MHacks9 Research Agent/1.0; github.com/3447/MHacks9' );
  x.send();
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  if(request.message === "open_sidebar"){
    console.log("Selection event. Looking up: " + request.content);
    startQuery(request.content);
    return true;
  }});
