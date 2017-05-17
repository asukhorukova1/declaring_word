var pamphletData = new Array();
var videoComments = {};

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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

  function httpGetAsyncWithId(theUrl, callback, id, videoId)
  {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(JSON.parse(xmlHttp.responseText), id, videoId);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }

// GETTING COMMENTS

function commentsCallback(response) {
  var parentVideo = 'undefined';
  var videoId = response.items[0].snippet.videoId;
  $('.video').each(function(index,item){
    if($(item).attr('data-ytid') === videoId) {
      parentVideo = item;
    }
  });
  if(parentVideo !== 'undefined') {
    // response.items.forEach(function(item,index) {
    //   $(parentVideo).append('<div id="'+$(parentVideo).attr('data-ytid')+'comment' + index + '" data-ytcom="' + item.snippet.topLevelComment.snippet.textDisplay +  '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');
    // });

    videoComments[videoId] = {};
    videoComments[videoId].items = [];
    response.items.forEach(function(item, index) {
      var comment = {};
      comment.videoId = videoId;
      comment.pamphletText = item.snippet.topLevelComment.snippet.textDisplay;
      videoComments[videoId].items.push(comment);
    });

    videoComments[videoId].currentComment = 0;
    videoComments[videoId].videoTitle = $(parentVideo).text();
    // $('.yes').last().append('<div id="comment' + index + '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');
  
    var firstComment = videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;
    $('.yes').last().html(firstComment);
  }
}
// GETTING LOCAL COMMENTS

function getNextComment(videoId){
    videoComments[videoId].currentComment++;
    if(videoComments[videoId].currentComment > videoComments[videoId].items.length-1) {
      videoComments[videoId].currentComment = videoComments[videoId].items.length-1;
    }
    var nextComment = videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;
    return nextComment;
}

function getComments(id) {
  var request = "https://www.googleapis.com/youtube/v3/commentThreads?maxResults=100&part=snippet&videoId=" + id + "&key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko";
  httpGetAsync(request,commentsCallback);
}

function commentsFilterCallback(response, divId,videoId) {
  if(typeof response.items === 'undefined' || response.items.length === 0) {
    // console.log("remove " + divId + " ::: " + videoId);
    $(divId).remove();
  }
}

function filterByComments(videoId, divId) {
  var request = "https://www.googleapis.com/youtube/v3/commentThreads?maxResults=100&part=snippet&videoId=" + videoId + "&key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko";
  httpGetAsyncWithId(request,commentsFilterCallback,divId,videoId);
}

// GETTING VIDEOS
function videosCallback(response) {
  response.items.forEach(function(item,index) {
    if(item.id.videoId && item.id.videoId !== 'undefined') {
      $('#text'+index).append('<div id="video' + index + '" data-ytid="' + item.id.videoId + '" class="video"><br><br><br><br>'+item.snippet.title+'</div>');
      filterByComments(item.id.videoId,'#text'+index);
    }else{
      $('#text'+index).remove();
    }
  });
  showComments(false);

}

function showComments(local){
//for click - no hover 

for(var i = 0; i < 20; i++) {
    $("#text"+i).click(function(){
      $(".basis:not(.nomouse)").remove();
      if($('body').find('.bigcomment').length == 0){
        var videoheight= $(this).find("div").height();
        var videoId = $(this).find('.video').attr("data-ytid");
        if(!local) {
          getComments(videoId);
        }
        var width = $(window).width();
        var height = $(window).height();
        $(this).append('<div class="basis" style="z-index:9" data-ytid="' + videoId + '">');
        $('.basis').each(function(){
          var yesAmount = 50;
          if(local) {
            if(yesAmount > videoComments[videoId].items.length) {
              yesAmount = videoComments[videoId].items.length+1;
            }
          }

          var offset = $(this).offset();
          var left = offset.left;
          var top = offset.top;
          var topMargin = parseInt($('.navigation').first().css('margin-top'));
          var leftCenter = (width*0.5) - ($(this).width()*0.5);
          var topCenter = ((height*0.5) - ($(this).height()*0.5)) + $(window).scrollTop()+topMargin*1.2;

          for (var g = 0;g < yesAmount; g++){
            var leftGoal = (g+1).map(0,yesAmount,0,leftCenter-left);
            var topGoal = (g+1).map(0,yesAmount,0,topCenter-top);
            $(this).append('<div id="yes'+g+'" class="yes" style="left:'+leftGoal+'px; top:'+topGoal+'px; z-index:'+(g+10)+'"></div>');
            $(this).css('top','-'+(videoheight)+'px');
          };
          $(".yes").each(function(g){
            $(this).click(function(){
              $(this).addClass("bigcomment");
              $(".bigcomment").css('z-index','3000');
              toTinderMode();
            });
            var row = $(this);
            setTimeout(function(){
              row.addClass('border');
            }, (400/yesAmount)*g);
          });

        });
        if(local) {
          var firstComment = videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;
          $('.yes').last().html(firstComment);
        }
      }
    });
  }
}

