

function SetPlayer(index){
        var TempString = CurrentPlaylist.LinkList[index].substring("/watch?v=".length,CurrentPlaylist.LinkList[index].indexOf("&list="));

        getYoutubeVideo("vnd.youtube:///"+TempString+"?vndapp=youtube_mobile&vndclient=mv-google&", function(a,b){
          $("#SongName").html(b);
          $("#player").attr("src",a);
          $("#player").load();
        }, function(){
          Notification = navigator.mozNotification.createNotification(
              "Error",
              "copyright protected video accesed. Playback stopped");
          Notification.show();
          window.alert("Sorry! Video deleted or copyright protected");
          $("#SongName").html("ERROR");
          $("#player").attr("src","");
        });

}

function SetPlayerandPlay(index){
        var TempString = CurrentPlaylist.LinkList[index].substring("/watch?v=".length,CurrentPlaylist.LinkList[index].indexOf("&list="));
        
        getYoutubeVideo("vnd.youtube:///"+TempString+"?vndapp=youtube_mobile&vndclient=mv-google&", function(a,b){
          $("#SongName").html(b);
          $("#player").attr("src",a);
          $("#player").load();
          PlayMusic();
        }, function(){
          Notification = navigator.mozNotification.createNotification(
              "Error",
              "copyright protected video accesed. Playback stopped");
          Notification.show();
          window.alert("Sorry! Video deleted or copyright protected");
          $("#SongName").html("ERROR");
          loadNextTrack();
        });
}

function PopulateScrollBar(ArtList){
  $("#scrollbar").html("");
  for (var i = 0; i < ArtList.length; i++) {
    $("#scrollbar").append('<img src="'+ArtList[i]+'" class="AlbumArt"'+"id=img"+i+'></img>');

      //Add the click or touch listeners for every song

      if (Modernizr.touch){
        $("#img"+i).on("touchstart",function(){
          PressTime=false;
          CurrentlyPressed=this;
          Timer=setTimeout(function(){
          PressTime=true;
          alert("long click");
          if(window.confirm("Are you sure you want to remove this song?")){
          var index = CurrentlyPressed.id.substr(3);
          CurrentPlaylist.ImgList.splice(index,1);
          CurrentPlaylist.LinkList.splice(index,1);
          $(CurrentlyPressed).remove();
          }
          },1000);
        });

        $("#img"+i).on("touchend",function(){
          if(!PressTime){
          clearTimeout(Timer);
          // alert("short click");
          var index = this.id.substr(3);
          // Set album image
          CurrentIndex = parseInt(index);
         $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[index]);
          //Pause anything if playing
          if(playing){
          PauseMusic();
          SetPlayerandPlay(CurrentIndex);
          }else{
            SetPlayer(CurrentIndex);
               }
                     }
        });
      }else{
          $("#img"+i).on("mousedown",function(){
          PressTime=false;
          CurrentlyPressed=this;
          Timer=setTimeout(function(){
          PressTime=true;
          // alert("long click");

          if(window.confirm("Are you sure you want to remove this song?")){
          var index = CurrentlyPressed.id.substr(3);
          CurrentPlaylist.ImgList.splice(index,1);
          CurrentPlaylist.LinkList.splice(index,1);
          $(CurrentlyPressed).remove();
          }
          },1000);
        });

        $("#img"+i).on("mouseup",function(){
          if(!PressTime){
          clearTimeout(Timer);
          // alert("short click");
          var index = this.id.substr(3);
          // Set album image
          CurrentIndex = parseInt(index);
         $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[index]);
          //Pause anything if playing
          if(playing){
          PauseMusic();
          SetPlayerandPlay(CurrentIndex);
          }else{
            SetPlayer(CurrentIndex);
               }
                     }
        });
      }



  };
  loadFirstTrack();
}

function GetImgList(Links){
  CurrentPlaylist.ImgList = new Array(Links.length);
  var TempString;
  var TempImgList;

  for (var i = 0; i < Links.length; i++) {
    TempString = Links[i].substring("/watch?v=".length,Links[i].indexOf("&list="));
    CurrentPlaylist.ImgList[i] = "http://img.youtube.com/vi/"+TempString+"/0.jpg";
  };

}

function GetList(YQLInst){
  // console.log("GetList executed");
$.getJSON(YQLInst, 
  function(data) {
    console.log("got list");
    process_list(data);
  });
}

