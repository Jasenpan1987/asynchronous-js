$(document).ready(function() {
  var $btn = $("#btn"),
    $list = $("#list"),
    clicks = ASQ.react.of(),
    timer = ASQ.react.of();

  $btn.click(function(evt) {
    click.push(evt);
  });

  setInterval(function() {
    timer.push();
  }, 1000);

  var msgs = ASQ.react.all(clicks, timer);
  msgs.val(function() {
    $list.append($("<div>Clicked</div>"));
  });
  // TODO: setup sampled sequence, populate $list
});
