$.each([{
  from: "setting", // 설정
  to: "body",
  type: "prepend"
}, {
  from: "dashboard", // 대시보드
  to: "section#first_class"
}, {
  from: "contents__휴식_여행", // 휴식
  to: "h2#휴식 + section.sup"
}, {
  from: "contents__휴식_음식",
  to: "h2#휴식 + section.sup",
  type: "append"
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
  from: "contents__건강_생존", // 건강
  to: "h2#건강 + section.sup"
}, {
  from: "contents__배움_고등교육", // 배움
  to: "h2#배움 + section.sup"
}, {
  from: "contents__돈_직업", // 돈
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
    console.log(this.url + " was loaded.");
  }).fail(function() {
    console.log(this.url + " was failed to load.");
  });
});

// boot
$.when(
  $.getScript("js/main__setting.js"),
  $.getScript("js/main__coloring.js"),
  $.getScript("js/main__columns.js"),
  $.getScript("js/main.js"),
  $.Deferred(function(deferred) {
    $(deferred.resolve);
  })
).done(function() {

  $(window).resize(function() {
    columns();
  });

  $(document).ready(function() {
    ajax();
    browser_alert();
    setting();
    card_wrap();
    nav_create();
    scroll_smooth();
    checkbox();
    filter();
    columns();
    title_tooltip();
    contextmenu();
    coloring();
  });

  $(window).on('load', function() {
    setTimeout(function() {
      columns();
      scroll_at_open();
    }, 0);
    imgReady();
  });

});