function UrltoYQL(youtubeURL){

  if(youtubeURL.indexOf("playlist?list=")==-1 && youtubeURL.indexOf("&list=")==-1){
    result = youtubeURL;

  }else if(youtubeURL.indexOf("playlist?list=")==-1){
    var ini = youtubeURL.indexOf("&list=");
    if(youtubeURL.indexOf("&index=")!=-1){
      var result = youtubeURL.substring(ini+"&list=".length,youtubeURL.indexOf("&index="));}
    else{
     var result = youtubeURL.substring(ini+"&list=".length);
    }
     }else{
        var ini = youtubeURL.indexOf("playlist?list=");
       var result = youtubeURL.substring(ini+"playlist?list=".length);}
  

  // console.log("result of link: "+result);
  result = result.replace(/&/g,"%26").replace(/=/g,"%3D").replace(/\//g,"%2F").replace(/:/g,"%3A");
  result = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.youtube.com%2Fplaylist%3Flist%3D" +
            result + "%22%20and%20xpath%3D'%2F%2Fa%5Bcontains(%40class%2C%22yt-uix-tile-link%22)%5D'&format=json&diagnostics=true";
  
  // if(result=="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DzHMJ03IhroE%26feature%3Dshare%26list%3DPLLA7WhEJhN5wnO0P6vChk-5YCM067bWnV%22%20and%20xpath%3D'%2F%2Fli%5Bcontains(%40class%2C%22video-list-item%20yt-uix-scroller-scroll-unit%22)%5D'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=process_list"){
  // console.log("yes");}else{
  //   console.log("NO");
  // }
  return result;
}

function process_list(o){
 // console.log("process_list executed");
 if(o.query.results==null){
  alert("Wrong link or ID!");
  location.reload(); 
 }
var result_list = o.query.results.a;
var TempLinkList = new Array;

for(var z=0;z<result_list.length;z++){
  if(result_list[z].href.indexOf("/watch")==-1){
    result_list.splice(z,result_list.length-z);
    z=result_list.length+1;
  }
}

if(CurrentPlaylist.LinkList.length!=0){
  TempLinkList = CurrentPlaylist.LinkList;
}

CurrentPlaylist.LinkList = new Array(result_list.length);
for(var x=0;x<result_list.length;x++){
  // console.log(result_list[x].a.href);
  CurrentPlaylist.LinkList[x]=result_list[x].href;
}

if(TempLinkList.length!=0){
  CurrentPlaylist.LinkList = CurrentPlaylist.LinkList.concat(TempLinkList);
}

GetImgList(CurrentPlaylist.LinkList);
PopulateScrollBar(CurrentPlaylist.ImgList);


}

function updateBar(){
  if(!ThePlayer.ended){
    var size = parseInt(ThePlayer.currentTime*100/ThePlayer.duration);
    ProgressBar.style.width=size+"%";
  }
}

function seek(e){
   if(!ThePlayer.ended){
    var position = e.pageX - SeekBar.offsetLeft;
    var newTime = position*ThePlayer.duration/SeekBar.offsetWidth;
    ThePlayer.currentTime = newTime;
    ProgressBar.style.width=position+"px";
   }
}

function loadNextTrack(){
  if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex++;}
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

      SetPlayerandPlay(CurrentIndex);

      //Bug: PlayMusic() executes before SetPlayer has its callback

}

function loadFirstTrack(){
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);
      SetPlayer(0);

}

function PauseMusic(){
  $("#playImg").attr("src","img/play.png");
      playing=false;
      console.log("switch to paused");
      ThePlayer.pause();
      clearInterval(interval);
}

function PlayMusic(){
  $("#playImg").attr("src","img/pause.png");
      playing=true;
       console.log("switch to playing");
       ThePlayer.play();
       interval = setInterval(function(){updateBar();},500);
}

function ResetProgressBar(){
  ProgressBar.style.width=0;
}

function selectListElement(e){
  var id = e.id;
  console.log(id+"Obj");
  asyncStorage.getItem(id+"Obj",function(value){
    CurrentPlaylist = value;
    PopulateScrollBar(CurrentPlaylist.ImgList);
    $("#blocker").fadeOut();
    $("#loadMenu").html('<button id="Cancel"> Cancel </button>');
  });

}

function PressDown(e){
  PressTime=false;
  CurrentlyPressed=e;
  Timer=setTimeout(function(){
    PressTime=true;
    // alert("long click");
    DeleteElement();
  },1000);
}


