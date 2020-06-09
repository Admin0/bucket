function showMovie(src) {
  var url = src.replace("watch?v=", "embed/");
  $("body").append("<div id='movie_wrap'><iframe class='shadow' width='560' height='315' src='" + url + "?rel=0&amp;showinfo=0'  frameborder='0' allowfullscreen></iframe></div>")
  $("#movie_wrap").fadeIn(500);
  $("#movie_wrap").on("click", function() {
    $(this).fadeOut(500, function() {
      $(this).remove();
    })
  })
  $("#movie_wrap > iframe").css({
    "height": $("#movie_wrap > iframe").width() * 315 / 560 + "px",
    "top": "calc(50% - " + $("#movie_wrap > iframe").width() * 315 / 560 / 2 + "px)"
  });
}