function getSavedVideos() {
  // console.log(searchInput);
  var request = "http://the-man-called-jakob.com/dev/declaring_word/getJson.php";
  // httpGetAsync(request,savedVideosCallback);
  $.post(request,
                function(output) {
                    savedVideosCallback(JSON.parse(output));
            });
}


// GETTING VIDEOS
function savedVideosCallback(response) {
  console.log(["savedVideosCallback",response]);
  videoComments = {};
  var index = 0;
  for( var i = 0; i < response[0].length; i++) {
    var item = response[0][i].data;
// videoComments[videoId].items[videoComments[videoId].currentComment].snippet.topLevelComment.snippet.textDisplay;

    if($('.video' + item.videoId).length == 0) {
      // if the video does not exist yet
      // create an empty object for the videoId
      videoComments[item.videoId] = {};
      // and create an empty array to keep the items (comments)
      videoComments[item.videoId].items = [];
      // put the data from the comment in
      videoComments[item.videoId].videoId = item.videoId;
      videoComments[item.videoId].videoTitle = item.videoTitle;
      // set current comment to 0
      videoComments[item.videoId].currentComment = 0;
      // add the current item (comment) to the array
      videoComments[item.videoId].items.push(item);

      $('#text'+index).append('<div id="video' + index + '" data-ytid="' + item.videoId + '" class="video video' + item.videoId+ '"><br><br><br><br>'+item.videoTitle+'</div>');
      index++;
      // filterByComments(item.videoId,'#text'+index);
    } else {
      // if the video already exists, only add the the current item (comment) to the array 
      videoComments[item.videoId].items.push(item);
    }
  }
  showComments(true);
}

function getVideos(searchInput) {
  // console.log(searchInput);
  var request = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko&part=snippet&maxResults=50&order=relevance&q="+searchInput+"";
  httpGetAsync(request,videosCallback);

}

function createSearchbar(){

  $("#buttonscheisser").click(function(){
    getVideos($("#searchquery").val());
  });

  $('.theme').each(function(index){
    
    var subThemeText = $(this).text();
    console.log(subThemeText);
    var subThemeContent = $('.' + subThemeText);
    console.log(subThemeContent);

    $(this).click(function(){
      $(subThemeContent).fadeIn("slow");
      $(".subthemes:not(."+subThemeText+")").hide();
      getVideos(subThemeText);
    });
    $(subThemeContent).each(function(){
      $(this).find('.subtheme').click(function(){
        getVideos(subThemeText+" "+($(this).text()));
      })    
    });  
  });
}











