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

function imgReady() {

  function showImg(src) {
    $("body").append("<div id='img_wrap'><img class='shadow' src='" + src + "'></img></div>")
    $("#img_wrap").fadeIn(500);;
    $("#img_wrap").on("click", function() {
      $(this).fadeOut(500, function() {
        $(this).remove();
      })
    })

    $("#img_wrap > img").on('load', function() {
      if ($("#img_wrap > img").height() >= $(window).height() * .9) {
        $("#img_wrap > img").css({
          "width": "initial",
          "height": "90%",
          "top": "5%"
        });
      } else {
        $("#img_wrap > img").css("top", function() {
          return "calc(50% - " + $(this).height() / 2 + "px)"
        });
      }
    });
  }

  $("a[src]").each(function() {
    var src = $(this).attr("src");
    $(this).on("click", function() {
      showImg(src)
    });
  });

  $("img").on("click", function() { //이미지를 클릭하면 크게 보이는 고얌
    showImg($(this).attr("src"));
  });

  // $(".img > img").on('load', function() {
    var obj, flex, i, j;
    $(".img > img").wrap("<div></div>"); //.img로 묶인 이미지를 높이에 맞게 정렬
    $(".img").each(function() {
      obj = new Array();
      i = $(".img").index(this);
      $(this).children().each(function() {
        obj.push([$(this).children("img").width(), $(this).children("img").height()]);
        // console.log(i+"번 값 저장: " + $(this).children("img").width() + ", " + $(this).children("img").height());
      });
      $(this).children().each(function() {
        j = $(".img:nth(" + i + ") > div").index(this);
        flex = 100 * obj[j][0] * obj[0][1] / obj[j][1];
        // console.log(i+"번 .img의 "+j+"번째 img 정렬: " + flex);
        $(this).css({
          "flex": flex + "%"
        });
      });
    });
  // });
  console.log('initialize: main__image.js was loaded.');
}
