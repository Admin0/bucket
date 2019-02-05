function nav_create() {
  // $("body").prepend("<nav><div id='nav_header'></div><div id='nav'></div><div id='nav_footer'><i class='material-icons'>chevron_left</i></div></nav>");
  // $("nav").prepend("<section id='in-page'></section>");
  $("h2, h3").each(function() {
    $(this).clone()
      .html("<a href='#" + $(this).attr("id") + "'>" + $(this).html() + "</a>")
      .attr("id", null)
      .appendTo($("#nav"));
    // .appendTo($("#in-page"));
  })

  var nav_w = 256;
  var nav_w_folded = 68;

  function nav_expand() {
    $("nav, #sub_header, #nav_footer > i").removeClass("fold");
    setTimeout(function() {
      $("body").removeClass("fold");
    }, 300);
    window.localStorage['nav_fold'] = "false";
  }

  function nav_fold() {
    $("nav, #sub_header, #nav_footer > i").addClass("fold");
    setTimeout(function() {
      $("body").addClass("fold");
    }, 300);
    window.localStorage['nav_fold'] = "true";
  }

  if (window.localStorage['nav_fold'] == "true") {
    nav_fold();
  } else {
    nav_expand();
  }

  $("#nav_footer").on("click", function() {
    if (window.localStorage['nav_fold'] != "true") {
      nav_fold();
    } else {
      nav_expand();
    }
    setTimeout(function() {
      columns();
    }, 300);
    // columns();
  });

  $('body').append('<div id="tooltip_nav"><div id="tooltip_nav_text"></div><div id="tooltip_nav_before"></div></div>');
  $("#tooltip_nav").css({
    "background": color.material_700[color.i]
  });
  $("#tooltip_nav").append($("#tooltip_before"));
  $("#nav h3").hover(function() {
      if ($("nav").attr("class") == "fold") {
        if (document.height === null) {
          pageYOffset = document.documentElement.scrollTop;
        }
        $('#tooltip_nav_text').html($(this).children("a").children("span:nth(0)").text());
        $('#tooltip_nav').css({
          'visibility': 'visible',
          'opacity': 1,
          'top': $(this).offset().top - pageYOffset + 'px',
          'left': 68 + 16 + 'px'
        });
        $("#tooltip_nav_before").css({
          "border-color": "transparent " + color.material_700[color.i] + " transparent transparent",
          "border-width": "1ex 1ex 1ex 0",
          "left": "-.9ex",
          "bottom": "calc(50% - .5em)"
        });
      }
    },
    function() {
      $('#tooltip_nav').css({
        'visibility': 'hidden',
        'opacity': "0"
      });
    });
  $("#nav #setting_bt").hover(function() {
      if ($("nav").attr("class") == "fold") {
        if (document.height === null) {
          pageYOffset = document.documentElement.scrollTop;
        }
        $('#tooltip_nav_text').html("설정");
        $('#tooltip_nav').css({
          'visibility': 'visible',
          'opacity': 1,
          'top': $(this).offset().top - pageYOffset + 'px',
          'left': 68 + 16 + 'px'
        });
        $("#tooltip_nav_before").css({
          "border-color": "transparent " + color.material_700[color.i] + " transparent transparent",
          "border-width": "1ex 1ex 1ex 0",
          "left": "-.9ex",
          "bottom": "calc(50% - .5em)"
        });
      }
    },
    function() {
      $('#tooltip_nav').css({
        'visibility': 'hidden',
        'opacity': "0"
      });
    });
  $("#nav #to_github").hover(function() {
      if ($("nav").attr("class") == "fold") {
        if (document.height === null) {
          pageYOffset = document.documentElement.scrollTop;
        }
        $('#tooltip_nav_text').html("소스 보기");
        $('#tooltip_nav').css({
          'visibility': 'visible',
          'opacity': 1,
          'top': $(this).offset().top - pageYOffset + 'px',
          'left': 68 + 16 + 'px'
        });
        $("#tooltip_nav_before").css({
          "border-color": "transparent " + color.material_700[color.i] + " transparent transparent",
          "border-width": "1ex 1ex 1ex 0",
          "left": "-.9ex",
          "bottom": "calc(50% - .5em)"
        });
      }
    },
    function() {
      $('#tooltip_nav').css({
        'visibility': 'hidden',
        'opacity': "0"
      });
    });

  //for mobile
  $("nav a").on("click", function() {
    $("nav, #nav_bg").removeClass("on");
  });
}

