
/**
* Answers database class
*/
var answersDB = (function() {
  var DB = {};
  var datastore = null;

  DB.open = function(callback) {
    // Database version.
    var version = 1;

    // Open a connection to the datastore.
    var request = indexedDB.open('answers', version);

    // Handle datastore upgrades.
    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = DB.onerror;

      // Delete the old datastore.
      if (db.objectStoreNames.contains('answers')) {
        db.deleteObjectStore('answers');
      }

      // Create a new datastore.
      var store = db.createObjectStore('answers', {
        keyPath: 'timestamp'
      });

    };

    // Handle successful datastore access.
    request.onsuccess = function(e) {
      // Get a reference to the DB.
      datastore = e.target.result;

      // Execute the callback.
      callback();
    };

    // Handle errors when opening the datastore.
    request.onerror = DB.onerror;
  };


  /**
   * Fetch all of the todo items in the datastore.
   */
  DB.fetchAnswers = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['answers'], 'readwrite');
    var objStore = transaction.objectStore('answers');

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);

    var answers = [];

    transaction.oncomplete = function(e) {
      // Execute the callback function.
      callback(answers);

      db.close();
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;

      if (!!result == false) {
        return;
      }

      answers.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = DB.onerror;
  };

  /**
   * Get an answer from the datastore.
   */
  DB.getAnswer = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['answers'], 'readwrite');
    var objStore = transaction.objectStore('answers');

    var request = objStore.get(parseInt(id));

    request.onsuccess = function(e) {
      var result = e.target.result;

      if (!!result == false) {
        return;
      }

      callback(result);

      db.close();
    };

    request.onerror = DB.onerror;
  };


  /**
   * Create a new answer item.
   */
  DB.createAnswer = function(item, callback) {
    // Get a reference to the db.
    var db = datastore;

    // Initiate a new transaction.
    var transaction = db.transaction(['answers'], 'readwrite');

    // Get the datastore.
    var objStore = transaction.objectStore('answers');

    // Create a timestamp for the answer item.
    var timestamp = new Date().getTime();

    // Create an object for the answer item.
    var answer = item;
    answer.timestamp = timestamp;
    //var answer = {
    //  'text': text,
    //  'timestamp': timestamp
    //};

    // Create the datastore request.
    var request = objStore.put(answer);

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
      // Execute the callback function.
      callback(answer);
      db.close();
    };

    // Handle errors.
    request.onerror = DB.onerror;
  };


  /**
  * Delete an answer item.
  */
  DB.deleteAnswer = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['answers'], 'readwrite');
    var objStore = transaction.objectStore('answers');

    var request = objStore.delete(parseInt(id));

    request.onsuccess = function(e) {
      callback();
      db.close();
    }

    request.onerror = function(e) {
      console.log(e);
      db.close();
    }
  };

  // Export the DB object.
  return DB;
}());
