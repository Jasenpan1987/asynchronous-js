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
  return new Promise(function(resolve) {
    fakeAjax(file, resolve);
  });
}

// ["file1", "file2", "file3"]
//   .map(function(fileName) {
//     return getFile(fileName);
//   })
//   .reduce(function(promiseChain, p) {
//     return promiseChain
//       .then(function() {
//         return p;
//       })
//       .then(output);
//   }, Promise.resolve())
//   .then(function() {
//     output("all done");
//   });

// Request all files at once in
// "parallel" via `getFile(..)`.
//
// Render as each one finishes,
// but only once previous rendering
// is done.

// ???

// advanced...
// function transduce(transducer, combineFn, initValue, list) {
//   var reducer = transducer(combineFn);
//   return list.reduce(reducer, initValue);
// }

// function mapReducer(mapFn) {
//   return function(combineFn) {
//     return function(list, value) {
//       return combineFn(list, mapFn(value));
//     };
//   };
// }

// function reduceFn(promiseChain, p) {
//   return promiseChain
//     .then(function() {
//       return p;
//     })
//     .then(output);
// }

// transduce(mapReducer(getFile), reduceFn, Promise.resolve(), [
//   "file1",
//   "file2",
//   "file3"
// ]).then(output);