function ReleaseUp(e){
  if(!PressTime){
    clearTimeout(Timer);
    // alert("short click");
    selectListElement(e);
  }
}

function DeleteElement(){
  var confirm = window.confirm("Are you sure you want to remove this playlist?");
  PressTime=false;
      if(confirm){
        asyncStorage.getItem("NumSaved",function(value){
          var id = CurrentlyPressed.id;
          var num = parseInt(id.substring(8));
          var SavedPlaylists = parseInt(value);
          asyncStorage.removeItem(id+"Obj");
          $(CurrentlyPressed).remove();
        });
   }
}

function ReturnFalse(){
  return false;
}


//This methods are just me trying out when each event is triggered in the phone
// function alertmousedown(){
//   alert("mouse down");
// }
// function alertmouseup(){
//   alert("mouse up");
// }
// function alerttouchstart(){
//   alert("touch start");
// }
// function alerttouchend(){
//   alert("touch end");
// }

firstExec = true;
document.ready = function(){
 CurrentPlaylist = new Object();
 console.log("ready triggered");
 CurrentPlaylist.LinkList=new Array();
// Tests URLS: http://www.youtube.com/watch?v=JWiwuiT58Yc&playnext=1&list=PL63F0C78739B09958&feature=results_main
//   http://www.youtube.com/watch?v=YwmzXkhBUPs&playnext=1&list=PLB33DC8EF7805EC65&feature=results_main
  if(firstExec){
  //   var INST = UrltoYQL("http://www.youtube.com/watch?v=JWiwuiT58Yc&playnext=1&list=PL63F0C78739B09958&feature=results_main");
  // GetList(INST);

  /* How to process playlist links:
  1. Pass youtube playlist link to UrltoYQL, returns a string with the YQL syntax
  2. Pass YQL syntax to GetList, list of playlist youtube URLS returns in CurrentPlaylist.LinkList variable, list of images in CurrentPlaylist.ImgList.
  */
  CurrentIndex=0;
  PressTime=false;
  Timer = null;
  CurrentlyPressed = null;

   $("#secondForm").get(0).onsubmit = function(){return false;}

  // $("#InitialMenu").get(0).onsubmit = "return false;"
  // $("#LoadMenu").get(0).onsubmit = "return false;"

  playing=false;
  ThePlayer = document.getElementById("player");
  $("#play").click(function(){
    if(playing){
      PauseMusic();
    }else{
      PlayMusic();
    }
  });

  Shuffle = false;

 //Time for the button listeners

  $("#randomB").click(function(){
    if(!Shuffle){
      Shuffle=true;
      $("#randomB").addClass("pressed");
    }else{
      Shuffle=false;
      $("#randomB").removeClass("pressed");
    }
  });

  $("#back").click(function(){
    $("#toast").fadeIn();
    if(CurrentIndex!=0){
      if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex--;}
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

        // SetPlayer(CurrentIndex);
        ResetProgressBar();
        //Pause anything if playing
        if(playing){
        PauseMusic();
        SetPlayerandPlay(CurrentIndex);
        }else{
          SetPlayer(CurrentIndex);
        }

    }
  });


$("#foward").click(function(){
    $("#toast").fadeIn();
    if(CurrentIndex!=CurrentPlaylist.ImgList.length){
      if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex++;}
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

      //SetPlayer(CurrentIndex);
      ResetProgressBar();
        //Pause anything if playing
        if(playing){
        PauseMusic();
        SetPlayerandPlay(CurrentIndex);
        }else{
          SetPlayer(CurrentIndex);
        }

    }
  });