function toast(msg, icon, time) {
  if (icon == null) {
    icon = "priority_high";
  }
  if (time == null) {
    time = 1500;
  }

  $('#toast').remove();
  $('body').append('<div id="toast" class="shadow"><i class="material-icons">' + icon + '</i>' + msg + '</div>');
  $('#toast').css("left", "calc(1em + " + $("nav").width() + "px)").addClass("on").removeClass("off");

  setTimeout(function() {
    $("#toast").addClass("off").removeClass("on", function() {
      $(this).delay(300).remove();
    });
  }, time + 300);
}

function scroll_smooth() {
  $("[href^='#']").click(function(event) {
    event.preventDefault();

    if (document.height === null) {
      pageYOffset = document.documentElement.scrollTop;
    }
    var isNotNav = true;
    if ($(this).parent().prop("tagName") == "H3" || $(this).parent().prop("tagName") == "H2") {
      isNotNav = false;
    }

    var target_pre = this.hash;
    var target = (target_pre.substring(1, 2) == "%" ? $(decodeURIComponent(target_pre)) : $(target_pre));
    var target_reverse; // = $(this) //old code
    if ($(this).parent("p").parent(".back").prev(".front").length != 0) {
      target_reverse = $(this).parent("p").parent(".back").prev(".front");
    } else {
      target_reverse = $(this);
    }
    var target_bg;
    var reversible = true;

    function bg_change(t, color, time) {
      if (t[0].tagName == "TR") {
        t.children("td").css({
          "background-color": color,
          "transition": time
        });
      } else {
        t.css({
          "background-color": color,
          "transition": time
        });
      }
    }

    function scroll(target, event) {
      if (target[0].tagName == "TR") {
        target_bg = target.children("td").css("background-color");
      } else {
        target_bg = target.css("background-color");
      }

      if (isNotNav) {
        target_position = target.offset().top - event.pageY + pageYOffset + target.height() / 2;
      } else if (target.css("display") != "none") {
        target_position = target.offset().top - 114 - (window.localStorage['setting__stat'] == "true" ? 208 : 0); //114: header 208:dashboard
      } else {
        toast("항목이 없습니다.");
      }

      $('html, body').animate({
        scrollTop: target_position
      }, 500, function() {
        bg_change(target, target_bg, ".75s");
      });
    }

    scroll(target, event);
    bg_change(target, color.material_a100[color.i], ".25s");

    if (isNotNav) {
      toast("원래 자리로 가려면 더블 클릭.", "refresh", 2500);
      document.ondblclick = function(event) {
        if (reversible) {
          scroll(target_reverse, event);
          bg_change(target_reverse, color.material_a100[color.i], ".25s");
          reversible = false;
        }
      };
    }
    // alert(target_reverse.offset().top);
  });
}

function scroll_at_open() {

  if (window.location.href.substring(window.location.href.length - 8, window.location.href.length) != window.location.pathname.substring(window.location.pathname.length - 8, window.location.pathname.length)) {
    setTimeout(function() {
      var target_pre = window.location.href.substring(window.location.href.indexOf("#"));
      var target = (target_pre.substring(1, 2) == "%" ? $(decodeURIComponent(target_pre)) : $(target_pre));
      // console.log(target.prop("tagName"));
      $('html, body').animate({
        scrollTop: target.offset().top - $('header').height() - $('#sub_header').height() - 12 - (window.localStorage['setting__stat'] == "true" ? 208 : 0) //116 - dashboard
      }, 500);
      target.css({
        "background-color": color.material_a100[color.i],
        "transition": ".75s"
      });
    }, 1000)
  }
}

// $(document).scroll(function() {
//     if (document.height === null) {
//         pageYOffset = document.documentElement.scrollTop;
//     }
//     if($( document ).width()>=600){
//         if (pageYOffset >= 89.88) {
//             $("nav").css({"position":"fixed",   "top":"1em", "max-height": "calc(100% -  4em)"});
//         } else{
//             $("nav").css({"position":"absolute","top":"7em", "max-height": "calc(100% - 10em)"});
//         }
//     }
// });

