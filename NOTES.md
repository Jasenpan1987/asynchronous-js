# Javascript Async Design Patterns

## 1. Callback

### 1.1 Callback hell

```js
setTimeout(function() {
  console.log("1");
  setTimeout(function() {
    console.log("2");
    setTimeout(function() {
      console.log("3");
    }, 1000);
  }, 1000);
}, 1000);
```

The nested callback can go very deep, and it make our code harder to read and reason.

This is also a callback hell even though it looks different.

```js
function one(cb) {
  console.log("1");
  setTimeout(cb, 1000);
}

function two(cb) {
  console.log("2");
  setTimeout(cb, 1000);
}

function three(cb) {
  console.log("3");
  setTimeout(cb, 1000);
}

one(function() {
  two(three);
});
```

The callback pattern has problems when we need to do some coordination within the callbacks, and we need some closure or global variables to make sure all of the callbacks can reference it (checkout exercise 1).

### 1.2 Some kind of "ways" to solve the callback issue

#### 1.2.1 split callbacks

```js
function trySomething(ok, err) {
  setTimeout(function() {
    var rand = Math.random();
    if (rand > 0.5) {
      ok(rand);
    } else {
      err(rand);
    }
  }, 1000);
}

trySomething(
  function(num) {
    console.log("Success on " + num);
  },
  function(num) {
    console.log("Error on " + num);
  }
);
```

This looks like it solved some readability issue, but it accutally not. The reason is we split the logic into two parts, and there is no gurentee that none of the callback gets called.

#### 1.2.2 Error first callbacks (node)

```js
function trySomething(callback) {
  setTimeout(function() {
    var rand = Math.random();
    if (rand > 0.5) {
      callback(null, rand);
    } else {
      callback("something goes wrong");
    }
  }, 1000);
}

trySomething(function(error, num) {
  if (error) {
    console.log("Error: " + error);
  } else {
    console.log("Success, the number is " + num);
  }
});
```

It still has the "trust" issue, for example what if we call the callback with the wrong order of the arguments...

### So in general there is no fix for these callback issues.

## 2. Thunks

```js
// synchronous simple thunk
function add(x, y) {
  return x + y;
}

var thunk = function() {
  return add(10, 5);
};

thunk(); // 25
```

Thunk works like a wrapper, wrap around a function with given state (in this example, 10 and 5), and we can pass around the wrapper and give it to other functions. Once the thunk gets called, it will always used the same state that wrapped inside the function.

```js
// asynchronous thunk
function addAsync(x, y, cb) {
  setTimeout(function() {
    cb(x + y);
  }, 1000);
}

var thunk = function(cb) {
  addAsync(4, 6, cb);
};

thunk(function(total) {
  console.log("Total: " + total); // 10
});
```

**Time is the most complex factor of state in our program**

Compare with normal callback

```js
function addAsync(x, y) {
  setTimeout(function() {
    var total = x + y;
    console.log("Total: " + total);
  }, 1000);
}
```

The good thing of thunk is it eliminate the impact of time. Here, in the normal callback, if there is a complex logic, it has be inside the callback. And for thunk, we can just define the thunk, and call it with a callback.

### 2.1 Generalized thunk

```js
function makeThunk(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function(cb) {
    args.push(cb);
    fn.apply(null, args);
  };
}
```

Let refactor our previous usecase of thunk

```js
function addAsync(x, y, cb) {
  setTimeout(function() {
    cb(x + y);
  }, 1000);
}

var addThunk = makeThunk(addAsync, 4, 6); // thunked addAsync function

addThunk();
```

**checkout ex2**

### 2.2 More complex thunk application

```js
function eagerThunk(fn, ...args) {
  var result, callback;

  fn(...args, function(res) {
    if (!callback) {
      result = res;
    } else {
      return callback(res);
    }
  });

  return function(cb) {
    if (!result) {
      callback = cb;
    } else {
      return cb(result);
    }
  };
}
```

When we greate the thunk, the call of the passed in function will be immiditely executed.

The best part of thunk is the time won't have impact on how we write the code.

## 3. Promise

Promise is a container that wrapped around on the future value. Promise un-invert the Inversion of Control problem.

### 3.1 Promise Trust

- Only resolved once
- Either success or error
- Messages passed / kept
- Exceptions become errors
- immutable once resolved <-

### 3.2 Flow Control

```js
firstPromise()
  .then(function() {
    return secondPromise();
  })
  .then(function() {
    return thirdPromise();
  })
  .then(complete, error);
```

In promise, don't overuse the arrow function and keep each `.then` doing one specific thing and pass it along, let the next `.then` to process the next part of logic.

```js
// good practice
myPromise
  .then(processFn1)
  .then(processFn2)
  .then(processFn3)
  .catch(errorFn);
```

```js
.catch(function(err) {
  console.log(err)
})

// is equal to
.then(null, function(err) {
  console.log(err)
})
```

### 3.3 Abstractions

#### 3.3.1 Promise.all

```js
Promise.all([promise1, promise2, promise3]).then(function(results) {
  return someTask(Math.max(results[1], results[2], results[3]));
});
```

`Promise.all` will run in parallel, and return all the results in an array with all of the resolved values from the promise array.

If any of them got rejected, all of them will send to the `.catch` block.

#### 3.3.2 Promise.race

```js
Promise.race([
  promise,
  new Promise(function(_, reject) {
    setTimeout(function() {
      reject("Timeout");
    }, 3000);
  })
]).then(successCallback, errorCallback);
```

