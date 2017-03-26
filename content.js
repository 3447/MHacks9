
function getDictLink(quer){
  var linkText = "<a href=\"http://www.dictionary.com/browse/" + quer + "?s=t\">";
  linkText += "Dictionary.com entry for " + quer + "</a>";
  return linkText;
}

var open = false;
var listen = false;
var url = "";
function showPane()
{
  if (document.getElementById('panelright'))
  {
    var div = document.getElementById('panelright');
    div.style.display = 'block';
  }
  else
  {
    var div = document.createElement('div');
    div.id = 'panelright';
  }

  var loading = document.createElement('div');
  loading.id = "loading-spinner";
  loading.innerHTML = "<p><img alt=\"Loading, Please Wait\" src=\"" + window.url + "\" /></p><h3>Loading...Please Wait</h3>";
  div.appendChild(loading);

  var ul = document.createElement('ul');
  ul.id = 'descrips';
  ul.listStyleType = "none";
  document.body.appendChild(div);
  div.appendChild(ul);
  open = true;
  if (!listen)
  {
    listenclick();
    listen = true;
  }
}

function startQuery(quer){
  var searchUrl = 'https://api.wolframalpha.com/v2/query' + '?appid=' + encodeURIComponent(appID) +
  '&input=' + quer + '&format=plaintext&output=JSON';
  var x = new XMLHttpRequest();
  //  x.responseType = 'json';
  x.onload = function(){
    parseResponse(x.response, quer);
  }
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', searchUrl, true);
  x.send();
}

