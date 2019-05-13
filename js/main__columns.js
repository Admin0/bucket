var dashboard_top;

function columns_dashboard(type) {
  dashboard_top = $("#그거_먹는건가요").offset().top + 22;
  //     dashboard_top = $(".dashboard").offset().top - 116;
  if (dashboard_top < pageYOffset && window.localStorage['setting__stat'] == "true") {
    if ($(".wrap_dashboard.floating").length == 1) {
      var b_w = $("body").width();
      if (type) { // column_only_mode
        $(".card_wrap").has(".dashboard").css({
          "width": "100%",
          "margin-left": "-" + b_w / 2 + "px",
        });
      } else {
        $(".card_wrap").has(".dashboard").css({
          "width": b_w - 16,
          "margin-left": "-" + (b_w - 16) / 2 - 8 + "px",
        });
      }
      console.log("columns_dashboard: " + type);
    }
  }
}

function columns() {
  if (column_only_mode != "true") {
    $("body").addClass("columns");
    $("#column_bt i").text("view_stream");
    var columns = Math.floor($("body").width() / 500);
    if (columns <= 1) {
      $("body").removeClass("columns");
      $("#column_bt").addClass("disabled");
      $(".card_wrap").not(":first").css({
        "max-width": "600px"
      });
      $(".not_important").css({
        "display": "none"
      });
      // setTimeout(function(){
      $('section.sub').masonry({
        // options
        itemSelector: '.card_wrap',
        columnWidth: $("body").width()
      });
      headline();
      // toast("priority_high", "창 너비가 좁아 단일 열로 보여집니다.");
      // },100);
    } else {
      // $("body").addClass("columns");
      $("#column_bt").removeClass("disabled");
      var c_w = $("body").width() / columns;
      $(".card_wrap").not(":first, .size_fixed").css({
        "max-width": c_w - 16 + "px"
      });
      $(".card_wrap.size_fixed").css({
        "max-width": "calc(100% - 1em)"
      });
      $(".not_important").css({
        "display": "initial"
      });
      // console.log("columns: " + columns);
      // setTimeout(function(){
      $('section.sub').masonry({
        // options
        itemSelector: '.card_wrap',
        columnWidth: c_w
      });
      headline();
      // },100);
      columns_dashboard(false);
    }
  } else {
    $("body").removeClass("columns");
    $("#column_bt i").text("dashboard");
    var columns = Math.floor(($("html").width() - $("nav").width() - 152) / 500);
    if (columns <= 1) {
      $("#column_bt").addClass("disabled");
    } else {
      $("#column_bt").removeClass("disabled");
    }
    $(".card_wrap").not(":first").css({
      "max-width": "600px"
    });
    $(".not_important").css({
      "display": "none"
    });

    // setTimeout(function(){
    $('section.sub').masonry({
      // options
      itemSelector: '.card_wrap',
      columnWidth: $("body").width()
    });
    headline();
    // },100);
    columns_dashboard(true);
  }
}

var column_only_mode;
if (window.localStorage['column_only_mode'] == null) {
  column_only_mode = "false";
} else {
  column_only_mode = window.localStorage['column_only_mode'];
}
