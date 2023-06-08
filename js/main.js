const bucket = {
  initialize: function() {
    ajax();
    browser_alert();
    setting();
    bucket.set.nav();
    scroll_smooth();
    filter();
    columns();
    title_tooltip();
    bucket.set.contextmenu();
    check_setting();
    bucket.set.img();
  },
  set: {
    nav: function() {
      {
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
            columns();
          }, 300);
          localStorage.nav_fold = "false";
        }

        function nav_fold() {
          $("nav, #sub_header, #nav_footer > i").addClass("fold");
          setTimeout(function() {
            $("body").addClass("fold");
            columns();
          }, 300);
          localStorage.nav_fold = "true";
        }

        if (localStorage.nav_fold == "true") {
          nav_fold();
        } else {
          nav_expand();
        }

        $("#nav_footer").on("click", function() {
          if (localStorage.nav_fold != "true") {
            nav_fold();
          } else {
            nav_expand();
          }
          // setTimeout(function() {
          //   columns();
          // }, 300);
          // columns();
        });

        $("#nav h3").hover(function() {
            if ($("nav").attr("class") == "fold") {
              if (document.height === null) {
                pageYOffset = document.documentElement.scrollTop;
              }
              $('#tooltip').html($(this).children("a").children("span:nth(0)").text());
              $('#tooltip').addClass('on nav').css({
                'top': $(this).offset().top - pageYOffset + 'px',
                'left': 68 + 16 + 'px'
              });
            }
          },
          function() {
            $('#tooltip').removeClass('on nav');
          });
        $("#nav #setting_bt").hover(function() {
            if ($("nav").attr("class") == "fold") {
              if (document.height === null) {
                pageYOffset = document.documentElement.scrollTop;
              }
              $('#tooltip').html("설정");
              $('#tooltip').addClass('on nav').css({
                'top': $(this).offset().top - pageYOffset + 'px',
                'left': 68 + 16 + 'px'
              });
            }
          },
          function() {
            $('#tooltip').removeClass('on nav');
          });
        $("#nav #to_github").hover(function() {
            if ($("nav").attr("class") == "fold") {
              if (document.height === null) {
                pageYOffset = document.documentElement.scrollTop;
              }
              $('#tooltip').html("소스 보기");
              $('#tooltip').addClass('on nav').css({
                'top': $(this).offset().top - pageYOffset + 'px',
                'left': 68 + 16 + 'px'
              });
            }
          },
          function() {
            $('#tooltip').removeClass('on nav');
          });

        //for mobile
        $("nav a").on("click", function() {
          $("nav, #nav_bg").removeClass("on");
        });
      }
    },
    contextmenu: function() {
      $("body").on("contextmenu", function(event) {
        event.preventDefault();
      });
      $(".card").on("contextmenu", function(event) {
        // event.preventDefault();
        if (localStorage.cccv == "true") {
          var c = $("#contextmenu");
          var target = $(this);
          var output = "";

          function print() {
            if (localStorage.cccv__style == "true") {
              output += '<link rel="stylesheet" type="text/css" href="//jinh.kr/bucket/css/style_card_v2.css">\n<style>\n\t.card { max-width:600px; margin:1em auto; display: block; font-size: 16px; }\n</style>\n\n';
            }
            output += target[0].outerHTML;
            if (localStorage.cccv__to_here == "true") {
              var id;
              if (target.attr("id") != null) {
                id = "/#" + target.attr("id");
              } else if (target.children().attr("id") != null) {
                id = "/#" + target.children().attr("id");
              } else {
                id = "";
              }
              output = '<h2><a href="//jinh.kr/bucket' + id + '">버킷리스트' + id + '</a></h2>\n\n' + output.replace(/ style=".*"/i, '');
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
    },
    img: function() {

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

      time.log('initialize: main__image.js was loaded.');

      $('.card').on('mouseenter', function() { //.img로 묶인 이미지를 높이에 맞게 정렬
        // console.log('mouseenter');
        // console.log($(this).index() + "/" + $('.card_wrap').length);
        $(this).find('.img').each(function() {
          let obj = $(this).children("img");
          if (obj[0].style.flex == "") {

            for (var i = 0; i < obj.length; i++) {
              let flex = obj[i].width = obj[i].width * obj[0].height / obj[i].height;
              obj[i].style.flex = flex + "%";
              // console.log("obj[" + i + "]: " + obj[i].style.flex);
              // console.log(i);
              // console.log(obj.length);
              if (i == obj.length - 1) {
                // console.log("i == obj.length");
                for (var j = 0; j < obj.length; j++) {
                  obj[j].style.width = 0;
                }
              }
            }
            // console.log($(this).children("img"))
            // console.log($(this).children("img")[0]);
            // console.log($(this).children("img").length);
          }
        });
      });
    }
  }
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
    var reversible = true;

    function bg_change(t, color, time) {
      t.css({
        "background-color": color,
        "transition": time
      });
    }

    function scroll(target, event) {
      if (isNotNav) {
        target_position = target.offset().top - event.pageY + pageYOffset + target.height() / 2;
      } else if (target.css("display") != "none") {
        target_position = target.offset().top - 114 - (localStorage.setting__stat == "true" ? 208 : 0); //114: header 208:dashboard
      } else {
        toast("항목이 없습니다.");
      }

      $('html, body').animate({
        scrollTop: target_position
      }, 500, function() {
        target.addClass('on');
        setTimeout(() => {
          target.removeClass('on');
        }, "750");
      });
    }

    scroll(target, event);
    // target.addClass('on').delay(500).removeClass('on');
    // bg_change(target, color.material_a100[color.i], ".25s");

    if (isNotNav) {
      toast("원래 자리로 가려면 더블 클릭.", "refresh", 2500);
      document.ondblclick = function(event) {
        if (reversible) {
          scroll(target_reverse, event);
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
        scrollTop: target.offset().top - $('header').height() - $('#sub_header').height() - 12 - (localStorage.setting__stat == "true" ? 208 : 0) //116 - dashboard
      }, 500);
      target.addClass('on');
    }, 1000)
  }
}

function title_tooltip() {
  $('[title]').attr({
    'data-title': function() {
      return this.title;
    },
    'title': null
  });
  $('[data-title]').each(function() {
    $(this).hover(
      function() {
        // console.log("title_tooltip: " + $(this).attr('data-title'));
        if (document.height === null) {
          pageYOffset = document.documentElement.scrollTop;
        }
        $('#tooltip').html($(this).attr('data-title'));
        var left = $(this).offset().left + ($(this).outerWidth() - $('#tooltip').outerWidth()) / 2;
        if (left <= 0) {
          left = 0;
        }
        $('#tooltip').addClass('on').css({
          'top': $(this).offset().top - $('#tooltip').outerHeight() /*+ pageYOffset*/ - 16 + 'px',
          'left': left + 'px'
        });
      },
      function() {
        $('#tooltip').removeClass('on');
      }
    );
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
    localStorage.column_only_mode = column_only_mode;
  });

  function show_all() {
    $(".card").removeClass("hide");
    $(".card dt").removeClass("hide");
    $(".card dd").removeClass("hide");
  }

  function hide_all() {
    show_all()
    $(".card:not(.dashboard)").addClass("hide");
  }

  function filter_11() {
    show_all();
  }

  function filter_10() {
    hide_all();
    $(".card").has("dt[checked]").removeClass("hide");
    if (localStorage.strict_filtering == "true") {
      $(".card").has("dt:not([checked])").addClass("hide");
      $(".card dt[checked], .card dt[checked]+dd").removeClass("hide");
    }
  }

  function filter_01() {
    hide_all();
    $(".card").has("dt:not([checked]):not([failed])").removeClass("hide");
    if (localStorage.strict_filtering == "true") {
      // $(".card").has("dt[checked], dt[failed]").addClass("hide");
      $(".card dt[checked], .card dt[checked]+dd, .card dt[checked]+span.date, .card dt[failed], .card dt[failed]+dd").addClass("hide");
    }
  }

  function filter_00() {
    hide_all();
    $(".card").has("dt[failed]").removeClass("hide");
    if (localStorage.strict_filtering == "true") {
      $(".card dt:not([failed]), .card dt:not([failed])+dd").addClass("hide");
      $("dt:not([failed])+dd").has("dt[failed]").removeClass("hide");
    }
  }

  if (localStorage.filter == "filter_10") {
    $("#sub_header .filter_bt").removeClass("on");
    $("#filter_10").addClass("on");
    filter_10();
  } else if (localStorage.filter == "filter_01") {
    $("#sub_header .filter_bt").removeClass("on");
    $("#filter_01").addClass("on");
    filter_01();
  } else if (localStorage.filter == "filter_00") {
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
      localStorage.filter = "filter_11";
      filter_11();
    } else if ($(this).attr("id") == "filter_10") { //show acheieved
      localStorage.filter = "filter_10";
      filter_10();
    } else if ($(this).attr("id") == "filter_01") { //show notyet
      localStorage.filter = "filter_01";
      filter_01();
    } else if ($(this).attr("id") == "filter_00") { //show notyet
      localStorage.filter = "filter_00";
      filter_00();
    }
    columns();
    trim_contents_headline();
  });

}

function trim_contents_headline() {

  $("section.sup > h3").each(function() {
    if ($(this).next().height() == 0) {
      $(this).addClass('hide');
    } else {
      $(this).removeClass('hide');
    };
  });
  $("h2:not(nav h2)").each(function() {
    if ($(this).next().height() == 0) {
      $(this).addClass('hide');
    } else {
      $(this).removeClass('hide');
    };
  });
  // time.log('initialize: trim_contents_headlin was activeted.')
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


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

$(window).scroll(function() {
  $("nav h3").removeClass('on');
  for (i = $("h3:not(nav h3)").length - 1; i >= 0; i--) {
    var target = $("h3:not(nav h3):nth(" + i + ")");
    // console.log(target.offset().top);
    if (target.offset().top < scrollY + 256 + (localStorage.setting__stat == "true" ? 208 : 0) && target.css("display") != "none") { //256:header 208:dashboard
      $(`nav h3:nth(${i})`).addClass('on');
      // console.log(target.text());
      break;
    }
  }
});

document.getElementById("year").innerHTML = new Date().getFullYear();
