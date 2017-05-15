// GENERIC HTML REQUEST

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

// GETTING COMMENTS

function commentsCallback(response) {
  response.items.forEach(function(item,index) {
    $('#comments').append('<div id="comment' + index + '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');
  });
}

function getComments(id) {
  var request = "https://www.googleapis.com/youtube/v3/commentThreads?maxResults=100&part=snippet&videoId=" + id + "&key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko";
  httpGetAsync(request,commentsCallback);
}

// GETTING VIDEOS
function videosCallback(response) {
  response.items.forEach(function(item,index) {
    $('#videos').append('<div id="video' + index + '" data-ytid="' + item.id.videoId + '" class="video">'+item.id.videoId+'</div>');
  });
  showComments();
}

function showComments(){
  console.log("init show comments");
  $('.video').click(function(){
    // console.log($(this).attr("data-ytid"));
    getComments($(this).attr("data-ytid"));
  });
}

function getVideos(searchInput) {
  console.log(searchInput);
  var request = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko&part=snippet&maxResults=50&order=relevance&q="+searchInput+"";
  httpGetAsync(request,videosCallback);
}

function createSearchbar(){
  $("body").append('<input id="searchquery" type="text" name="searchvideos">\
  <button id="buttonscheisser" type="button" value="search">');
  $("#buttonscheisser").click(function(){
    getVideos($("#searchquery").val());
  });
}


function init() {
  createSearchbar();


  // getComments("Ca6pjR2TLns");

  // $("body").css("background-color","pink");
}

window.onload = init;