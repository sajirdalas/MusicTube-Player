

function SetPlayer(index,ShouldPlay){
        ResetProgressBar();
        var TempString = CurrentPlaylist.LinkList[index].substring("/watch?v=".length,CurrentPlaylist.LinkList[index].indexOf("&list="));

        getYoutubeVideo("vnd.youtube:///"+TempString+"?vndapp=youtube_mobile&vndclient=mv-google&", function(a,b){
          $("#SongName").html(b);
          $("#player").attr("src",a);
          $("#player").load();
          if(ShouldPlay){
            PlayMusic();
          }
        }, function(e){
          if($("html").attr("lang")=="en"){
          Notification = navigator.mozNotification.createNotification(
              "Error",
              "Error on video. Playback stopped");}
          if($("html").attr("lang")=="es"){
          Notification = navigator.mozNotification.createNotification(
              "Error",
              "Error en el video. Reproducción cancelada");}
          Notification.show();

          if(e.indexOf("<")!=-1){
          window.alert("Error: "+e.substring(0,e.indexOf("<")));}
          else{
          window.alert("Error: "+e); 
          }
          $("#SongName").html("ERROR");
          $("#player").attr("src","");
          loadNextTrack();
        });
        $(".AlbumArt").css("border","0px");
        $("#img"+index).css("border","1px solid yellow");
}

function PopulateScrollBar(ArtList,ShouldLoadFirstTrack){
  $("#scrollbar").html("");
  for (var i = 0; i < ArtList.length; i++) {
    $("#scrollbar").append('<img src="'+ArtList[i]+'" class="AlbumArt"'+"id=img"+i+'></img>');

      //Add the click or touch listeners for every song
          // $("#img"+i).on("taphold",function(e){
          //   console.log("taphold");
          // });
          // $("#img"+i).on("click",function(e){
          //   console.log("tap");
          // });

        $("#img"+i).on("taphold",function(e){
          PressTime=true;
          if($("html").attr("lang")=="en"){
          var Message="Are you sure you want to remove this song?";}
          if($("html").attr("lang")=="es"){
          var Message="¿Seguro que deseas eliminar esta canción?";}  
          if(window.confirm(Message)){
          var index = e.target.id.substr(3);
          CurrentPlaylist.ImgList.splice(index,1);
          CurrentPlaylist.LinkList.splice(index,1);

          //Here is the rutine that reasigns the CurrentIndex
          if(index<CurrentIndex){
            CurrentIndex--;
          }
          else if(index==CurrentIndex){
            if(playing){
              PauseMusic();
            }
            if(CurrentIndex==CurrentPlaylist.LinkList.length){
              CurrentIndex--;
            }
            $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);
            SetPlayer(CurrentIndex,false);
          }
          //And then we recreate the scroll bar contents so each id is in sync
          PopulateScrollBar(CurrentPlaylist.ImgList,false);
          }
          PressTime=false;
        });

        $("#img"+i).on("tap",function(e){
          if(!PressTime){
          var index = e.target.id.substr(3);
          // Set album image
          CurrentIndex = parseInt(index);
         $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[index]);
          //Pause anything if playing
          SetPlayer(CurrentIndex,playing);
          }             
        });
      
      }
      
  if(ShouldLoadFirstTrack){
  loadFirstTrack();}else{
  $("#img"+CurrentIndex).css("border","1px solid yellow");
    // console.log("GOT HERE WITH INDEX "+index);
  }
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
            result + "%22and%20xpath%3D'%2F%2Fdiv%5Bcontains(%40class%2C%22video-info%22)%5D'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
  
  if(result=="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.youtube.com%2Fplaylist%3Flist%3DPL63F0C78739B09958%22and%20xpath%3D'%2F%2Fdiv%5Bcontains(%40class%2C%22video-info%22)%5D'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=process_list"){
  console.log("yes");}else{
    console.log("NO");
    console.log(result);
  }
  return result;
}

function process_list(o){
 console.log("process_list executed");

 //I have to fix this translation issue here
 if(o.query.results==null){
  var ParError = navigator.mozL10n.get('ParError');
  alert(ParError);
  return false;
 }
var result_list = o.query.results.div;
var TempLinkList = new Array;

for(var z=0;z<result_list.length;z++){
  if(result_list[z].div.h3.a.href.indexOf("/watch")==-1){
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
  CurrentPlaylist.LinkList[x]=result_list[x].div.h3.a.href;
}

if(TempLinkList.length!=0){
  CurrentPlaylist.LinkList = CurrentPlaylist.LinkList.concat(TempLinkList);
}

GetImgList(CurrentPlaylist.LinkList);
PopulateScrollBar(CurrentPlaylist.ImgList,true);


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
  ResetProgressBar();
  if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex++;}
      if(CurrentIndex<=CurrentPlaylist.ImgList.length){
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

      SetPlayer(CurrentIndex,true);
      }else{
        PauseMusic();
        CurrentIndex=CurrentPlaylist.ImgList.length;
      }
}

function loadFirstTrack(){
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[0]);
      SetPlayer(0,false);

}

function PauseMusic(){
  $("#toast").fadeOut();
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
  if(!PressTime){
  var id = e.id;
  console.log(id+"Obj");
  asyncStorage.getItem(id+"Obj",function(value){
    CurrentPlaylist = value;
    PopulateScrollBar(CurrentPlaylist.ImgList,true);
    $("#blocker").fadeOut();
    $(".RemovableButton").remove();
    if(playing){
      PauseMusic();
    }
    ResetProgressBar();
  });
  }
}


