
var query = window.location.search;

chrome.browserAction.setPopup({ popup: "/answer.html" + query});

query = query.substr(1, query.length-1);

var DB = answersDB;

DB.open(function() {

  DB.getAnswer(query, function(result) {

      	// var text = result[k].text;
        // var id = result[k].timestamp;
        // //id = result.length-1;

        // var span_id = "";

        // for (var i=0; i<text.length; i++) {
        // 	if (text[i] == 'h' && text.substr(i,6)=="hidden" && text.substr(i-25,25).search("truncated")>=0) {
        // 		text = text.replaceAt(i, "-");
        // 	}
        // 	if (text[i] == 'e' &&text.substr(i,15)=="expanded_q_text") {
        // 		text = text.substr(0,i+15) + ' hidden' + text.substr(i+15, text.length-i-14);
        // 	}
        //   if (text[i] == 'h' && text.substr(i,7)=='href="/') {
        //     text = text.substr(0,i+6) + 'http://www.quora.com' + text.substr(i+6, text.length-i-5);
        //   }
        //   if (text[i] == '#' && text.substr(i,40).search("toggle_link")>=0) {
        //     var j = i+7;
        //     span_id = "";
        //     while (text[j]!='"') {
        //       span_id += text[j];
        //       j++;
        //     }
        //     text = text.substr(0,i) + '/answer.html?' + id + text.substr(i+1, text.length-i-1);
        //   }
        // }

        text = "";

        id = result.timestamp;

        var ni = document.getElementById('myDiv');

        var newdiv = document.createElement('div');

        var divIdName = id;

        newdiv.setAttribute('id',divIdName);

        newdiv.setAttribute('class',"element");

        var question = "";

        var special = 0;
        var doit = 0;
        for (var i=0; i<result.question.length; i++) {
          if (result.question[i]=='<' && result.question[i+1]=='h' && result.question[i+2]=='1') {
            i = i+3;
            question += '<h3>';
            special = 1;
          }
          else if (result.question[i]=='<' && result.question[i+2]=='h' && result.question[i+3]=='1') {
            i = i+4;
            question += '</h3>';
          }
          else if (result.question[i-1]=='>' && result.question[i-2]=='v' && result.question[i-5]=='/' && result.question[i]!='<') {
            if (special) {
              question += '<a class="question_link" href="#" >';
              question  += result.question[i];
              doit = 1;
            }
          }
          else if (result.question[i]=='<' && doit) {
            doit = 0;
            question += '</a>';
            question  += result.question[i];
          }
          else question  += result.question[i];
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
          question = '<h2>' + question + '</h2>';
        }

        //Do not show edit link.
        for (var i=0; i<question.length; i++) {
          if (question[i]=="e" && question.substr(i,18)=="edit inline_editor") {
            question = question.substr(0,i) + "hidden " + question.substr(i, question.length-i);
            break;
          }
        }

        var user = result.user;

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
          if (user[i]==">" && user.substr(i,15)=='answer_voters">') {
            user = user.substr(0,i) + "voters " + user.substr(i, user.length-i);
            break;
          }
        }

        var answer = result.answer;

        var text = question + user;

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

        text = text + answer;

        for (var i=0; i<text.length; i++) {
           if (text[i] == 'h' && text.substr(i,7)=='href="/') {
             text = text.substr(0,i+6) + 'http://www.quora.com' + text.substr(i+6, text.length-i-5);
           }
           if (text[i] == 't' && text.substr(i,14)=='target="_self"') {
             text = text.substr(0,i+7) + '_blank' + text.substr(i+14, text.length-i-13);
           }
        }

        for (var i=0; i<text.length; i++) {
           if (text[i] == '<' && text.substr(i,3)=='<a ') {
             text = text.substr(0,i+3) + 'target="_blank" ' + text.substr(i+3, text.length-i-4);
           }
        }


        newdiv.innerHTML = text;

        //newdiv.addEventListener('click', deleteElement, false);

        ni.appendChild(newdiv);

        //document.getElementById(close_id).addEventListener('click', deleteElement, false);
      
        //document.getElementById(span_id).addEventListener('click', expandAnswer, false);



  })
});
