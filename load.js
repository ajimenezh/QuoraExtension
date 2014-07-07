
chrome.browserAction.setPopup({ popup: "/popup.html"});

var searchHelperArray = [];
var NumberItemsLoaded = 0;
var NumberElements = 0;
var LoadMoreItems = 1;


String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}

var DB = answersDB;

function deleteElement() {

  var id = this.parentNode.id;

  DB.open(function() {
    DB.deleteAnswer(id, function() {
    });
  });

  this.parentNode.parentNode.removeChild(this.parentNode);

}


function expandAnswer() {

  //console.dir(this);
  //alert(this.attributes.href.nodeValue);
  //alert(this.id);

  window.location.href = this.attributes.href.nodeValue;

}


DB.open(function() {
  DB.fetchAnswers(function(result) {
    //console.dir(result);

    if (typeof result!="undefined" && result) {

      NumberElements = result.length;

      for (var k=result.length-1; k>=Math.max(0, result.length-5); k--) {

        var id = result[k].timestamp;

        createDiv(id, result);

        NumberItemsLoaded++;

      }

      for (var k=result.length-1; k>=0; k--) {

        var searchableText = "";

        text = "";


        var user = result[k].user;

        //Do not show Suggest Bio.
        for (var i=0; i<user.length; i++) {
          if (user[i]=="s" && user.substr(i,8)=="sig_edit") {
            user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
            break;
          }
        }
        //Do not show (more).
        for (var i=0; i<user.length; i++) {
          if (user[i]=="m" && user.substr(i,9)=="more_link") {
            user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
            break;
          }
        }

        var last = 1;
        var item = {};

        for (var i = 0; i<user.length; i++) {
          if (user[i]=='<') {
            while (user[i]!='>') i++;
            if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
          else {
            if (user[i]!='\n' && user[i]!=' ') searchableText += user[i];
            else if (user[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
        }

        item.searchableTextUser = searchableText;
        searchableText = "";


        var answer = result[k].answer;


        //Hide Suggest Edit.
        for (var i=0; i<answer.length; i++) {
          if (answer[i]=="S" && answer.substr(i,13)=="Suggest Edits") {
            answer = answer.substr(0,i) + answer.substr(i+13, answer.length-i-13);
            break;
          }
        }

        for (var i = 0; i<answer.length; i++) {
          if (answer[i]=='<') {
            while (answer[i]!='>') i++;
            if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
          else {
            if (answer[i]!='\n' && answer[i]!=' ') searchableText += answer[i];
            else if (answer[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
        }

        item.searchableTextAnswer = searchableText;
        searchableText = "";

        var question = result[k].question;

        for (var i = 0; i<question.length; i++) {
          if (question[i]=='<') {
            while (question[i]!='>') i++;
            if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
          else {
            if (question[i]!='\n' && question[i]!=' ') searchableText += question[i];
            else if (question[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
          }
        }

        item.searchableTextQuestion = searchableText;
        searchableText = "";

        item.id = result[k].timestamp;

        searchHelperArray.push(item);

      }

    }

    //console.dir(searchHelperArray);

  });
});


window.onload = function() {

  var onSearch = document.getElementById("header-search");

  onSearch.addEventListener("search", function(e) {
      var val = onSearch.value.toLowerCase();;

      if (val==0) window.location.href = "/popup.html";
      else LoadMoreItems = 0;

      var queries = [];

      var last = 0;
      for (var i=0; i<val.length; i++) {
        if (i==val.length-1 || val[i+1]==' ') {
          queries.push(val.substr(last, i-last+1));
          last = i+2;
        }
      }
      
      var array = [];
      if (val!="") {
        for (var i=0; i<searchHelperArray.length; i++) {
          var item = searchHelperArray[i];

          var score = 0;

          var text = item.searchableTextQuestion.toLowerCase();;
          for (var j=0; j<queries.length; j++) {
            for (var k=0; k<text.length-queries[j].length+1; k++) {
            
              if (text[k]==queries[j][0] && text.substr(k,queries[j].length)==queries[j]) {
                score += 5;
              }
            }
          }

          var text = item.searchableTextUser.toLowerCase();;
          for (var j=0; j<queries.length; j++) {
            for (var k=0; k<text.length-queries[j].length+1; k++) {
            
              if (text[k]==queries[j][0] && text.substr(k,queries[j].length)==queries[j]) {
                score += 10;
              }
            }
          }

          var text = item.searchableTextAnswer.toLowerCase();;

          for (var j=0; j<queries.length; j++) {
            for (var k=0; k<text.length-queries[j].length+1; k++) {
            
              if (text[k]==queries[j][0] && text.substr(k,queries[j].length)==queries[j]) {
                score += 1;
              }
            }
          }

          if (score!=0) {
            array.push({"score": score, "id":item.id});
          }


        }
      }

      var algorithms = new Algorithms;

      console.dir(array);

      algorithms.sort(array, function(error, sortedArray) {

        DB.open(function() {
          DB.fetchAnswers(function(result) {

            var myNode = document.getElementById("myDiv");
            while (myNode.firstChild) {
              myNode.removeChild(myNode.firstChild);
            }
        
            for (var k=0; k<sortedArray.length; k++) {
              id = sortedArray[k].id;

              createDiv(id, result);
            }
          });
        });
      });

  }, false);

  window.addEventListener('scroll', listener, false);
}

var listener = function() {

  if ((document.documentElement.clientHeight - window.innerHeight) == document.body.scrollTop && NumberItemsLoaded<NumberElements && LoadMoreItems) {

    DB.open(function() {
      DB.fetchAnswers(function(result) {
        //console.dir(result);

        if (typeof result!="undefined" && result) {

          var start = result.length-NumberItemsLoaded-1;

          for (var k=start; k>=Math.max(0, start-5); k--) {

            var id = result[k].timestamp;

            createDiv(id, result);

            NumberItemsLoaded++;

          }

          for (var k=result.length-1; k>=0; k--) {

            var searchableText = "";

            text = "";


            var user = result[k].user;

            //Do not show Suggest Bio.
            for (var i=0; i<user.length; i++) {
              if (user[i]=="s" && user.substr(i,8)=="sig_edit") {
                user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
                break;
              }
            }
            //Do not show (more).
            for (var i=0; i<user.length; i++) {
              if (user[i]=="m" && user.substr(i,9)=="more_link") {
                user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
                break;
              }
            }

            var last = 1;
            var item = {};

            for (var i = 0; i<user.length; i++) {
              if (user[i]=='<') {
                while (user[i]!='>') i++;
                if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
              else {
                if (user[i]!='\n' && user[i]!=' ') searchableText += user[i];
                else if (user[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
            }

            item.searchableTextUser = searchableText;
            searchableText = "";


            var answer = result[k].answer;


            //Hide Suggest Edit.
            for (var i=0; i<answer.length; i++) {
              if (answer[i]=="S" && answer.substr(i,13)=="Suggest Edits") {
                answer = answer.substr(0,i) + answer.substr(i+13, answer.length-i-13);
                break;
              }
            }

            for (var i = 0; i<answer.length; i++) {
              if (answer[i]=='<') {
                while (answer[i]!='>') i++;
                if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
              else {
                if (answer[i]!='\n' && answer[i]!=' ') searchableText += answer[i];
                else if (answer[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
            }

            item.searchableTextAnswer = searchableText;
            searchableText = "";

            var question = result[k].question;

            for (var i = 0; i<question.length; i++) {
              if (question[i]=='<') {
                while (question[i]!='>') i++;
                if (searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
              else {
                if (question[i]!='\n' && question[i]!=' ') searchableText += question[i];
                else if (question[i]==' ' && searchableText.length>0 && searchableText[searchableText.length-1]!=' ') searchableText += ' ';
              }
            }

            item.searchableTextQuestion = searchableText;
            searchableText = "";

            item.id = result[k].timestamp;

            searchHelperArray.push(item);

          }

        }

        //console.dir(searchHelperArray);

      });
    });
  }
};

function createDiv(id, result) {
  text = "";

  var k = 0;

  for (var k=0; k<result.length; k++) if (result[k].timestamp==id) {

    var ni = document.getElementById('myDiv');

    var newdiv = document.createElement('div');

    var divIdName = id;

    newdiv.setAttribute('id',divIdName);

    newdiv.setAttribute('class',"element");

    var close_id = "close_" + id;

    var question = "";

    var special = 0;
    var doit = 0;
    for (var i=0; i<result[k].question.length; i++) {
      if (result[k].question[i]=='<' && result[k].question[i+1]=='h' && result[k].question[i+2]=='1') {
        i = i+3;
        question += '<h2>';
        special = 1;
      }
      else if (result[k].question[i]=='<' && result[k].question[i+2]=='h' && result[k].question[i+3]=='1') {
        i = i+4;
        question += '</h2>';
      }
      else if (result[k].question[i-1]=='>' && result[k].question[i-2]=='v' && result[k].question[i-5]=='/' && result[k].question[i]!='<') {
        if (special) {
          question += '<a class="question_link" href="#" >';
          question  += result[k].question[i];
          doit = 1;
        }
      }
      else if (result[k].question[i]=='<' && doit) {
        doit = 0;
        question += '</a>';
        question  += result[k].question[i];
      }
      else question  += result[k].question[i];
    }

    for (var i=0; i<question.length; i++) {
      if (question[i]=='<' && question[i+1]=='h' && question[i+2]=='3') {
        question = question.substr(0,i) + '<h2>' + question.substr(i+4,question.length-i-4);
      }
      else if (question[i]=='<' && question[i+2]=='h' && question[i+3]=='3') {
        question = question.substr(0,i) + '</h2>' + question.substr(i+5,question.length-i-5);
      }
    }

    if (question[1]=='a') {
      question = '<h2>' + question + '</h2>'
    }

    //Do not show edit link.
    for (var i=0; i<question.length; i++) {
      if (question[i]=="e" && question.substr(i,18)=="edit inline_editor") {
        question = question.substr(0,i) + "hidden " + question.substr(i, question.length-i);
        break;
      }
    }

    var user = result[k].user;

    //Do not show Suggest Bio.
    for (var i=0; i<user.length; i++) {
      if (user[i]=="s" && user.substr(i,8)=="sig_edit") {
        user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
        break;
      }
    }
    //Do not show (more).
    for (var i=0; i<user.length; i++) {
      if (user[i]=="m" && user.substr(i,9)=="more_link") {
        user = user.substr(0,i) + "hidden " + user.substr(i, user.length-i);
        break;
      }
    }

    user = '<h3>' + user + '</h3>';

    for (var i=1; i<user.length; i++) {
      if (user[i]=="a" && user.substr(i,15)=='answer_voters">') {
        user = user.substr(0,i) + "voters " + user.substr(i, user.length-i);
        break;
      }
    }


    var answer = result[k].answer;

    //Cut answer.
    for (var i=1; i<answer.length; i++) {
      if (answer[i-1]=='>' && answer.substr(i-11,11)=='container">') {
        var j = i;
        var str = "";
        have = 0;
        while (answer.substr(j,4)!='</di' || have!=0) {
          if (answer.substr(j,4)!='</di') have--;
          if (answer.substr(j,4)!='<div') have++;
          str += answer[j];
          j++;
        }
        var tmp = answer.substr(j, answer.length-i-str.length);;
        answer = answer.substr(0,i);
        answer += '<a href="/answer.html?' + id + '" style="color:black; text-decoration:none">';
        if (str.length>300) {
          var tmp2 = str.substr(0,300);
          var t = tmp2.length-2;
          if (tmp2.substr(tmp2.length-40, 40).search('<')>=0) {
            while (true) {
              if (tmp2[t+1]=='<' || tmp2[t+1]=='>') {
                tmp2 = tmp2.substr(0,t);
                break;
              }
              else t--;
            }
          }
          answer += tmp2;
          answer += '...';
        }
        else {
          answer += str;
        }
        answer += '</a>';
        answer += tmp;
        break;
      }
    }

    var text = question + user;

    for (var i=0; i<text.length; i++) {
       if (text[i] == 'h' && text.substr(i,7)=='href="/') {
         text = text.substr(0,i+6) + 'http://www.quora.com' + text.substr(i+6, text.length-i-5);
       }
    }



    //Hide AnswerActionBar if present
    for (var i=0; i<answer.length; i++) {
      if (answer[i]=='A' && answer.substr(i,15)=="AnswerActionBar") {
        answer = answer.substr(0,i) + "hidden " + answer.substr(i, answer.length-i);
        break;
      }
    }
    //Hide Suggest Edit.
    for (var i=0; i<answer.length; i++) {
      if (answer[i]=="S" && answer.substr(i,13)=="Suggest Edits") {
        answer = answer.substr(0,i) + answer.substr(i+13, answer.length-i-13);
        break;
      }
    }
    //Hide embed quote.
    for (var i=0; i<answer.length; i++) {
      if (answer[i]=="E" && answer.substr(i,11)=="Embed Quote") {
        answer = answer.substr(0,i) + answer.substr(i+11, answer.length-i-11);
        break;
      }
    }
    //Hide embed quote.
    for (var i=0; i<answer.length; i++) {
      if (answer[i]=="q" && answer.substr(i,12)=="quote_button") {
        answer = answer.substr(0,i) + "hidden " + answer.substr(i, answer.length-i);
        break;
      }
    }
    //Introduce "http://quora.com/" in link
    for (var i=0; i<answer.length; i++) {
      if (answer[i]=="a" && answer.substr(i,16)=="answer_permalink") {
        answer = answer.substr(0,i+23) + "http://quora.com" + answer.substr(i+24, answer.length-i-22);
        break;
      }
    }

    text = text + answer;

    for (var i=0; i<text.length; i++) {
       if (text[i] == 't' && text.substr(i,14)=='target="_self"') {
         text = text.substr(0,i+7) + '_blank' + text.substr(i+14, text.length-i-13);
       }
    }

    for (var i=0; i<text.length; i++) {
       if (text[i] == '<' && text.substr(i,3)=='<a ' && text.substr(i,10)!='<a href="/') {
         text = text.substr(0,i+3) + 'target="_blank" ' + text.substr(i+3, text.length-i-2);
       }
    }

    text += '<hr>';


    newdiv.innerHTML = '<a href="#" class="close" id="close_' + id + '">&times;</a>' + text;

    //newdiv.addEventListener('click', deleteElement, false);

    ni.appendChild(newdiv);

    document.getElementById(close_id).addEventListener('click', deleteElement, false);
  
    //document.getElementById(span_id).addEventListener('click', expandAnswer, false);


    console.dir(id);
  }
}