function saveData(yesno,data) {
      // this is where we create the object to save
      var json = {};
    // give it a timestamp. why the heck not. it already gets saved with a DIFFERENT timestamp though via the php file
    json.timestamp = new Date().getTime();
    json.data = data;

    /*
     if (yesno == 'yes') {
        return yes;
     } else {
        return no;
     }
     */
     if (yesno == 'yes') {
      $.ajax({ url: 'http://the-man-called-jakob.com/dev/declaring_word/json.php',
       data: { yes: JSON.stringify(json) },
       type: 'post',
       success: function(output) {
                        // alert(output);
                      }
                    });
      console.log('send yes to php');
    } else if (yesno == 'no') {
      $.ajax({ url: 'http://the-man-called-jakob.com/dev/declaring_word/json.php',
       data: { no: JSON.stringify(json) },
       type: 'post',
       success: function(output) {
        // alert(output);
      }
    });
      console.log('send no to php');
    } else {
      console.log('send nothing to php');
    }
  }

  function toTinderMode(){
 // var move = 1;

 $('.yes').each(function(index,item){
  var w = $(window).width();
  var h = $(window).height();
  var commentheight=$(this).height();
  var commentwidth=$(this).width();
  var commentheightGoal=h * 0.8;
  var commentwidthGoal=h * 0.6;
  var leftpos = parseInt($('.yes').last().css('left'));
  var toppos = parseInt($('.yes').last().css('top'));

  if ($(this).find(".buttonyes").length == 0){
    $(this).clearQueue()
          .stop()
          .animate({
      width:commentwidthGoal,
      height:commentheightGoal,
      left:leftpos - ((commentwidthGoal-commentwidth)*0.5),//w/2 - ((commentwidthGoal*0.5) + leftpos),
      top:toppos - (commentheightGoal-commentheight)*0.5//h/2 - ((commentheightGoal*0.5) + toppos)
    }, 1600 );
    $('html,body').animate({ scrollTop: 0 }, 1000);
        // return false; 
      }else{
        $("body").css("position","fixed");
        console.log("body is fixed now");
        $(this).stop();
        // $(this).finish();
      };
      // $("body").css("position","fixed");
      $(this).append('<button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');
      $('.buttonno').click(function(){
        console.log('CLICKED NO');
        var pamphletText = $(".yes").last().clone()    
        .children() 
        .remove()   
        .end()      
        .text();

        var videoId = $(this).parent().parent().attr("data-ytid");
        $('.yes').last().html(getNextComment(videoId)+' <button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');

        var videoTitle = videoComments[videoId].videoTitle;
        var data = {
          pamphletText,
          videoId,
          videoTitle
        };
        saveData('no',data);

      // $("#yes4").addClass("leftout");
    });
      $(".yes").last().find(':not(button)').addClass("nomouse");

      $('.buttonyes').click(function(){
        // $(this).parent().css("z-index","30000");
        
        // $(this).parent().css("position","fixed");
        // $(this).find(':not(button)').addClass("nomouse");

        console.log('CLICKED YES');

        var pamphletText = $(".yes").last().clone()    
        .children() 
        .remove()   
        .end()      
        .text();
        // console.log(yesnotbuttons);
        // console.log(["$(this).parent().parent()",$(this).parent().parent()]);
        // yesnotbuttons = getComments(data-ytid);;

        var videoId = $(this).parent().parent().attr("data-ytid");
        $('.yes').last().html(getNextComment(videoId)+'<button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');
        var videoTitle = videoComments[videoId].videoTitle;
        var data = {
          pamphletText,
          videoId,
          videoTitle
        };
        // $(".yes").last().html(yesnotbuttons+'this should be the second comment but of course it doesnt work, i love my life<button class="buttonno">Leave this out</button> <button class="buttonyes">keep this</button>');
        

        // $(".yes").last(function(){
        //   console.log("text should change");
        //     $(this).innerHTML(yesnotbuttons);
        //     yesnotbuttons =  "lalalla";
        // });

        saveData('yes',data);       

    });


    $('.text').find(':not(button)').addClass("nomouse");

});
}

function init() {
  createSearchbar();
  showComments(false);
  $(".clickme").click(function(){
    console.log("clickme clicked");
    $('.text').remove();
    for (var i=0; i < 20; i++){
      $(".navigation").append("<div id='text"+i+"' class='text'></div>");
            $('.text').each(function(index){
      //       $(this).animate({
      //   margin: 25,

      // },50);
      $(this).css("position","relative");
      $(this).css("margin","2%");
          });
      $(".navigation").css("height","auto");
      $(".text").each(function(){
        var row = $(this);
        setTimeout(function(){
          row.addClass('border');
         

        }, 250*i);
      });
    };
  });
  $(".saved").click(function(){
    $('.text').remove();
    for (var i=0; i < 20; i++){
      $(".navigation").append("<div id='text"+i+"' class='text'></div>");
            $('.text').each(function(index){
      //       $(this).animate({
      //   margin: 25,

      // },50);
      $(this).css("position","relative");
      $(this).css("margin","2%");
          });
      $(".navigation").css("height","auto");
      $(".text").each(function(){
        var row = $(this);
        setTimeout(function(){
          row.addClass('border');
          row.css('color:white');
        }, 250*i);
      });
    };
      getSavedVideos();
  });
};



  window.onload = init;




  