function title_tooltip() {
  $('[title]').attr({
    'data-title': function() {
      return this.title;
    },
    'title': null
  });
  $('body').append('<div id="tooltip"><div id="tooltip_text"></div><div id="tooltip_before"></div></div>');
  $("#tooltip").css({
    "background": color.material_700[color.i]
  });
  $("#tooltip").append($("#tooltip_before"));
  $("#tooltip_before").css({
    "border-color": color.material_700[color.i] + " transparent transparent transparent"
  });
  $('[data-title]').each(function() {
    $(this).hover(
      function() {
        console.log($(this).attr('data-title'));
        if (document.height === null) {
          pageYOffset = document.documentElement.scrollTop;
        }
        $('#tooltip_text').html($(this).attr('data-title'));
        var left = $(this).offset().left + ($(this).outerWidth() - $('#tooltip').outerWidth()) / 2;
        if (left <= 0) {
          left = 0;
        }
        $('#tooltip').css({
          'visibility': 'visible',
          'opacity': 1,
          'top': $(this).offset().top - $('#tooltip').outerHeight() /*+ pageYOffset*/ - 16 + 'px',
          'left': left + 'px'
        });
      },
      function() {
        $('#tooltip').css({
          'visibility': 'hidden',
          'opacity': 0
        });
      }
    );
  });
}

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

  var obj, flex, i, j;
  $(".img img").wrap("<div></div>"); //.img로 묶인 이미지를 높이에 맞게 정렬
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
}