function DeleteElement(element){
  PressTime=true;
  if($("html").attr("lang")=="en"){
  var confirm = window.confirm("Are you sure you want to remove this playlist?");}
  if($("html").attr("lang")=="es"){
  var confirm = window.confirm("¿Estas seguro que quieres eliminar esta lista de reproducción?");}
      if(confirm){
        asyncStorage.getItem("NumSaved",function(value){
          var id = element.id;
          var num = parseInt(id.substring(8));
          var SavedPlaylists = parseInt(value);
          asyncStorage.removeItem(id+"Obj");
          $(element).remove();
        });
   }
  PressTime=false;
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
SystemTime=1000;
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

  //Global Variable used to keep track of the Index of the song Currently Selected
  CurrentIndex=0;
  //Global Variable used to keep track if long press events have been triggered
  PressTime=false;

  //Added function to check if scroll bar has scrolled

   $("#secondForm").get(0).onsubmit = function(){return false;}

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
    $("#toast").fadeOut();
    if(CurrentIndex!=0){
      if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex--;}
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

        ResetProgressBar();
        //Pause anything if playing
        if(playing){
        PauseMusic();
        SetPlayer(CurrentIndex,true);
        }else{
          SetPlayer(CurrentIndex,false);
        }

    }
  });


$("#foward").click(function(){
    $("#toast").fadeOut();
    if(CurrentIndex!=CurrentPlaylist.ImgList.length){
      if(Shuffle){
        CurrentIndex=Math.floor(Math.random()*CurrentPlaylist.ImgList.length);
      }else{
      CurrentIndex++;}
      $("#CurrentlyPlaying").attr("src",CurrentPlaylist.ImgList[CurrentIndex]);

      ResetProgressBar();
        //Pause anything if playing
        if(playing){
        PauseMusic();
        SetPlayer(CurrentIndex,true);
        }else{
          SetPlayer(CurrentIndex,false);
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

  ThePlayer.addEventListener("ended",function(){loadNextTrack();},false);

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
  var TheUrl = activityRequest.source.data.url;
  TheUrl = TheUrl.substring(TheUrl.indexOf("///")+3,TheUrl.indexOf("?"));
  TheImg = "http://img.youtube.com/vi/"+TheUrl+"/0.jpg";
  TheUrl = "/watch?v="+TheUrl+"&list=";
  console.log(TheUrl);
  console.log(TheImg);
  var FirstTime = (CurrentPlaylist.LinkList.length == 0);
  console.log(FirstTime);
  CurrentPlaylist.LinkList.push(TheUrl);
  GetImgList(CurrentPlaylist.LinkList);
  PopulateScrollBar(CurrentPlaylist.ImgList,FirstTime);

});
}
  //Here goes everything related to saving the playlists

  $("#save").click(function(){
      if($("html").attr("lang")=="en"){
      var confirm = window.confirm("Are you sure you want to save this playlist?");}
      if($("html").attr("lang")=="es"){
      var confirm = window.confirm("¿Estas seguro que quieres guardar esta lista de reproducción? ");}

      if(confirm){
      if($("html").attr("lang")=="en"){
      CurrentPlaylist.playlistName = prompt("Playlist name to save:","");}
      if($("html").attr("lang")=="es"){
      CurrentPlaylist.playlistName = prompt("Nombre de lista a guardar:","");}
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
      alert("Playlist saved");
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
      if($("html").attr("lang")=="en"){
      window.alert("No playlists saved in memory!");}
      if($("html").attr("lang")=="es"){
      window.alert("No hay listas guardadas en memoria");}
    }else{

      var SavedPlaylists = parseInt(value);
      for (var i = 1; i<SavedPlaylists+1; i++) {
        asyncStorage.getItem("playlist"+i.toString()+"Obj",function(value){
                  if(value!=null){

                  // $("#blocker > form > menu").prepend('<button ontouchstart="PressDown(this)" ontouchend="ReleaseUp(this)" id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#loadMenu").prepend('<button class="RemovableButton" id="playlist'+value.number.toString()+'">'+value.playlistName+'</button>');
                  $("#playlist"+value.number.toString()).on("tap",function(evnt){selectListElement(evnt.target)});
                  $("#playlist"+value.number.toString()).on("taphold",function(evnt){DeleteElement(evnt.target)});

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
    $(".RemovableButton").remove();
    $("#IniMenu").removeClass("inactive");
  });

  $("#CloseUp").click(function(){
        $("#blocker").fadeOut();
  });

  // And here goes the listeners to make the loading pop up work

    $("audio").on("waiting",function(){
    // $("#toast").removeClass("hidden");
    // if($("html").attr("lang")=="en"){
    // $("#toast").contents()[2].nodeValue = "Buffering. Please Wait";}
    // if($("html").attr("lang")=="es"){
    // $("#toast").contents()[2].nodeValue = "Cargando. Por favor espere";}
    $("#toast").fadeIn();
  });

  $("audio").on("playing",function(){
    // $("#toast").addClass("hidden");
    $("#toast").fadeOut();
  });

//   $("audio").on("error",function(){
//     alert("Audio error");
//     $("#toast").fadeOut();
// });
}
}
