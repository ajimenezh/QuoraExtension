// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//Global variable
var QueryString = "";
var PageUrl = "";


// A generic onclick callback function.
function genericOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");

  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));

  QueryString = info.selectionText;
  PageUrl = info.pageUrl;


  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
    }
  });

}

function searchInText(data, callback) {

  var text = data.text;
  var s = data.query;

  //We simplify the strings a bit to it easier to search, and avoid mistakes

  var text2 = "";
  for (var i = 0; i<text.length; i++) {
    if (text[i]=='<') {
      for (var k=i+1; k<text.length; k++) {
        if (text[k]=='>') {
          i = k;
          break;
        }
      }
    }
    else {
      if (text[i]=='&' && text.substr(i,6)=="&nbsp;") i = i+5;
      else {
        var c = text[i].charCodeAt(0);
        if ( (c>=48 && c<=57) || (c>=65 && c<=90) || (c>=97 && c<=122)) {
          text2 += text[i];
        }
      }
    }
  }
  text = text2;

  var s2 = "";
  for (var i = 0; i<s.length; i++) {
    if (s[i]=='<') {
      for (var k=i+1; k<s.length; k++) {
        if (s[k]=='>') {
          i = k;
          break;
        }
      }
    }
    else {
      if (s[i]=='&' && s.substr(i,6)=="&nbsp;") i = i+5;
      else {
        var c = s[i].charCodeAt(0);
        if ( (c>=48 && c<=57) || (c>=65 && c<=90) || (c>=97 && c<=122)) {
          s2 += s[i];
        }
      }
    }
  }
  s = s2;

  if (text.search(s)>=0) {
    callback(null, data.text);
  }
  else {
    callback(null);
  }

}