function filter() {

  $("#column_bt").on("click", function() {
    if (column_only_mode == "false") {
      column_only_mode = "true";
    } else {
      column_only_mode = "false";
    }
    columns();
    window.localStorage['column_only_mode'] = column_only_mode;
  });

  function hide_all() {
    $("input").each(function() {
      if ($(this).parent().parent().parent().parent().attr('class') == 'card_wrap') {
        $(this).parent().parent().parent().parent().addClass("hide");
        // console.log(".card");
      } else if ($(this).parent().parent().parent().attr('class') == 'card_wrap') {
        $(this).parent().parent().parent().addClass("hide");
        // console.log("dl.card");
      } else if ($(this).parent().parent().attr('class') == 'card_wrap') {
        $(this).parent().parent().addClass("hide");
        // console.log("dl");
      }
      if (window.localStorage['strict_filtering'] == "true" && $(this).parent().parent().attr("id") != "setting") {
        $(this).prev().addClass("hide");
        $(this).next().addClass("hide");
        $(this).next().next().addClass("hide");
      } else {
        $(".card_wrap *.hide").removeClass("hide");
      }
    });
  }

  function filter_11() {
    $(".card_wrap").removeClass("hide");
    $("input").parent().children(".hide").removeClass("hide");
  }

  function filter_10() {
    hide_all();
    $("input[checked]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
    $("input[checked]").parent().parent().parent(".card_wrap").removeClass("hide");
    $("input[checked]").parent().parent(".card_wrap").removeClass("hide");
    if (window.localStorage['strict_filtering'] == "true") {
      $("input[checked]").prev().removeClass("hide");
      $("input[checked]").next().removeClass("hide");
      $("input[checked]").next().next().removeClass("hide");
    }
  }

  function filter_01() {
    hide_all();
    $("input:not([checked]):not([failed]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
    $("input:not([checked]):not([failed]").parent().parent().parent(".card_wrap").removeClass("hide");
    $("input:not([checked]):not([failed]").parent().parent(".card_wrap").removeClass("hide");
    if (window.localStorage['strict_filtering'] == "true") {
      $("input:not([checked]):not([failed])").prev().removeClass("hide");
      $("input:not([checked]):not([failed])").next().removeClass("hide");
      $("input:not([checked]):not([failed])").next().next().removeClass("hide");
    }
  }

  function filter_00() {
    hide_all();
    $("input[failed]").parent().parent().parent().parent(".card_wrap").removeClass("hide");
    $("input[failed]").parent().parent().parent(".card_wrap").removeClass("hide");
    $("input[failed]").parent().parent(".card_wrap").removeClass("hide");
    if (window.localStorage['strict_filtering'] == "true") {
      $("input[failed]").prev().removeClass("hide");
      $("input[failed]").next().removeClass("hide");
      $("input[failed]").next().next().removeClass("hide");
    }
  }

  if (window.localStorage['filter'] == "filter_10") {
    $("#sub_header .filter_bt").removeClass("on");
    $("#filter_10").addClass("on");
    filter_10();
  } else if (window.localStorage['filter'] == "filter_01") {
    $("#sub_header .filter_bt").removeClass("on");
    $("#filter_01").addClass("on");
    filter_01();
  } else if (window.localStorage['filter'] == "filter_00") {
    $("#sub_header .filter_bt").removeClass("on");
    $("#filter_00").addClass("on");
    filter_00();
  } else {
    // filter_11();
  }

  $("#sub_header .filter_bt").on("click", function() {
    $("#sub_header .filter_bt").removeClass("on");
    $(this).addClass("on");
    if ($(this).attr("id") == "filter_11") { //show all
      window.localStorage['filter'] = "filter_11";
      filter_11();
    } else if ($(this).attr("id") == "filter_10") { //show acheieved
      window.localStorage['filter'] = "filter_10";
      filter_10();
    } else if ($(this).attr("id") == "filter_01") { //show notyet
      window.localStorage['filter'] = "filter_01";
      filter_01();
    } else if ($(this).attr("id") == "filter_00") { //show notyet
      window.localStorage['filter'] = "filter_00";
      filter_00();
    }
    columns();
  });

}

function headline() {

  $("section.sup > h3").each(function() {
    if ($(this).next().height() == 0) {
      $(this).css("display", "none");
    } else {
      $(this).css("display", "block");
    };
  });
  $("h2:not(nav h2)").each(function() {
    if ($(this).next().height() == 0) {
      $(this).css("display", "none");
    } else {
      $(this).css("display", "block");
    };
  });
}

function checkbox() {
  $("input[checked]").before("<i class='material-icons'>check_box</i>");
  $("input:not([checked]):not([failed])").before("<i class='material-icons'>check_box_outline_blank</i>");
  $("input[failed]").before("<i class='material-icons'>priority_high</i>");

  // $("a[href]:not(nav a):not([href$='.zip']):not([href^='#'])").prepend("<i class='material-icons'>open_in_new</i>");
  // $("a[href$='.zip']").prepend("<i class='material-icons'>save</i>");
  // $("a[href^='#']:not(nav a)").prepend("<i class='material-icons'>find_in_page</i>");
  // $("a[onclick]").prepend("<i class='material-icons'>theaters</i>");
  // $("a[src]").prepend("<i class='material-icons'>photo</i>");
}

function card_wrap() {
  $(".card").each(function() {
    $(this).after("<div class='card_wrap'></div>")
    $(this).appendTo($(this).next());
  });
  $("dl").each(function() {
    if ($(this).parent().attr("class") == "sub") {
      $(this).after("<div class='card_wrap'></div>")
      $(this).appendTo($(this).next());
    }
  });
  $(".back li").each(function() {
    $(this).replaceWith('<li><span>' + $(this).html() + '</span></li>');
  });
}

function contextmenu() {
  $("body").on("contextmenu", function(event) {
    event.preventDefault();
  });
  $(".card_wrap").on("contextmenu", function(event) {
    // event.preventDefault();
    if (window.localStorage["cccv"] == "true") {
      var c = $("#contextmenu");
      var target = $(this);
      var output = "";

      function print() {
        if (window.localStorage["cccv__style"] == "true") {
          output += '<link rel="stylesheet" type="text/css" href="//jinh.kr/bucket/css/style_card.css">\n<style>\n\t.card_wrap { margin:1em auto; display: block; font-size: 16px; }\n</style>\n\n';
        }
        output += '<div class=card_wrap>' + target.html() + '</div>';
        if (window.localStorage["cccv__to_here"] == "true") {
          var id;
          if (target.children().attr("id") != null) {
            id = "/#" + target.children().attr("id");
          } else if (target.children().children().attr("id") != null) {
            id = "/#" + target.children().children().attr("id");
          } else {
            id = "";
          }
          output = '<h2><a href="//jinh.kr/bucket' + id + '">버킷리스트' + id + '</a></h2>\n\n' + output;
        }
        $("#contextmenu > .output").val(output); //.select();

        // auto copy to Clipboard
        var clipboard = new ClipboardJS('#for_copy');

        clipboard.on('success', function(e) {
          console.info('Action:', e.action);
          console.info('Text:', e.text);
          console.info('Trigger:', e.trigger);

          e.clearSelection();

          toast("복사되었습니다.", "content_paste");

          $("#contextmenu").removeClass("on");
        });

        clipboard.on('error', function(e) {
          console.error('Action:', e.action);
          console.error('Trigger:', e.trigger);

          toast("!ERROR!: 복사 실패.", "content_paste");
        });
      }

      function set_location() {

        var context_x,
          context_y,
          con_sub_x,
          con_sub_y;
        if ($(document).width() - $("#contextmenu").outerWidth() > event.pageX) {
          context_x = event.pageX;
        } else {
          context_x = $(document).width() - $("#contextmenu").outerWidth();
        }
        if ($(window).height() - $("#contextmenu").outerHeight() > event.pageY - $(document).scrollTop()) {
          context_y = event.pageY - $(document).scrollTop();
        } else {
          context_y = $(window).height() - $("#contextmenu").outerHeight();
        }
        $("#contextmenu").css({
          'left': context_x + "px",
          'top': context_y + "px"
        }).addClass("on");
        $('.contextmenu').parent().hover(function() { //하위 메뉴 항목
          if ($(document).width() - $("#contextmenu").outerWidth() - target.children().last().outerWidth() > event.pageX) {
            con_sub_x = 'calc(100% - .5em)';
          } else {
            con_sub_x = 'calc(' + (-target.children().last().outerWidth()) + 'px + .5em)';
          }
          if ($(window).height() - target.children().last().outerHeight() - target.position().top > event.pageY - $(document).scrollTop()) {
            con_sub_y = '-7px';
          } else {
            con_sub_y = $(window).height() - $("#contextmenu").position().top - target.position().top - target.children().last().outerHeight() + 'px';
          }
          target.children().last().css({
            'left': con_sub_x,
            'top': con_sub_y
          });
        });
      }

      set_location();
      print();
    }
  })
  $(document).on("click", function() {
    if ($('#contextmenu:hover').length > 0) {
      if ($('.context_able:hover').length > 0) {
        //      $('#output_for_contextmenu').html('1');
        $("#contextmenu").removeClass("on");
      } else {
        //      $('#output_for_contextmenu').html('2');
      }
    } else {
      //    $('#output_for_contextmenu').html('3');
      $("#contextmenu").removeClass("on");
    }
  });
}

function browser_alert() {
  var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
  var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
  var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
  var is_safari = navigator.userAgent.indexOf("Safari") > -1;
  var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
  if ((is_chrome) && (is_safari)) {
    is_safari = false;
  }
  if ((is_chrome) && (is_opera)) {
    is_chrome = false;
  }

  if (!is_chrome || is_firefox) $("#browser_alert").addClass("on");
}


// web worker test
function ajax() {
  $.ajax({
    url: "js/main__info.js",
    success: function(result) {
      //Do something with the result
    }
  });
}
//web worker end

$(window).scroll(function() {
  for (i = $("h3:not(nav h3)").length - 1; i >= 0; i--) {
    var target = $("h3:not(nav h3):nth(" + i + ")");
    // console.log(target.offset().top);
    if (target.offset().top < pageYOffset + 256 + (window.localStorage['setting__stat'] == "true" ? 208 : 0) && target.css("display") != "none") { //256:header 208:dashboard
      $("nav h3 a").css({
        "color": "inherit"
      });
      $("nav h3:nth(" + i + ") a").css({
        "color": color.material_500[color.i]
      });
      // console.log(target.text());
      break;
    }
  }
  // $("h2:not(nav h2), h3:not(nav h3)").each(function(){
  //     if($(this).offset().top < pageYOffset){
  //         console.log($(this).text());
  //     }
  // });
  // console.log("hello?");
});

// $(window).resize(function() {
//   columns();
// });
//
// $(document).ready(function() {
//   ajax();
//   browser_alert();
//   setting();
//   card_wrap();
//   nav_create();
//   scroll_smooth();
//   checkbox();
//   filter();
//   columns();
//   title_tooltip();
//   contextmenu();
//   coloring();
// });
//
// $(window).on('load', function() {
//   setTimeout(function() {
//     columns();
//     scroll_at_open();
//   }, 0);
//   imgReady();
// });
