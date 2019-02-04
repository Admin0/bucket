$.each([{
  from: "setting", // 설정
  to: "body"
}, {
  from: "dashboard", // 대시보드
  to: "section#first_class"
}, {
  from: "contents__휴식_여행", // 휴식
  to: "h2#휴식 + section.sup"
}, {
  from: "contents__휴식_음식",
  to: "h2#휴식 + section.sup"
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
}], function(i, val) {
  $.get("module/" + val.from + ".html", function(data) {
    $(val.to).prepend(data);
    console.log(this.url + " was loaded.");
  }).fail(function() {
    console.log(this.url + " was failed to load.");
  });
});

// 건강

$.get("module/contents__건강_생존.html", function(data) {
  $("h2#건강 + section.sup").append(data);
});

// 배움

$.get("module/contents__배움_고등교육.html", function(data) {
  $("h2#배움 + section.sup").append(data);
});

// 돈

$.get("module/contents__돈_직업.html", function(data) {
  $("h2#돈 + section.sup").append(data);
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
  //place your code here, the scripts are all loaded
});
