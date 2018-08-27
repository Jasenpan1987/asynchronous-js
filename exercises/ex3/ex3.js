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
  return new Promise((resolve, reject) => {
    return fakeAjax(file, resolve);
  });
}

// request all files at once in "parallel"
// ???

var files = ["file1", "file2", "file3"];
var p1 = getFile(files[0]);
var p2 = getFile(files[1]);
var p3 = getFile(files[2]);

function outputAndReturnNext(nextPromise) {
  return function(content) {
    output(content);
    return nextPromise;
  };
}

p1.then(outputAndReturnNext(p2))
  .then(outputAndReturnNext(p3))
  .then(outputAndReturnNext(new Promise(resolve => resolve("all done"))))
  .then(output);
