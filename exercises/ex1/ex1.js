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
// The old-n-busted callback way
function getFile(file) {
  fakeAjax(file, function(text) {
    fileReceived(file, text);
  });
}

const files = ["file1", "file2", "file3"];
const receivedFiles = ["file1", "file2", "file3"];

function fileReceived(file, text) {
  var idx = files.findIndex(x => x === file);
  if (idx !== -1) {
    output(text);
    files.splice(idx, 1);
  }
}

function requestFiles() {
  for (let file of files) {
    getFile(file);
  }
}

requestFiles();
// request all files at once in "parallel"
// getFile("file1");
// getFile("file2");
// getFile("file3");