`Promise.race` will run an array of promises, and if any of them success or rejected, it will directly send to the end `successFn` or `errorFn`.

## 4. Generator

Generator is a special kind of function that can be pause and resume as many time as necessary. While generator is paused, all the stuff in the generator is blocked, but the overall program is running without any block.

```js
function* gen() {
  console.log("hello");
  yield; // <- this is the pause
  console.log("world");
}

var it = gen(); // gets back an iterator
it.next(); // hello
it.next(); // world
```

### 4.1 Messaging

One way message passing

```js
function* main() {
  yield 1;
  yield 2;
  yield 3;
}

var it = main();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }

it.next(); // { value: undefined, done: true }
```

```js
function* main() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

var it = main();
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }

it.next(); // { value: 4, done: true }
it.next(); // { value: undefined, done: true }
```

Two way message passing

```js
// a call helper
function continueFn(g) {
  var it = g();
  return function() {
    return it.next.apply(it, arguments);
  };
}

var run = continueFn(function*() {
  var x = 1 + (yield);
  var y = 1 + (yield);
  yield x + y;
});

run();
run(3); // {value: undefined, done: false}
run(4); // {value: undefined, done: false}
run(); // {value: 9, done: true}
```

We don't have to finish the entire generator, once we have the value we need, we can simply leave it there and the gc will collect it. And sometime we can make our generator never finished, even we can make the call of an iterator wrapped inside a `while(true)` expression.

And if we put the `yield` inside an expression, we need to wrap it inside a pair of brackets.

### 4.2 Promise + Generator pattern

`yield promise` and `resume generator` makes a circile.

It covered by many libraries.

```js
function getData(d) {
  return ASQ(function(done) {
    setTimeout(function() {
      done(d);
    }, 1000);
  });
}

ASQ()
  .runner(function*() {
    var x = 1 + (yield getData(10));
    var y = 1 + (yield getData(20));
    var answer = yield getData("Result is " + (x + y));
    yield answer;
  })
  .val(function(answer) {
    console.log(answer); // Result is 42
  });
```

Parallel vs Sequencial

```js
function getFile(file) {
  return ASQ(function(done) {
    fakeAjax(file, done);
  });
}

// the following code will be running in sequencial

ASQ().runner(function*() {
  output(yield getFile("file1"));
  output(yield getFile("file1"));
  output(yield getFile("file1"));
  output("complete");
});

// the following code will be running in parallel

ASQ().runner(function*() {
  var p1 = getFile("file1");
  var p2 = getFile("file1");
  var p3 = getFile("file1");

  output(yield p1);
  output(yield p2);
  output(yield p3);
  output("complete");
});
```

If we want a generator to yield some promises, we can make the promise fires one by one if we put `yield` explicitly in front of the promise, and if we get the promise to fire first and save it into a variable and pass that variable to `yield`, the promises will run in parallel, but the output is still returned in sequencial.

## 5. Observable

Most of the async programs are running in event maners.

```js
var p1 = new Promise(function(resolve, reject) {
  $("#btn").click(function(e) {
    var className = e.target.className;
    if (/foobar/.test(className)) {
      resolve(className);
    } else {
      reject();
    }
  });
});

// somewhere else of the program
p1.then(function(className) {
  console.log(className);
});
```

The problem of the above code is the event only going to fired once!

### 5.1 Rxjs

```js
var obs = Rx.Observable.fromEvent(btn, "click"); // make an observable

obs
  .map(function(e) {
    return e.target.className;
  })
  .filter(function(className) {
    return /foobar/.test(className);
  })
  .distinctUntilChanged() // only let the data come through if it is different than the previous data
  .subscribe(function(dataArr) {
    // the end of the event chain, everything become sync
    var className = dataArr[1];
    console.log(className);
  });
```

We can think the observable as a stream, every event is like some data pop into the stream.

(checkout rxmarbles)

## 6.CSP

```js
var ch = chan();

function* process1() {
  yield put(ch, "Hello");
  var msg = yield take(ch);
  console.log(msg);
}

function* process2() {
  var greeting = yield take(ch);
  yield put(ch, greeting + " world");
  console.log("done");
}

// hello world
// done
```

Both of the process 1 and process 2 are able to put and take message from / to the channel. In CSP, we don't have to put first and take, it can be in any order.

```js
csp.go(function*() {
  while (true) {
    yield csp.put(ch, Math.random());
  }
});

csp.go(function*() {
  while (true) {
    yield csp.take(csp.timeout(500));
    var num = yield csp.take(ch);
    console.log(num);
  }
});
```

The first generator pushes a random number and stop until the second generator consumes it. The two generators communicate through a common channel `ch` which works like a pipe, allows these generators to push and take values. And the `while(true)` will not block each other from keep running.

```js
function fromEvent(el, eventType) {
  var ch = csp.chan();
  $(el).bind(eventType, function(e) {
    csp.putAsync(ch, e);
  });

  return ch;
}

csp.go(function*() {
  var ch = fromEvent(myElement, "mousemove");

  while (true) {
    var event = yield csp.take(ch);
    console.log(event.clientX, event.clientY);
  }
});
```

The above code uses csp to bind a "mousemove" event on to an html element. Once the mouse moves, the `e` will be pushed into the channel and the generator on the other side will consume it and output the `clientX` and `clientY` on to the console.

The main different between the observable pattern and csp is the **back pressure**, in csp, the stream will not be sent if no one on the otherside wants to take it, but in the observable pattern, the stream will always be sent and the source won't care about if someone is consume it or not.
