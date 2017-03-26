
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Message recieved");
  console.log(open);
  if(request.message === "open_sidebar" && open == false){
    console.log("Selection event. Looking up: " + request.content);
    window.url = request.url;
    showPane();
    startQuery(request.content);
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
  '&input=' + quer + '&format=image,plaintext&output=JSON';
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
    var ul = document.getElementById("descrips");
    var li = document.createElement("li");
    getWikipediaSummary(quer, function(htmlstr)  {
      document.getElementById("loading-spinner").remove();
      if (htmlstr)
      {
        console.log("wiki response");
        console.log(htmlstr);
        li.innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + htmlstr + "</p>";
        li.setAttribute("id", "wikipedia-li");
        ul.appendChild(li);
      }
      else
      {
        console.log("Nothing found");
        li.innerHTML = "<p>We apologize, but we could not find anything to match your search.</p>";
        ul.appendChild(li);
      }
    });
    return;
  }
  var importantTitle = {"input interpretation":null, "definition":null, "definitions":null, "synonym":null, "synonyms":null, "antonym":null, "antonyms":null,
                        "pronunciation":null, "basic movie information":null, "basic series information":null, "cast":null,
                        "wikipedia summary":null, "latest trade":null, "chemical names and formulas":null,
                        "administrative regions": null, "current weather":null, "unit conversions":null, "basic information":null,
                        "notable facts":null, "location and owner":null, "basic properties":null, "image":null};
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
    }
    else if(lowercase === "image"){
      importantTitle[lowercase] = pods[i].subpods[0].img.src;
    }
    else if(lowercase === "unit conversions"){
      importantTitle[lowercase] = "";
      for(var j = 0; j < pods[i].numsubpods; j++){
        importantTitle[lowercase] += pods[i].subpods[j].plaintext + "\n";
      }
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
        getWikipediaSummary(pods[0].subpods[0].plaintext, function (htmlstr) {
          if (htmlstr)
          {
            console.log("wiki response");
            console.log(htmlstr);
            var element = document.createElement("li");
            element.innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + htmlstr + "</p>";
            element.setAttribute("id", "wikipedia-li");
            ul.appendChild(element);
          }
        });
      }
      else if(key.toLowerCase() === "image"){
        li.innerHTML = "<p><img class=\"sidebar-image\" src=\"" + importantTitle[key] + "\" /></p>";
        ul.appendChild(li);
        continue;
      }
      else if(key.toLowerCase() == "definition" || key.toLowerCase() == "definitions"){
        li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p>" + toTable(importantTitle[key]) + "<p>" + getDictLink(quer) + "</p>";
        ul.appendChild(li);
        continue;
      }
      else if(key.toLowerCase() == "pronunciation"){
        var engOnly = importantTitle[key].substring(0, importantTitle[key].lastIndexOf("(") - 1);
        li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p><p class=\"value\">" + engOnly + "</p>";
        ul.appendChild(li);
      }
      else{
      li.innerHTML = "<p class=\"key\"><b>" + toTitleCase(key) + "</b></p>" + toTable(importantTitle[key]);
      ul.appendChild(li);
      }
    }
  }
  for(var key in importantIDs){
    if(importantIDs.hasOwnProperty(key) && importantIDs[key] !== null){
      var li = document.createElement("li");
      li.innerHTML = /*"<p class=\"key\"><b>" + toTitleCase(key) + "</b></p>*/"<p class=\"value\">" + importantIDs[key] + "</p>";
      ul.appendChild(li);
    }
  }
  if (ul.childNodes.length < 2)
  {
    var li = document.createElement("li");
    getWikipediaSummary(quer, function(htmlstr)  {
      if (htmlstr)
      {
        console.log("wiki response");
        console.log(htmlstr);
        li.innerHTML = "<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + htmlstr + "</p>";
        li.setAttribute("id", "wikipedia-li");
        ul.appendChild(li);
      }
      else
      {
        console.log("Nothing found");
        li.innerHTML = "<p>We apologize, but we could not find anything to match your search.</p>";
      }
    });
  }
  else if("assumptions" in response["queryresult"]){
    var template = "Assuming \"" + response.queryresult.assumptions.word + "\" is " + response.queryresult.assumptions.values[0].desc + ". Use as ";
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

function getDictionaryDef(term, nodeEle){
  var url = "https://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + encodeURIComponent(term) + "?key=" + encodeURIComponent(dictID);
  var x = new XMLHttpRequest();
  x.onload = function(){
  //  callback("<p class=\"key\"><b>Wikipedia Summary</b></p><p>" + response.query.pages[pageid].extract + "</p>");
    nodeEle.appendChild(document.createTextNode(x.response));
  }
  x.onerror = function(err) {
    console.log(err);
  };
  x.open('GET', url, true);
  x.setRequestHeader( 'Api-User-Agent', 'MHacks9 Research Agent/1.0; github.com/3447/MHacks9' );
  x.send();
}

function getDictLink(quer){
  var linkText = "<a target=\"_blank\" href=\"http://www.dictionary.com/browse/" + quer + "?s=t\">";
  linkText += "Dictionary.com entry for " + decodeURIComponent(quer) + "</a>";
  return linkText;
}

function getWikipediaSummary(term, callback){
  var url = "https://en.wikipedia.org/w/api.php?format=json&action=query&exsentences=3&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(term);
  var x = new XMLHttpRequest();
  x.onload = function(){
    var response = JSON.parse(x.response);
    console.log(response);
    if("missing" in response.query){
      callback("");
      return;
    }
    var pageid = Object.keys(response.query.pages)[0];
    if(response.query.pages[pageid].extract == ""){
      callback("");
      return;
    }
    callback(response.query.pages[pageid].extract);
    return;
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

function listenclick(){
  console.log("loaded dom");
    var sp = document.getElementById('panelright');
    // onClick's logic below:
    document.body.addEventListener('click', function(event) {
      console.log('clicked');
        if (sp.style.display == 'none')
          return;
        else {
          var t = event.target;
          console.log(event.target);
          var out = true;
          if( t === document.body )
          {
            clearQuery();
            endQuery();
          }
          while(t.parentNode != document.body){
            if(t === sp)
            {
              out = false;
              break;
            }
            t = t.parentNode;
          }
          if(out)
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

function toTable(input){
  var rows = input.split("\n");
  var cols = {};
  for(var i = 0; i < rows.length; i++){
    cols[i] = rows[i].split(" |");
  }
  if(rows.length == 1 && cols[0].length == 1)
    return "<p class=\"value\">" + input + "</p>";
  if(cols[rows.length-1][cols[rows.length-1].length-1].lastIndexOf("(") != -1){
  cols[rows.length-1][cols[rows.length-1].length-1] =
    cols[rows.length-1][cols[rows.length-1].length-1].substring(0, cols[rows.length-1][cols[rows.length-1].length-1].lastIndexOf("(") - 1);
  }
  var toReturn = "<table class=\"value\">";
  if(rows.length == 1){
    toReturn +="<tr>";
    for(var i = 0; i < cols[0].length; i++){
      toReturn += "<td>" + cols[0][i] + "</td>";
      if(((i+1) % 4 == 0) && ((i+1) < cols[0].length)){
        toReturn += "</tr><tr>"
      }
    }
    toReturn +="</tr></table>"
    return toReturn;
  }
var flag = true;
for(var i = 1; i < rows.length; i++){
  if(cols[i].length != cols[0].length)
    flag = false;
}
if(!flag){
  toReturn = "<table class=\"sidebar-multitable value\">";
  for(var i = 0; i < rows.length; i++){
    toReturn += "<tr><td>" + cols[i][0] + "</td><td>";
    for(var j = 1; j < cols[i].length - 1; j++){
      toReturn += cols[i][j] + ", ";
    }
    toReturn += cols[i][cols[i].length - 1] + "</td></tr>"
  }
  toReturn += "</table>";
  return toReturn;
}

  for(var i = 0; i < rows.length; i++){
    toReturn += "<tr>";
    for(var j = 0; j < cols[i].length; j++){
      toReturn += "<td>" + cols[i][j] + "</td>";
    }
    toReturn += "</tr>";
  }
  toReturn += "</table>";
  return toReturn;
}