function parseResponse(respond, quer){
  var response = JSON.parse(respond);
  console.log(response);
  if (!response || !response["queryresult"]["success"] || response["queryresult"]["error"] ){
    console.log('Invalid search to Wolfram');
    return;
  }
  var importantTitle = {"input interpretation":null, "definition":null, "definitions":null, "synonym":null, "synonyms":null, "antonym":null, "antonyms":null,
                        "pronounciation":null, "image":null, "basic movie information":null, "cast":null, "wikipedia summary":null,
                        "basic series information":null, "latest trade":null, "chemical names and formulas":null,
                        "administrative regions": null, "current weather":null, "unit conversions":null, "basic information":null,
                        "notable facts":null, "location and owner":null, "basic properties":null};
  var importantIDs = {"definition:worddata":null, "observancedate (country)":null, "notableeventfordate":null};

  var pods = response["queryresult"]["pods"];
  console.log(pods);
  for(i = 0; i < pods.length; i++) {
    lowercase = pods[i].title.toLowerCase();
    if(lowercase === "input interpretation")
    {
      importantTitle[lowercase] = pods[i].subpods[0].plaintext;
    }
    else if(lowercase === "wikipedia summary"){
      importantTitle[lowercase] = true;
      getWikipediaSummary(pods[i].subpods[0].plaintext);
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

  var ul = document.getElementById("descrips");

  document.getElementById("loading-spinner").remove();
  for(var key in importantTitle){
    var li = document.createElement("li");
    if(importantTitle.hasOwnProperty(key) && importantTitle[key] !== null){
      if (key.toLowerCase() === "input interpretation")
      {
        li.innerHTML = "<p id=\"topheading\">" + importantTitle[key] + "</p>";
        ul.appendChild(li);
      }
      else if(key.toLowerCase() === "wikipedia summary"){
        li.setAttribute("id", "wikipedia-li");
        li.innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p><img alt=\"loading\" src=\"" + window.url + "\" />&nbsp&nbspLoading</p>";
        ul.appendChild(li);
        continue;
      }
      else if(key.toLowerCase() === "image"){
        li.innerHTML = "<p class=\"key\"><b>Image</b></p><p><img class=\"sidebar-image\" src=\"" + importantTitle[key] + "\" /></p>";
        ul.appendChild(li);
        continue;
      }
      else if(key.toLowerCase() == "definition" || key.toLowerCase() == "definitions"){
        li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p><p class=\"value\">" + importantTitle[key] + "</p><p>" + getDictLink(quer) + "</p>";
        ul.appendChild(li);
        continue;
      }
      else{
      li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p><p class=\"value\">" + importantTitle[key];
      ul.appendChild(li);
      }
    }
  }
  for(var key in importantIDs){
    if(importantIDs.hasOwnProperty(key) && importantIDs[key] !== null){
      var li = document.createElement("li");
      li.innerHTML = /*"<p class=\"key\"><b>" + toTitleCase(key) + "</b></p>*/"<p class=\"value\">" + importantIDs[key];
      ul.appendChild(li);
    }
  }

  if("assumptions" in response["queryresult"]){
    var template = "Assuming \"" + response.queryresult.assumptions.word + "\" is " + response.queryresult.assumptions.values[0].desc + ". Us as ";
    template += "<a href='#' id=\"chrome-extension-sidebar-alternates-1\" new-script=\"" + response.queryresult.assumptions.values[1].input + "\">" +
      response.queryresult.assumptions.values[1].desc + "</a> ";
    for(var k = 2; k < response.queryresult.assumptions.count; k++){
      template += "or <a href='#' id=\"chrome-extension-sidebar-alternates-" + k + "\" new-script=\"" + response.queryresult.assumptions.values[k].input + "\">" +
        response.queryresult.assumptions.values[k].desc + "</a> ";
    }
    template += "instead.";
    var alternates = document.createElement("div");
    alternates.innerHTML = template;
    alternates.id = "chrome-extension-sidebar-alternates";
    document.getElementById("descrips").appendChild(alternates);
    for(var k = 1; k < response.queryresult.assumptions.count; k++){
      document.getElementById("chrome-extension-sidebar-alternates-"+ k).addEventListener("click", reload, false);
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
      return;
    }
    var pageid = Object.keys(response.query.pages)[0];
    if(response.query.pages[pageid].extract == ""){
      document.getElementById("wikipedia-li").remove();
      return;
    }
    document.getElementById("wikipedia-li").innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + response.query.pages[pageid].extract + "</p>"
  }
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', url, true);
  x.setRequestHeader( 'Api-User-Agent', 'MHacks9 Research Agent/1.0; github.com/3447/MHacks9' );
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
  var ex = document.getElementById('panelright');
  ex.style.display = 'none';
  open = false;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  console.log(open);
  if(request.message === "open_sidebar" && open == false){
    console.log("Selection event. Looking up: " + request.content);
    showPane();
    startQuery(request.content);
    window.url = request.url;
    return true;
  }
  else if(request.message === "close_sidebar" && open == true){
    console.log("Closing tab");
    clearQuery();
    endQuery();
    return true;
  }
  else if(request.message === "open_sidebar" && open == true){
    console.log("Selection. Clearing then looking up: " + request.content);
    clearQuery();

    var loading = document.createElement('div');
    loading.id = "loading-spinner";
    loading.innerHTML = "<p><img alt=\"Loading, Please Wait\" src=\"" + window.url + "\" /></p><h3>Loading...Please Wait</h3>";
    document.getElementById("descrips").appendChild(loading);

    startQuery(request.content);
    return true;
  }});

function listenclick(){
  console.log("loaded dom");
    var sp = document.getElementById('sidepane');
    // onClick's logic below:
    document.body.addEventListener('click', function(event) {
      console.log('clicked');
        if (sp.style.display == 'none')
          return;
        else {
          if(!(event.target === sp) && !(event.target.parentNode === sp)
            && !(event.target.parentNode.parentNode === sp))
            {
              clearQuery();
              endQuery();
            }
        }
    });
}

function reload(zEvent){
  var input = this.getAttribute("new-script");
  var base = input.substring(3, input.indexOf("-_*"));
  var modifier = input.substring(input.indexOf("-_*")+3, input.length - 1);

  clearQuery();
  var loading = document.createElement('div');
  loading.id = "loading-spinner";
  loading.innerHTML = "<p><img alt=\"Loading, Please Wait\" src=\"" + window.url + "\" /></p><h3>Loading...Please Wait</h3>";
  document.getElementById("descrips").appendChild(loading);

  startQuery(base + "%20" + modifier);
}
