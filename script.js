(function(seconds) {
    var refresh,       
        intvrefresh = function() {
            clearInterval(refresh);
            refresh = setTimeout(function() {
               location.href = location.href;
            }, seconds * 1000);
            
        };

    $(document).on('keypress click', function() { intvrefresh() });
    intvrefresh();
    $('body').scrollTop(0);

}(60));



var pamphletData = new Array();
var videoComments = {};

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
var keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1
};
function rotate(){
 $('.text').each(function(i,e){
    $(e).css('-webkit-transform', 'rotate('+((Math.random()*5)-2)+'deg)');
    $(e).css('transform', 'rotate('+((Math.random()*5)-2)+'deg)');
    $(e).css('z-index', 1);
    // $('.navigation').css('-webkit-transform', 'rotate(-3deg)');
  });}

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
    document.onkeydown = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}



function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetAsyncWithId(theUrl, callback, id, videoId) {
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
    $('.video').each(function(index, item) {
        if ($(item).attr('data-ytid') === videoId) {
            parentVideo = item;
        }
    });
    if (parentVideo !== 'undefined') {
        // response.items.forEach(function(item,index) {
        //   $(parentVideo).append('<div id="'+$(parentVideo).attr('data-ytid')+'comment' + index + '" data-ytcom="' + item.snippet.topLevelComment.snippet.textDisplay +  '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');
        // });

        videoComments[videoId] = {};
        videoComments[videoId].items = [];
        response.items.forEach(function(item, index) {
            var comment = {};
            comment.videoId = videoId;
            comment.pamphletText = item.snippet.topLevelComment.snippet.textDisplay;
            comment.author = item.snippet.topLevelComment.snippet.authorDisplayName;
            comment.date= item.snippet.topLevelComment.snippet.publishedAt;
            videoComments[videoId].items.push(comment);
        });

        videoComments[videoId].currentComment = 0;
        videoComments[videoId].videoTitle = $(parentVideo).text();
        // $('.yes').last().append('<div id="comment' + index + '" class="comment">'+item.snippet.topLevelComment.snippet.textDisplay+'</div>');

        var firstComment = "<p class=commentauthor>"+videoComments[videoId].items[videoComments[videoId].currentComment].author+", <span class=date>"+videoComments[videoId].items[videoComments[videoId].currentComment].date.replace("T","  ").replace(".000Z","")+"</span>:</p>"+videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;

        $('.yes').last().html(firstComment);
    }
}
// GETTING LOCAL COMMENTS

function getNextComment(videoId) {
    videoComments[videoId].currentComment++;
    if (videoComments[videoId].currentComment > videoComments[videoId].items.length - 1) {
        videoComments[videoId].currentComment = videoComments[videoId].items.length - 1;
    }
    console.log(videoComments[videoId].items[videoComments[videoId].currentComment]);
    var nextComment = "<p class=commentauthor>"+videoComments[videoId].items[videoComments[videoId].currentComment].author+", <span class=date>"+videoComments[videoId].items[videoComments[videoId].currentComment].date.replace("T","  ").replace(".000Z","")+"</span>:</p>"+videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;
    return nextComment;
}

function getComments(id) {
    var request = "https://www.googleapis.com/youtube/v3/commentThreads?maxResults=100&part=snippet&videoId=" + id + "&key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko&authorDisplayName&publishedAt";
    httpGetAsync(request, commentsCallback);
}

function commentsFilterCallback(response, divId, videoId) {
    if (typeof response.items === 'undefined' || response.items.length === 0) {
        // console.log("remove " + divId + " ::: " + videoId);
        $(divId).remove();
    }
}

function filterByComments(videoId, divId) {
    var request = "https://www.googleapis.com/youtube/v3/commentThreads?maxResults=100&part=snippet&videoId=" + videoId + "&key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko&authorDisplayName";
    httpGetAsyncWithId(request, commentsFilterCallback, divId, videoId);
}

// GETTING VIDEOS
function videosCallback(response) {
    response.items.forEach(function(item, index) {
        if (item.id.videoId && item.id.videoId !== 'undefined') {
            $('#text' + index).append('<div id="video' + index + '" data-ytid="' + item.id.videoId + '" class="video">' + item.snippet.title + '</div>');
            filterByComments(item.id.videoId, '#text' + index);
        } else {
            $('#text' + index).remove();
        }
    });
    showComments(false);

}

