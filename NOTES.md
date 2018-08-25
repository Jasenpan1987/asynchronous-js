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
