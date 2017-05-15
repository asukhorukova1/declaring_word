var pamphletData = new Array();
var videoComments = {};
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
    videoComments[videoId] = response;
    videoComments[videoId].currentComment = 0;
    var firstComment = response.items[videoComments[videoId].currentComment].snippet.topLevelComment.snippet.textDisplay;
    $('.yes').last().html(firstComment);
    // $('.yes').last().append('<div id="comment' + index + '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');
  
  }
}
function getNextComment(videoId){
    videoComments[videoId].currentComment++;
    var nextComment = videoComments[videoId].items[videoComments[videoId].currentComment].snippet.topLevelComment.snippet.textDisplay;
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
  showComments();

}

function showComments(){
  // console.log("init show comments");
  // var displayedvideos = $('.video');
  // for (var a = 0; a < displayedvideos.length; a++){
  //   console.log("loop"+a);

  // };
  //  $(displayedvideos).each(function(){
  //   $(this).hover(function(){
  //     getComments($(this).attr("data-ytid"));
  //   });
  //   });

  //for hover - no click 

//   for(var i = 0; i < 20; i++) {
//     $("#text"+i).hover(function(){
//       if($('body').find('.bigcomment').length == 0){
//         var videoheight= $(this).find("div").height();
//         getComments($(this).find('.video').attr("data-ytid"));
//         $(this).append('<div class="basis" style="z-index:9">');
//         $('.basis').each(function(){
//           for (var g = 0;g < 5;g++){
//             $(this).append('<div id="yes'+g+'" class="yes" style="left:'+g*10+'px; top:'+g*10+'px; z-index:'+(g+10)+'"></div>');
//             $(this).css('top','-'+(videoheight)+'px');
//           };
//           $(".yes").each(function(g){
//             $(this).click(function(){
//               $(this).addClass("bigcomment");
//               $(".bigcomment").css('z-index','3000');
//               toTinderMode();
//             });
//             var row = $(this);
//             setTimeout(function(){
//               row.addClass('border');
//             }, 100*g);
//           });
//         });
//       }
//     },function(){
//       $(".basis:not(.nomouse)").remove();
//     });
//   }
// }



//for click - no hover 

for(var i = 0; i < 20; i++) {
    $("#text"+i).click(function(){
      $(".basis:not(.nomouse)").remove();
      if($('body').find('.bigcomment').length == 0){
        var videoheight= $(this).find("div").height();
        getComments($(this).find('.video').attr("data-ytid"));
        $(this).append('<div class="basis" style="z-index:9" data-ytid="' + $(this).find('.video').attr("data-ytid") + '">');
        $('.basis').each(function(){
          for (var g = 0;g < 5;g++){
            $(this).append('<div id="yes'+g+'" class="yes" style="left:'+g*10+'px; top:'+g*10+'px; z-index:'+(g+10)+'"></div>');
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
            }, 100*g);
          });

        });
      }
    });
  }
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
      $.ajax({ url: 'json.php',
       data: { yes: JSON.stringify(json) },
       type: 'post',
       success: function(output) {
                        // alert(output);
                      }
                    });
      console.log('send yes to php');
    } else if (yesno == 'no') {
      $.ajax({ url: 'json.php',
       data: { no: JSON.stringify(json) },
       type: 'post',
       success: function(output) {
        alert(output);
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
  var commentheight=$(this).height();
  var commentwidth=$(this).width();
  var leftpos = $("#yes0").offset().left;
  var toppos = $("#yes0").offset().top;
  var w = window.innerWidth;
  var h = window.innerHeight;

  if ($(this).find(".buttonyes").length == 0){
    $(this).clearQueue()
          .stop()
          .animate({
      width:commentwidth*2,
      height:commentheight*1.8,
      left:w/2 - leftpos - commentwidth,
      top:h/2 - toppos - ((commentheight*1.8)/2),
    }, 600 );
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
        var yesnotbuttons = $(".yes").last().clone()    
        .children() 
        .remove()   
        .end()      
        .text();
        console.log(yesnotbuttons);


        var videoId = $(this).parent().parent().attr("data-ytid");
        $('.yes').last().html(getNextComment(videoId)+' <button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');

        var data = {
          yesnotbuttons
        };
        saveData('no',data);
        console.log(['saved', data]);


      // $("#yes4").addClass("leftout");
    });
      $(".yes").last().find(':not(button)').addClass("nomouse");

      $('.buttonyes').click(function(){
        // $(this).parent().css("z-index","30000");
        
        // $(this).parent().css("position","fixed");
        // $(this).find(':not(button)').addClass("nomouse");

        console.log('CLICKED YES');

        var yesnotbuttons = $(".yes").last().clone()    
        .children() 
        .remove()   
        .end()      
        .text();
        // console.log(yesnotbuttons);
        // console.log(["$(this).parent().parent()",$(this).parent().parent()]);
        // yesnotbuttons = getComments(data-ytid);;

        var videoId = $(this).parent().parent().attr("data-ytid");
        $('.yes').last().html(getNextComment(videoId)+'<button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');

        // $(".yes").last().html(yesnotbuttons+'this should be the second comment but of course it doesnt work, i love my life<button class="buttonno">Leave this out</button> <button class="buttonyes">keep this</button>');
        

        // $(".yes").last(function(){
        //   console.log("text should change");
        //     $(this).innerHTML(yesnotbuttons);
        //     yesnotbuttons =  "lalalla";
        // });



        var data = {
          yesnotbuttons
        };
        saveData('yes',data);
        console.log(['saved', data]);










        

    });


    $('.text').find(':not(button)').addClass("nomouse");

});
}

function init() {
  createSearchbar();
  showComments();
  $(".clickme").click(function(){
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
  });
};



  window.onload = init;




  

