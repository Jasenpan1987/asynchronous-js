function fakeAjax(url, cb) {
  var fake_responses = {
    file1: "The first text",
    file2: "The middle text",
    file3: "The last text"
  };
  var randomDelay = (Math.round(Math.random() * 1e4) % 8000) + 1000;

  console.log("Requesting: " + url);

  setTimeout(function() {
    cb(fake_responses[url]);
  }, randomDelay);
}

function output(text) {
  console.log(text);
}

// **************************************

function getFile(file) {
  // what do we do here?
  var callbackPassedIn; // this variable will save the callback that passed in from the place where we make the thunk
  var fileContent; // this variable will save the text that come back from the fakeAjax

  fakeAjax(file, function(text) {
    if (!callbackPassedIn) {
      // by the time we got the response, we haven't call the thunk created previously
      fileContent = text; // we save the value in the closure and call later when we call the thunk
    } else {
      // by the time we got the response, we already called the thunk, means we got a callbackPassedIn
      callbackPassedIn(text);
    }
  });

  return function thunked(cb) {
    if (!fileContent) {
      // by the time we call the thunk, we haven't got the response yet, we save the callback
      callbackPassedIn = cb;
    } else {
      // by the time we call the thunk, we already got the response, we just call the cb with the previously saved response
      cb(fileContent);
    }
  };
}

var th1 = getFile("file1");
var th2 = getFile("file2");
var th3 = getFile("file3");

th1(function(text) {
  output(text);
  th2(function(text) {
    output(text);
    th3(function(text) {
      output(text);
      output("completed");
    });
  });
});

// setTimeout(function() {
//   th1(function(text) {
//     output(text);
//     th2(function(text) {
//       output(text);
//       th3(function(text) {
//         output(text);
//       });
//     });
//   });
// }, 10000);

// request all files at once in "parallel"
// ???

// solution 2
// function thunkify(fn, ...args) {
//   var result, callback;

//   fn(...args, function(res) {
//     if (!callback) {
//       result = res;
//     } else {
//       return callback(res);
//     }
//   });

//   return function(cb) {
//     if (!result) {
//       callback = cb;
//     } else {
//       return cb(result);
//     }
//   };
// }

// var th1 = thunkify(fakeAjax, "file1");
// var th2 = thunkify(fakeAjax, "file2");
// var th3 = thunkify(fakeAjax, "file3");

// th1(function(text) {
//   output(text);
//   th2(function(text) {
//     output(text);
//     th3(function(text) {
//       output(text);
//       output("completed");
//     });
//   });
// });
