function setting() {

  var item = [
    "strict_filtering", "theme_color",
    "setting__stat_on", "setting__stat",
    "cccv", "cccv__style", "cccv__to_here"
  ];

  function check_setting() {

    $("#setting .header").css({
      "background": color.material_500[color.i]
    });
    $("#setting .setting_item input").prev("i").remove();

    for (i = 0; i < item.length; i++) {
      if (window.localStorage[item[i]] == null) {
        window.localStorage[item[i]] = $("#" + item[i] + " input").prop('checked');
      } else if (window.localStorage[item[i]] == "true") {
        $("#" + item[i] + " input").attr("checked", true);
      } else {
        $("#" + item[i] + " input").attr("checked", false);
      }
    };

    $("#setting input[checked]").before("<i class='material-icons'>check_box</i>");
    $("#setting input:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
    $("#setting .material-icons").css({
      "color": color.material_500[color.i]
    });

    $("#setting input").next().next().next(".off").removeClass("hide");
    $("#setting input").next().next(".on").removeClass("hide");
    $("#setting input[checked]").next().next().next(".off").addClass("hide");
    $("#setting input:not([checked])").next().next(".on").addClass("hide");

    // 개별 적용
    if (window.localStorage["theme_color"] == "true") {
      $("#theme_color dd.on").text("현재 색(" + color.name[color.i] + ")이 테마 색으로 지정되었습니다.");
    }
    if (window.localStorage["cccv"] != "true") {
      $("#cccv__style").addClass("disabled");
      $("#cccv__to_here").addClass("disabled");
    } else {
      $("#cccv__style").removeClass("disabled");
      $("#cccv__to_here").removeClass("disabled");
    }

    // setting__stat (dashboard)
    $.getScript("js/main__setting_stat.js");

  }

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

      if ($(this)[0] == $("#theme_color")[0] && window.localStorage["theme_color"] == "true") {
        window.localStorage["theme_color__i"] = color.i;
      }

      filter();
      columns();
      check_setting();
    }
  });
}
