// ==UserScript==
// @name        [s4s] interface
// @namespace   s4s4s4s4s4s4s4s4s4s
// @include     https://boards.4chan.org/s4s/thread/*
// @include     http://boards.4chan.org/s4s/thread/*
// @version     1.042
// @grant       none
// @author      le fun css man AKA Doctor Worse Than Hitler
// @email       doctorworsethanhitler@gmail.com
// @description Lets you view the greenposts.
// ==/UserScript==
// basic post html
/////////////////////////////////////////////////////////////////////
//////// WANNA SET SOME STUFF UP HERE? GO FOR IT BBY! ///////////////
//////// IT IS THE CONFIGURATION SPOTS WOW            ///////////////
var TEXT_COLOR = '#000'; // any css option for color is fine, eg #000, #000000, red, etc
/////////////////////////////////////////////////////////////////////
// (more to come for above)

//// global variables

// The basic HTML of a 4chan post. split into a couple of parts so we can remove the number field. The fields surrounded with &...& are fields to replace later with post text.
var baseHTML = '<div class="sideArrows" id="sa&AFTER_NO&-&ID&">&gt;&gt;</div><div id="p&AFTER_NO&-&ID&" class="post reply interface" style="background-color: #6f6; border:2px solid green !important;"><div class="postInfo desktop" id="pi&AFTER_NO&-&ID&"><input name="ignore" value="delete" type="checkbox"><span class="nameBlock"><span class="name">&USERNAME&</span> </span> <span class="dateTime" data-utc="&TIMESTAMP&">&DATE& </span>';
var noHTML = '<span class="postNum desktop"><a href="#p&AFTER_NO&-&ID&" title="Link to this post">No.</a><a href="javascript:quote(\'&AFTER_NO&-&ID&\');" title="Reply to this post">&AFTER_NO&-&ID&</a></span>';
var baseHTML2 = '</div><blockquote class="postMessage" style="color:' + TEXT_COLOR + ';" id="m&AFTER_NO&-&ID&"><span>&TEXT&</span></blockquote></div>';

// the url of the interface.
var url = "https://funposting.online/interface/";

// dates
var day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//// functions

// for sending a GET request, used to fetch post JSON from the server.
// ripped from https://stackoverflow.com/questions/247483/http-get-request-in-javascript
var HttpClient = function() {
  this.get = function(aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }
    anHttpRequest.open("GET", aUrl, true);
    anHttpRequest.send(null);
  }
}

// add a post to the proper position in the thread
// TODO: move functionality for building the post's html to its own function.
function addPost(aPost) {

  // date options ripped from the site mentioned in the global vars sections
  var options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };;

  // build the shadow post's html
  var posthtml = baseHTML;
  if (aPost["options"] == "numberless") {
    posthtml += baseHTML2;
    posthtml = posthtml.replace(/\&AFTER_NO\&/g, "XXXXXX");
  } else {
    posthtml += noHTML;
    posthtml += baseHTML2
    posthtml = posthtml.replace(/\&AFTER_NO\&/g, aPost["after_no"]);
  }
  posthtml = posthtml.replace(/\&ID\&/g, aPost["id"]);
  posthtml = posthtml.replace(/\&TEXT\&/g, aPost["text"]);
  posthtml = posthtml.replace(/\&TIMESTAMP\&/g, aPost["timestamp"]);
  var d = new Date(aPost["timestamp"] * 1000);
  posthtml = posthtml.replace(/\&DATE\&/g, d.toLocaleDateString() + ' (' + day_names[d.getDay()] + ') ' + d.toLocaleTimeString());
  posthtml = posthtml.replace(/\&USERNAME\&/g, aPost["username"]);


  // insert the post
  var after_post = document.getElementById('pc' + aPost["after_no"]);


  var post = document.createElement("div");
  post.className = "postContainer replyContainer";
  post.id = 'pc' + aPost["after_no"]; // if the last post in a thread isn't a valid post based on the id, when the thread updates the whole fugging thread is reloaded. this is a hacky work around sorry.
  post.innerHTML = posthtml;

  // add the post
  if (document.getElementById('p' + aPost["after_no"]) !== null) {
    after_post.parentNode.insertBefore(post, after_post.nextSibling);
  } else {
    // an [s4s] post was deleted, so we'll search for an appropriate spot to insert this post.
    // start at the last known existing post
    var currentPost = getThread();

    // go through the remaining posts and find the most recent one that is not more recent than the post the interface post originally came after.
    while (document.getElementById('pc' + currentPost).nextSibling !== null && document.getElementById('pc' + currentPost).nextSibling.id.split('pc')[1] < aPost["after_no"] &&
      document.getElementById('pc' + currentPost).nextSibling.id.split('pc')[1] != currentPost) {
      currentPost = document.getElementById('pc' + currentPost).nextSibling.id.split('pc')[1];
    }
    after_post = document.getElementById('pc' + currentPost);
    after_post.parentNode.insertBefore(post, after_post.nextSibling);
    lastGoodSubstitute = currentPost;
  }

  return;
}

// what thread are we in?
function getThread() {
  var thread = document.getElementsByClassName("thread")[0].id;
  return thread.split('t')[1];
}

function LocalMain() {
  // add in all the posts
  var client = new HttpClient();
  lastGoodSubstitute = getThread();
  client.get(url + 'get.php?thread=' + getThread(), function(response) {
    var arr = JSON.parse(response);

    Object.keys(arr).forEach(function(k) {
      addPost(arr[k]);
    });
  });

  // add the posting form
  var form = document.createElement("div");
  form.innerHTML = '<form name="post" action="' + url + 'post.php" method="post" enctype="multipart/form-data"> <input name="thread" value="' + getThread() + '" type="hidden"> <table class="postForm hideMobile" id="postForm" style="display: table; border: 2px solid #0f0; background-color: #9f9"> <tbody> <tr><td colspan="2" style="text-align:center; background-color:green">[s4s] Interface Green Posting Form</td></tr> <tr data-type="Name"> <td style="background-color:green">Name</td> <td> <input name="username" tabindex="1" placeholder="Anonymous" type="text"> </td> </tr> <tr data-type="Name"> <td style="background-color:green">Options</td> <td> <input name="options" tabindex="1" placeholder="Options" type="text"> </td> </tr> <tr data-type="Options"> <td style="background-color:green">Submit: </td> <td> <input value="Post" tabindex="6" type="submit"> </td> </tr> <tr data-type="Comment"> <td style="background-color:green">Comment</td> <td> <textarea name="text" cols="48" rows="4" tabindex="4" wrap="soft"></textarea> </td> </tr> </tbody> </table> </form>'
  document.getElementsByClassName("thread")[0].parentNode.insertBefore(form, document.getElementsByClassName("thread")[0].nextSibling);

}

// run this stufffffff
window.addEventListener("load", LocalMain, false);