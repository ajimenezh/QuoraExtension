
var db = window.indexedDB.open("TestDB", "Test");

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
      var c = text[i].charCodeAt(0);
      if ( (c>=48 && c<=57) || (c>=65 && c<=90) || (c>=97 && c<=122)) {
        text2 += text[i];
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
      var c = s[i].charCodeAt(0);
      if ( (c>=48 && c<=57) || (c>=65 && c<=90) || (c>=97 && c<=122)) {
        s2 += s[i];
      }
    }
  }
  s = s2;

  //Brute-force solution. TODO Implement O(n+m) algorithm
  for (var i=0; i<text.length-s.length+1; i++) {
    var found = 1;
    for (var k=0; k<s.length; k++) {
      if (k>1) {
        //console.dir(i + " " + k + " " + s.length);
        //console.dir(text.substr(i, s.length));
        //console.dir(s);
      }
      if (s[k]!=text[i+k]) {
        found = 0;
        break;
      }
    }
    if (found) {
      callback(null, data.text);
      break;
    }
  }

  callback(null);

}

fs = require('fs');
fs.readFile('./file.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  text = data;

  var str = "";

  fs.readFile('./input.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var query = data;


    //Check this bug. The function inserts additional code.
    var isInserted = 0;
    var str = "";

    for (var i=0; i<text.length; i++) {
      if (text[i]=='<' && text.substr(i, 34)=='<div class="row feed_item_content"') {
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
          else if (text[j]=='<' && !(text[j+1]=='/' || (text[j+1]=='i' && (text[j+2]=='m' || text[j+2]=='n')) || (text[j+1]=='b' && text[j+2]=='r'))) {

            //Change this comparation for a list of enclosing commands

            str += '\n';
            have++;
            for (var k=0; k<have; k++) str += '  ';
          }
          str += text[j];
        }

        searchInText({"text":str, "query": query}, function(err, result) {
          if (typeof result!="undefined" && result && !isInserted) {
            isInserted = 1;
            fs.writeFile("./output.html", result, function(err) {
              console.dir("write");
              //console.dir(document.getElementById('block'));
              //document.getElementById('block').innerHTML = result;
              var div = document.createElement('div');
              document.body.appendChild(div);
            });
          }
        });

      }
    }
  });
});