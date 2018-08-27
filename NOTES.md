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