chrome.extension.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {

    if (PageUrl == "http://www.quora.com/") {

      var text = request.source;

      var isInserted = 0;
      var str = "";

      console.dir(text);

      for (var i=0; i<text.length; i++) {
        if (text[i]=='<' && text.substr(i, 27)=='<div class="pagedlist_item"') {
        //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
          str = "<";
          var have = 1;
          for (var j=i+1; j<text.length; j++) {
            if (text[j]=='<' && text[j+1]=='/') {
              str += '\n';
              have--;
              for (var k=0; k<have+1; k++) str += '  ';
              if (have==0) {
                //str = text.substr(i,j-i+1+5);
                i = j;
                break;
              }
            }
             else if (text[j]=='<' && text[j+1]=='w' && text[j+2]=='b') {
              var tmp = text.substr(j, 50);
              if (tmp.search("</wbr")>=0) {
                str += '\n';
                have++;
                for (var k=0; k<have; k++) str += '  ';
              }
            }
            else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r') || (text[j+1]=='h' && text[j+2]=='r'))) {

              //Change this comparation for a list of enclosing commands

              str += '\n';
              have++;
              for (var k=0; k<have; k++) str += '  ';
            }
            str += text[j];
          }

          console.dir(str);

          searchInText({"text":str, "query": QueryString}, function(err, result) {
            if (typeof result!="undefined" && result && !isInserted) {
              isInserted = 1;
              //console.dir("write");
              //document.getElementById('block').innerHTML = result;

              var answer = "";
              var question = "";
              var user = "";
              var answer_link = "";

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 25)=='<div class="ExpandedQText') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      //str += '\n';
                      have--;
                      //for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      //str += '\n';
                      have++;
                      //for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  answer = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 30)=='<div class="feed_item_question') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      //str += '\n';
                      have--;
                      //for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      //str += '\n';
                      have++;
                      //for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  question = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 24)=='<div class="AnswerHeader') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      //str += '\n';
                      have--;
                      //for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      //str += '\n';
                      have++;
                      //for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  user = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 26)=='<a class="answer_permalink') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  k = i+34;
                  while (result[k]!='"') {
                    answer_link += result[k];
                    k++;
                  }
                }
              }

              var item = {};

              //item.fullText = result;
              item.answer = answer;
              item.user = user;
              item.link = answer_link;
              item.question = question;

              console.dir(item);

              var DB = answersDB;

              DB.open(function() {

                DB.createAnswer(item, function() {
                    //tDB.fetchTodos(function(result) {
                    //  console.dir(result);
                    //});
                })
              });
            }
          });

        }
      }
    }
    else if (PageUrl.search('/answer')==-1) {
      var text = request.source;
      //Check this bug. The function inserts additional code.
      var isInserted = 0;
      var str = "";

      for (var i=0; i<text.length; i++) {
        if (text[i]=='<' && text.substr(i, 26)=='<div class="answer_wrapper') {
        //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
          str = "<";
          var have = 1;
          for (var j=i+1; j<text.length; j++) {
            if (text[j]=='<' && text[j+1]=='/') {
              str += '\n';
              have--;
              for (var k=0; k<have+1; k++) str += '  ';
              if (have==0) {
                str = text.substr(i,j-i+1+5);
                i = j;
                break;
              }
            }
            else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r'))) {

              //Change this comparation for a list of enclosing commands

              str += '\n';
              have++;
              for (var k=0; k<have; k++) str += '  ';
            }
            str += text[j];
          }

          searchInText({"text":str, "query": QueryString}, function(err, result) {
            if (typeof result!="undefined" && result && !isInserted) {
              isInserted = 1;
              //console.dir("write");
              //document.getElementById('block').innerHTML = result;

              var answer = "";
              var question = "";
              var user = "";
              var answer_link = "";

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 26)=='<div class="answer_content') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  answer = str;
                }
              }

              for (var i=0; i<text.length; i++) {
                if (text[i]=='<' && text.substr(i, 36)=='<div class="QuestionTextInlineEditor') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<text.length; j++) {
                    if (text[j]=='<' && text[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += text.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += text[j];
                  }
                  question = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 24)=='<div class="AnswerHeader') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  user = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 26)=='<a class="answer_permalink') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  k = i+34;
                  while (result[k]!='"') {
                    answer_link += result[k];
                    k++;
                  }
                }
              }

              var item = {};

              //item.fullText = result;
              item.answer = answer;
              item.user = user;
              item.link = answer_link;
              item.question = question;

              console.dir(item);
              console.dir("hola");


              var DB = answersDB;

              DB.open(function() {

                DB.createAnswer(item, function() {

                })
              });
            }
          });
        }
      }
    }
    else {
      var text = request.source;
      //Check this bug. The function inserts additional code.
      var isInserted = 0;
      var str = "";

      for (var i=0; i<text.length; i++) {
        if (text[i]=='<' && text.substr(i, 26)=='<div class="answer_wrapper') {
        //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
          str = "<";
          var have = 1;
          for (var j=i+1; j<text.length; j++) {
            if (text[j]=='<' && text[j+1]=='/') {
              str += '\n';
              have--;
              for (var k=0; k<have+1; k++) str += '  ';
              if (have==0) {
                str = text.substr(i,j-i+1+5);
                i = j;
                break;
              }
            }
            else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r'))) {

              //Change this comparation for a list of enclosing commands

              str += '\n';
              have++;
              for (var k=0; k<have; k++) str += '  ';
            }
            str += text[j];
          }

          searchInText({"text":str, "query": QueryString}, function(err, result) {
            if (typeof result!="undefined" && result && !isInserted) {
              isInserted = 1;
              //console.dir("write");
              //document.getElementById('block').innerHTML = result;

              var answer = "";
              var question = "";
              var user = "";
              var answer_link = "";

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 26)=='<div class="answer_content') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  answer = str;
                }
              }

              for (var i=0; i<text.length; i++) {
                if (text[i]=='<' && text.substr(i, 23)=='<a class="question_link') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<text.length; j++) {
                    if (text[j]=='<' && text[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += text.substr(j,4);
                        i = j;
                        break;
                      }
                    }
                    else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += text[j];
                  }
                  question = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 24)=='<div class="AnswerHeader') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  str = "<";
                  var have = 1;
                  for (var j=i+1; j<result.length; j++) {
                    if (result[j]=='<' && result[j+1]=='/') {
                      str += '\n';
                      have--;
                      for (var k=0; k<have+1; k++) str += '  ';
                      if (have==0) {
                        str += result.substr(j,6);
                        i = j;
                        break;
                      }
                    }
                    else if (result[j]=='<' && !(result[j+1]=='/' || (result[j+1]=='i' && (result[j+2]=='m' || result[j+2]=='n')) || (result[j+1]=='b' && result[j+2]=='r'))) {

                      //Change this comparation for a list of enclosing commands

                      str += '\n';
                      have++;
                      for (var k=0; k<have; k++) str += '  ';
                    }
                    str += result[j];
                  }
                  user = str;
                  break;
                }
              }

              for (var i=0; i<result.length; i++) {
                if (result[i]=='<' && result.substr(i, 26)=='<a class="answer_permalink') {
                //if (text[i]=='<' && text.substr(i, 17)=='<div class="w4_5"') {
                  k = i+34;
                  while (result[k]!='"') {
                    answer_link += result[k];
                    k++;
                  }
                }
              }

              var item = {};

              //item.fullText = result;
              item.answer = answer;
              item.user = user;
              item.link = answer_link;
              item.question = question;

              console.dir(item);
              console.dir("hola");


              var DB = answersDB;

              DB.open(function() {

                DB.createAnswer(item, function() {

                })
              });
            }
          });
        }
      }
    }
  }
});


/* Inject the code into the current tab */
//chrome.tabs.executeScript(tab.id, {file: "cursor.js"});


// Create one test item for each context type.
var contexts = ["link", "selection"];
for (var i = 0; i < contexts.length; i++) {
  	var context = contexts[i];
  	var title = "Add item to quora extension";
  	var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  	console.log("'" + context + "' item:" + id);

}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.action == "getHtml") {
        console.log("Got getHTML request.");
        var htmlCode = document.documentElement.outerHTML;
        sendResponse({html: htmlCode});
    } else {
        sendResponse({});
    }
});
