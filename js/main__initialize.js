const time = {};
time.start = localStorage.timer || Date.now();

time.log = function(msg) {
  console.log(msg + ' (' + (Date.now() - time.start) + ' ms)');
}

time.log("init");

$(document).ready(function() {
  $.each([{
    from: "setting", // 설정
    to: "body",
    type: "prepend"
  }, {
    from: "dashboard", // 대시보드
    to: "section#dashboard"
  }, {
    from: "contents__휴식_여행", // 휴식
    to: "h2#휴식 + section.sup"
  }, {
    from: "contents__휴식_음식",
    to: "h2#휴식 + section.sup",
  }, {
    from: "contents__휴식_기타",
    to: "h2#휴식 + section.sup"
  }, {
    from: "contents__취미_제작", // 취미
    to: "h2#취미 + section.sup"
  }, {
    from: "contents__취미_컴퓨터",
    to: "h2#취미 + section.sup"
  }, {
    from: "contents__취미_예술",
    to: "h2#취미 + section.sup"
  }, {
    from: "contents__취미_커뮤니티",
    to: "h2#취미 + section.sup"
  }, {
    from: "contents__취미_기타",
    to: "h2#취미 + section.sup"
  }, {
    from: "contents__건강_생존", // 건강
    to: "h2#건강 + section.sup"
  }, {
    from: "contents__배움_고등교육", // 배움
    to: "h2#배움 + section.sup"
  }, {
    from: "contents__배움_자격",
    to: "h2#배움 + section.sup"
  }, {
    from: "contents__배움_언어",
    to: "h2#배움 + section.sup"
  }, {
    from: "contents__돈_직업", // 돈
    to: "h2#돈 + section.sup"
  }, {
    from: "contents__돈_소유",
    to: "h2#돈 + section.sup"
  }], function(id, val) {
    $.get("module/" + val.from + ".html", function(data) {
      switch (val.type) {
        case "prepend":
          $(val.to).prepend(data);
          break;
        default:
          $(val.to).append(data);
      }
      if (id == 15) {
        time.log("initialize: all modules were loaded.");
        boot();
      }
      // console.log(this.url + " was loaded.");
    }).fail(function() {
      // console.log(this.url + " was failed to load.");
    });
  });
  time.log("initialize: DOM is ready.");
});


// boot
function boot() {
  $.when(
    $.getScript("js/main__setting.js"),
    $.getScript("js/main__columns.js"),
    $.getScript("js/main__image.js"),
    $.getScript("js/main.js"),
    $.Deferred(function(deferred) {
      $(deferred.resolve);
    })
  ).done(function() {
    $("div#splash").addClass("off"); // splash
    $(window).resize(function() {
      columns();
    });

    bucket.initialize();

    $(window).on('load', function() { //not document, but window
      columns();
      trim_contents_headline();
      scroll_at_open();
    });

  });
}

// Global site tag (gtag.js) - Google Analytics
$.getScript("//www.googletagmanager.com/gtag/js?id=UA-39552694-1", function() {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'UA-39552694-1');
});
