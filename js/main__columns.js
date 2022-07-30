const body_w_1 = 600;

function columns() {
  if (column_only_mode != "true") { // columns
    $("body").addClass("columns");
    let body_w = $("body").width();
    $("#column_bt i").text("view_stream");
    var columns = Math.floor(body_w / 500);
    if (columns <= 1) {
      $("body").removeClass("columns");
      $("#column_bt").addClass("disabled");
      $('section.sub').masonry({
        itemSelector: '.card',
        columnWidth: body_w_1
      });
    } else { // only column
      $("#column_bt").removeClass("disabled");
      var column_w = body_w / columns;
      document.documentElement.style.setProperty("--column_w", column_w - 16 + 'px');
      $('section.sub').masonry({
        itemSelector: '.card',
        columnWidth: column_w
      });
    }
  } else { // column_only_mode == true
    $("body").removeClass("columns");
    $("#column_bt i").text("dashboard");
    var columns = Math.floor(($("html").width() - $("nav").width() - 152) / 500);
    if (columns <= 1) {
      $("#column_bt").addClass("disabled");
    } else {
      $("#column_bt").removeClass("disabled");
    }
    $('section.sub').masonry({
      itemSelector: '.card',
      columnWidth: body_w_1
    });
  }
}

// setting for column_only_mode
let column_only_mode = localStorage.column_only_mode == null ? "false" : localStorage.column_only_mode;