function showComments(local) {
    //for click - no hover 

    for (var i = 0; i < 20; i++) {
        $("#text" + i).click(function() {
          $('.text').not(this).css('z-index','1');
          $(this).css('z-index','20');
            $(".basis:not(.nomouse)").remove();
            $('savedvid').remove();
            if ($('body').find('.bigcomment').length == 0) {

                var videoheight = $(this).find("div").height();
                var videoId = $(this).find('.video').attr("data-ytid");
                if (!local) {
                    getComments(videoId);
                }
                var width = $(window).width();
                var height = $(window).height();

                $(this).append('<div class="basis" style="z-index:9" data-ytid="' + videoId + '">');
                $('.basis').each(function() {
                    var yesAmount = 20;
                    if (local) {
                        if (yesAmount > videoComments[videoId].items.length) {
                            yesAmount = videoComments[videoId].items.length + 1;
                        }
                    }
                    // $('.basis savedvid').each(function(){
                    // var yesAmount = 50;
                    // if(local) {
                    //   if(yesAmount > videoComments[videoId].items.length) {
                    //     yesAmount = videoComments[videoId].items.length+1;
                    //   }
                    // }

                    var offset = $(this).offset();
                    var left = offset.left;
                    var top = offset.top;
                    var topMargin = parseInt($('.navigation').first().css('margin-top'));
                    var leftCenter = (width * 0.5) - ($(this).width() * 0.5);
                    var topCenter = ((height * 0.5) - ($(this).height() * 0.5)) + $(window).scrollTop() + topMargin * 1.2;

                    for (var g = 0; g < yesAmount; g++) {
                        var leftGoal = (g + 1).map(0, yesAmount, 0, leftCenter - left);
                        var topGoal = (g + 1).map(0, yesAmount, 0, topCenter - top);
                        $(this).append('<div id="yes' + g + '" class="yes" style="left:' + leftGoal + 'px; top:' + topGoal + 'px; z-index:' + (g + 10) + '"></div>');
                        $(this).css('top', '-' + (videoheight) + 'px');
                        if ($("*").hasClass("allblue")){
                            console.log("now yellow");
                            $(".border").addClass("allblue");
                        }
                    };
                    $(".yes").each(function(g) {
                        var offsetyes = $(this).offset();
                        var leftyes = offset.left;
                        var topyes = offset.top;
                        var topMarginyes = parseInt($('.navigation').first().css('margin-top'));
                        var leftCenteryes = (width * 0.5) - ($(this).width() * 0.5);
                        var topCenteryes = ((height * 0.5) - ($(this).height() * 0.5)) + $(window).scrollTop() + topMargin * 1.7;
                        $(this).click(function() {
                          // disableScroll();
                            $(this).addClass("bigcomment");

                            resize();
                            $(".bigcomment").css('z-index', '3000');
                            $('.buttonclose').remove();
                            // $(this).click(function(){


                            $('body').append('<button class="buttonclose" style="z-index:3000">close</button>');
                            $('.buttonclose').css('top', topCenteryes);
                            $('.buttonclose').css('left', '30px');



                            toTinderMode();
                        });
                        var row = $(this);
                        setTimeout(function() {
                            row.addClass('border');
                        }, (700 / yesAmount) * g);
                    });

                });
                if (local) {
                    var firstComment = "<p class=commentauthor>"+videoComments[videoId].items[videoComments[videoId].currentComment].author+", <span class=date>"+videoComments[videoId].items[videoComments[videoId].currentComment].date.replace("T","  ").replace(".000Z","")+"</span>:</p>"+videoComments[videoId].items[videoComments[videoId].currentComment].pamphletText;
                    setTimeout(function() {
                        $('.yes').last().html(firstComment); ////
                    }, 700);
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
    console.log(["savedVideosCallback", response]);
    videoComments = {};
    var index = 0;

    for (var i = 0; i < response[0].length; i++) {
        var item = response[0][i].data;
        // videoComments[videoId].items[videoComments[videoId].currentComment].snippet.topLevelComment.snippet.textDisplay;

        if ($('.video' + item.videoId).length == 0) {
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

            $('#text' + index).append('<div id="video' + index + '" data-ytid="' + item.videoId + '" class="video savedvid video' + item.videoId + '">' + item.videoTitle + '</div>');
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
    var request = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyBZwhGeg3VhbhNYJ6hsfjWy-ihp3RyHRko&part=snippet&maxResults=50&order=relevance&q=" + searchInput + "";
    httpGetAsync(request, videosCallback);

}

function createSearchbar() {

    $("#buttonscheisser").click(function() {
      $('.description').fadeOut("fast");
                for (var i = 0; i < 6; i++) {
                setTimeout(function() {
                 rotate();
                }, 250*i);
            };
        getVideos($("#searchquery").val());

    });

    $('.theme').each(function(index) {

        var subThemeText = $(this).text();
        console.log(subThemeText);
        var subThemeContent = $('.' + subThemeText);
        console.log(subThemeContent);

        $(this).click(function() {
          $('.description').fadeOut("fast");
               for (var i = 0; i < 6; i++) {
                setTimeout(function() {
                 rotate();
                }, 250*i);
            };
            $(subThemeContent).fadeIn("slow");
            $(".subthemes:not(." + subThemeText + ")").hide();
            getVideos(subThemeText);
        });
        $(subThemeContent).each(function() {
            $(this).find('.subtheme').click(function() {
              $('.description').fadeOut("fast");
                getVideos(subThemeText + " " + ($(this).text()));
                        for (var i = 0; i < 6; i++) {
                setTimeout(function() {
                 rotate();
                }, 250*i);
            };
            })
        });

    });
}









function saveData(yesno, data) {
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
        $.ajax({
            url: 'http://the-man-called-jakob.com/dev/declaring_word/json.php',
            data: {
                yes: JSON.stringify(json)
            },
            type: 'post',
            success: function(output) {
                // alert(output);
            }
        });
        console.log('send yes to php');
    } else if (yesno == 'no') {
        $.ajax({
            url: 'http://the-man-called-jakob.com/dev/declaring_word/json.php',
            data: {
                no: JSON.stringify(json)
            },
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


function toTinderMode() {

    // var move = 1;


    var lastIndex = $('.yes').length-1;

    $('.yes').each(function(index, item) {
        if(index != lastIndex) {
          $(this).remove();
        }
        if ($(this).find(".buttonyes").length == 0 && index == lastIndex) {
            var w = $(window).width();
            var h = $(window).height();
            var commentheightGoal = h * 0.8;
            var commentwidthGoal = h * 0.6;
            var leftpos = parseInt($(this).css('left'));
            var toppos = parseInt($(this).css('top'));
            var commentheight = $(this).height();
            var commentwidth = $(this).width();

            enableScroll();

            $(this).clearQueue()
                .stop()
                .animate({
                    width: commentwidthGoal,
                    height: commentheightGoal,
                    left: leftpos - ((commentwidthGoal - commentwidth) * 0.5), //w/2 - ((commentwidthGoal*0.5) + leftpos),
                    top: toppos - (commentheightGoal - commentheight) * 0.5 //h/2 - ((commentheightGoal*0.5) + toppos)
                }, 1600);
            // $('html,body').animate({ scrollTop: 0 }, 1000);
            // return false; 
            if ($('body').find(".savedvid").length == 0) {
              // $('.buttonyes').remove();
              // $('.buttonno').remove();
              $(this).last().append('<button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');
            } else {
                var videoId = $(this).parent().attr('data-ytid');
                var buttonyestext = '<button class="buttonyes" style="z-index:3000">next</button>';
                if(videoComments[videoId].currentComment >= videoComments[videoId].items.length - 1) {
                    var buttonyestext = '';
                }
                $(this).last().append(buttonyestext);

            }
        } else {
            disableScroll();
            $(this).stop();
        };

        // $("body").css("position","fixed");
        

        $('.buttonno').click(function() {
            console.log('CLICKED NO');
            var pamphletText = $(".yes").last().clone()
                .children()
                .remove()
                .end()
                .text();

            var videoId = $(this).parent().parent().attr("data-ytid");

            var videoTitle = videoComments[videoId].videoTitle;
            var data = {
                pamphletText,
                videoId,
                videoTitle
            };

            saveData('no', data);
            if ($('body').find(".savedvid").length == 0) {
                $('.yes').last().html(getNextComment(videoId) + ' <button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');
                var videoTitle = videoComments[videoId].videoTitle;
                var data = videoComments[videoId].items[videoComments[videoId].currentComment];
                data.videoTitle = videoTitle;
                saveData('yes', data);
            } else {
                var buttonyestext = '<button class="buttonyes" style="z-index:3000">next</button>';
                if(videoComments[videoId].currentComment >= videoComments[videoId].items.length - 1) {
                    buttonyestext = '';
                }
                $('.yes').last().html(getNextComment(videoId) + buttonyestext);
            }

        });
        $(".yes").last().find(':not(button)').addClass("nomouse");
        $("*:not(button)").addClass("nomouse");
        $(".theme").addClass("nomouse");
        $(".subtheme").addClass("nomouse");

        $('.buttonclose').click(function() {
            console.log("scroll should be enabled now");


            $('.bigcomment').remove();
            $('.basis').remove();
            // $('.savedvid').remove();
            $('.yes').remove();
            $('.buttonyes').remove();
            $('.buttonclose').remove();
            $('*').removeClass("nomouse");
            enableScroll();
            if ($('body').find(".savedvid").length > 0) {
                for (var videoId in videoComments) {
                    videoComments[videoId].currentComment = 0;
                }
            }

            // $('.buttonclose').remove();
        });


        $('.buttonyes').click(function() {
            console.log('CLICKED YES');

            var pamphletText = $(".yes").last().clone()
                .children()
                .remove()
                .end()
                .text();
            var videoId = $(this).parent().parent().attr("data-ytid");

            if ($('body').find(".savedvid").length == 0) {
                $('.yes').last().html(getNextComment(videoId) + '<button class="buttonno" style="z-index:3000">Leave this out</button> <button class="buttonyes" style="z-index:3000">keep this</button>');
                var videoTitle = videoComments[videoId].videoTitle;
                var data = videoComments[videoId].items[videoComments[videoId].currentComment];
                data.videoTitle = videoTitle;
                saveData('yes', data);
            } else {
                var buttonyestext = '<button class="buttonyes" style="z-index:3000">next</button>';
                if(videoComments[videoId].currentComment >= videoComments[videoId].items.length - 1) {
                    buttonyestext = '';
                }
                $('.yes').last().html(getNextComment(videoId) +  buttonyestext);
            }

        });


        $('.text').find(':not(button)').addClass("nomouse");

    });
}

function resize() {

    $(function() {

        var $quote = $(".bigcomment");

        var $numWords = $quote.text().split(" ").length;
        console.log($numWords);

        if (($numWords >= 1) && ($numWords < 10)) {
            $quote.css("font-size", "36px");
            $quote.css("line-height", "40px");
        } else if (($numWords >= 10) && ($numWords < 20)) {
            $quote.css("font-size", "32px");
            $quote.css("line-height", "37px");
        } else if (($numWords >= 20) && ($numWords < 30)) {
            $quote.css("font-size", "28px");
            $quote.css("line-height", "33px");
        } else if (($numWords >= 30) && ($numWords < 40)) {
            $quote.css("font-size", "24px");
            $quote.css("line-height", "29px");
        } else if (($numWords >= 40) && ($numWords < 50)) {
            $quote.css("font-size", "20px");
            $quote.css("line-height", "24px");
        } else{
          $quote.css("font-size", "17px");
          $quote.css("line-height", "20px");
        }

    });
}

function init() {
  $("#info").click(function(){
    $(".text").remove();
    $('.description').fadeIn("fast");
    $('#subthemes').hide();
  })
    $(".buttonabout").click(function(){
    $(".text").remove();
    $('.description').fadeIn("fast");
    $('#subthemes').hide();
  })
    $('body').scrollTop(0);


  // rotate();
    createSearchbar();
    showComments(false);
    $(".clickme").click(function() {
      $('.description').fadeOut("fast");
        console.log("clickme clicked");
        $('.text').remove();

        for (var i = 0; i < 20; i++) {
            $(".navigation").append("<div id='text" + i + "' class='text'></div>");
            $('.text').each(function(index) {
                //       $(this).animate({
                //   margin: 25,

                // },50);
                $(this).css("position", "relative");
                $(this).css("margin", "2%");
            });

            $(".navigation").css("height", "auto");
            $(".text").each(function() {
                var row = $(this);
                setTimeout(function() {
                    row.addClass('border');


                }, 250 * i);
            });
        };
    });
    $('button:not(.saved)').click(function(){
        $('*').removeClass("allblue");
    })

    $(".saved").click(function() {

      $('.description').fadeOut("fast");
      $('.text').remove();

        for (var i = 20; i > -1; i--) {
            $(".navigation").append("<div id='text" + i + "' class='text'></div>"), 250*(i);
            $('.text').each(function(i) {
                      $(this).animate({
                  margin: 15,

                },250*(i));
                $(this).css("position", "relative");
                $(this).css("float","right");
                $(this).css("margin", "2%");
            });
            $(".navigation").css("height", "auto");
            $(".text").each(function() {
                var row = $(this);
                setTimeout(function() {
                    row.addClass('border');
                    row.css('color:white');
                });
            });
        };


        getSavedVideos();
        resize();
             for (var i = 0; i < 6; i++) {
                setTimeout(function() {
                 rotate();
                }, 250*i);
            };
            $("*:not(.yes)").addClass("allblue");  
            // $("body").addClass("allblue");  
            // $("#rightmenucell").addClass("allblue");  
            // $("#info").addClass("allblue");  
            // $(".menucell").addClass("allblue");  


    });

};



window.onload = init;




  

