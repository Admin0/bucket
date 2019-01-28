// 설정
$.get("module/setting.html", function(data) {
  $("body").prepend(data);
});

// 대시보드
$.get("module/dashboard.html", function(data) {
  $("section#first_class").append(data);
});

// 휴식
$.get("module/contents__휴식_여행.html", function(data) {
  $("h2#휴식 + section.sup").append(data);
});
$.get("module/contents__휴식_음식.html", function(data) {
  $("h2#휴식 + section.sup").append(data);
});
$.get("module/contents__휴식_기타.html", function(data) {
  $("h2#휴식 + section.sup").append(data);
});

// 취미
$.get("module/contents__취미_제작.html", function(data) {
  $("h2#취미 + section.sup").append(data);
});
$.get("module/contents__취미_컴퓨터.html", function(data) {
  $("h2#취미 + section.sup").append(data);
});
$.get("module/contents__취미_예술.html", function(data) {
  $("h2#취미 + section.sup").append(data);
});
$.get("module/contents__취미_커뮤니티.html", function(data) {
  $("h2#취미 + section.sup").append(data);
});
$.get("module/contents__취미_기타.html", function(data) {
  $("h2#취미 + section.sup").append(data);
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