$("#menu").click(function(){
  $("#save").removeClass("inactive");
  $("#IniMenu").removeClass("inactive");
  $("#loadMenu").addClass("inactive");
  $("#blocker").fadeIn();
});

  $("#CurrentlyPlaying").click(function(){
    $("#CurrentlyPlaying").css("animation","rotate 3s");
    $("#CurrentlyPlaying").get(0).addEventListener("animationend",function(){$("#CurrentlyPlaying").css("animation","");},false);
  });

  ThePlayer.addEventListener("ended",loadNextTrack,false);

  ProgressBar = document.getElementById("ProgressBar");
  SeekBar = document.getElementById("SeekBar");
  SeekBar.addEventListener("click",seek,false);
  Scrollbar = document.getElementById("scrollbar");
  

  firstExec=false;
  playlistName = undefined;

  //Here goes anything related to web activity handlers

  if(navigator.mozSetMessageHandler!=undefined){
  navigator.mozSetMessageHandler('activity', function(activityRequest) {
  console.log("web activity triggered");
  if(playing){
    PauseMusic();
  }
  CurrentIndex=0;
  var TheUrl = activityRequest.source.data.url;
  TheUrl = TheUrl.substring(TheUrl.indexOf("///")+3,TheUrl.indexOf("?"));
  TheImg = "http://img.youtube.com/vi/"+TheUrl+"/0.jpg";
  TheUrl = "/watch?v="+TheUrl+"&list=";
  console.log(TheUrl);
  console.log(TheImg);
  if(typeof CurrentPlaylist.LinkList === "undefined"){
    CurrentPlaylist.LinkList = new Array();
  }
  CurrentPlaylist.LinkList.push(TheUrl);
  GetImgList(CurrentPlaylist.LinkList);
  PopulateScrollBar(CurrentPlaylist.ImgList);

});
}
  //Here goes everything related to saving the playlists

  $("#save").click(function(){
      // console.log("saved clicked");
      var confirm = window.confirm("Are you sure you want to save this playlist?");
      if(confirm){
      CurrentPlaylist.playlistName = prompt("Playlist name to save:","Random Playlist");
      asyncStorage.getItem("NumSaved",function(value){
        if(value==null){
          var SavedPlaylists = 0;
        }else{
          var SavedPlaylists = value;
        }
         SavedPlaylists++;
         CurrentPlaylist.number = SavedPlaylists;
         asyncStorage.setItem("NumSaved",SavedPlaylists);
         asyncStorage.setItem("playlist"+SavedPlaylists.toString()+"Obj",CurrentPlaylist);
      });
    }
  });

  //Here goes form management of the initial gialog

  $("#AddYTP").click(function(){
    // $("#AddYTP").after('<div id="URLinput"><input type="text" value="http://www.youtube.com/watch?v=TZGzyftKW2E&list=PL10872F8B9F1071FA"/><button type="button" >OK</button></div>');
    $("#AddYTP").after('<div id="URLinput"><input type="text"/><button type="button" >OK</button></div>');
    $("#AddYTP").remove();
    $("#URLinput > button").click(function(){
      PlaylistUrl = $("#URLinput > input").get(0).value;
      var INST = UrltoYQL(PlaylistUrl);
      GetList(INST);
      $("#blocker").fadeOut();
    });
  });

  $("#BrowsePlaylists").click(function(){

  asyncStorage.getItem("NumSaved",function(value){
    if(value==null){
      window.alert("No playlists saved in memory!");
    }else{

      var SavedPlaylists = parseInt(value);
      for (var i = 1; i<SavedPlaylists+1; i++) {
        asyncStorage.getItem("playlist"+i.toString()+"Obj",function(value){
                  if(value!=null){
                  if (Modernizr.touch){
                  // $("#blocker > form > menu").prepend('<button ontouchstart="PressDown(this)" ontouchend="ReleaseUp(this)" id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#loadMenu").prepend('<button id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#playlist"+value.number.toString()).on("touchstart",function(){PressDown(this);});
                  $("#playlist"+value.number.toString()).on("touchend",function(){ReleaseUp(this);});
                  }else{
                  // $("#blocker > form > menu").prepend('<button onmousedown="PressDown(this)" onmouseup="ReleaseUp(this)"   id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#loadMenu").prepend('<button id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#playlist"+value.number.toString()).on("mousedown",function(){PressDown(this);});
                  $("#playlist"+value.number.toString()).on("mouseup",function(){ReleaseUp(this);});
                  }
                  }
      });
      }
      $("#IniMenu").addClass("inactive");
      $("#loadMenu").removeClass("inactive");
    }
  });

  
  });

  $("#Cancel").click(function(){
    $("#loadMenu").addClass("inactive");
    $("#loadMenu").html('<button id="Cancel"> Cancel </button>');
    $("#IniMenu").removeClass("inactive");
  });

  $("#CloseUp").click(function(){
        $("#blocker").fadeOut();
  });

  // And here goes the listeners to make the loading pop up work

    $("audio").on("waiting",function(){
    // $("#toast").removeClass("hidden");
    $("#toast").contents()[2].nodeValue = "Buffering. Please Wait";
    $("#toast").fadeIn();
  });

  $("audio").on("playing",function(){
    // $("#toast").addClass("hidden");
    $("#toast").fadeOut();
  });

}
}
