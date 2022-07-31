var item = [
  "strict_filtering", "theme_color",
  "setting__stat_on", "setting__stat",
  "cccv", "cccv__style", "cccv__to_here"
];

function setting() {

  check_setting();

  $("#setting_bt").on("click", function() {
    // $(this).css("color",color.material_500[color.i]);
    $('#tooltip_nav').css({
      'visibility': 'hidden',
      'opacity': "0"
    });
    $("#setting, #setting_bg").toggleClass("on");
    $("#setting").css({
      "top": $("#setting_bt").offset().top - pageYOffset,
      "left": $("#nav").width() - 16
    });
    check_setting();
  });

  $("#setting > .setting_item").on("click", function() {
    // console.log($(this).hasClass("disabled"));
    if (!$(this).hasClass("disabled")) {
      var i = $("#setting > .setting_item").index(this);
      if (window.localStorage[item[i]] == "true") {
        window.localStorage[item[i]] = "false"
      } else {
        window.localStorage[item[i]] = "true"
      }
      toast("설정이 저장되었습니다.", "save");

      if ($(this)[0] == $("#theme_color")[0] && localStorage.theme_color == "true") {
        localStorage.theme_color__i = color.i;
      }

      filter();
      columns();
      check_setting();
    }
  });
}



function check_setting() {

  $("#setting .header").css({
    // "background": (dark ? '#2d2d2d' : color.material_500[color.i]),
  });
  $("#setting .setting_item dt").prev("i").remove();

  for (i = 0; i < item.length; i++) {
    if (window.localStorage[item[i]] == null) {
      window.localStorage[item[i]] = $("#" + item[i] + " dt").prop('checked');
    } else if (window.localStorage[item[i]] == "true") {
      $("#" + item[i] + " dt").attr("checked", true);
    } else {
      $("#" + item[i] + " dt").attr("checked", false);
    }
  };

  // 개별 적용
  if (localStorage.cccv != "true") {
    $("#cccv__style").addClass("disabled");
    $("#cccv__to_here").addClass("disabled");
  } else {
    $("#cccv__style").removeClass("disabled");
    $("#cccv__to_here").removeClass("disabled");
  }

  // $("#setting dt[checked]").before("<i class='material-icons'>check_box</i>");
  // $("#setting dt:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
  // $("#setting .disabled .material-icons").css({
  //   "color": 'none'
  // });

  $("#setting dt").next().next().next(".off").removeClass("hide");
  $("#setting dt").next().next(".on").removeClass("hide");
  $("#setting dt[checked]").next().next().next(".off").addClass("hide");
  $("#setting dt:not([checked])").next().next(".on").addClass("hide");

  // setting__stat (dashboard)
  $.getScript("js/main__setting_stat.js");

}
