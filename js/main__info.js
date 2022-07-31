// 전역 함수
let acheieved = {
  "stat": { //for percentage
    "total": 0, // 전체 도전과제의 수
    "done": 0, // 달성된 항목의 수
    "faild": 0, // 달성 불가능한 항목의 수
    "percentage": 0, // 달성/전체의 비율
  },
  "in": { //for dashboard
    "this_year": 0, // 올해
    "last_year": 0, //지난해
    "lastlast_year": 0, //지지난해
    "years_ago_3": 0, //지지지난해
    "recent_3_years": 0, //최근 3년... 인데 지난해랑 지지난해 뺀거
    "recent_3_6_years": 0, //최근 3년... 이후 3년 ㅎ
    "month": {
      "january": 0,
      "february": 0,
      "march": 0,
      "april": 0,
      "may": 0,
      "june": 0,
      "july": 0,
      "august": 0,
      "september": 0,
      "october": 0,
      "november": 0,
      "december": 0,
      "null": 0, //미등록
    }
  }
};


function percentage() {

  // 세포분열
  acheieved.stat.failed = $("dt[failed]").length;
  acheieved.stat.total = ($("dt").length - acheieved.stat.failed);
  if (acheieved.stat.total + acheieved.stat.failed >= 1000) {
    $("#세포분열_1000").attr("checked", true);
  }
  if (acheieved.stat.total + acheieved.stat.failed >= 500) {
    $("#세포분열_500").attr("checked", true);
  }
  if (acheieved.stat.total + acheieved.stat.failed >= 100) {
    $("#세포분열_100").attr("checked", true);
  }

  //재귀함수
  function checke_total() {
    acheieved.stat.done = $("dt[checked]").length;
    acheieved.stat.percentage = (acheieved.stat.done / acheieved.stat.total * 100).toFixed(0);
    if (acheieved.stat.percentage >= 75) {
      $("#재귀함수_75").attr("checked", true);
    }
    if (acheieved.stat.percentage >= 50) {
      $("#재귀함수_50").attr("checked", true);
    }
    if (acheieved.stat.percentage >= 25) {
      $("#재귀함수_25").attr("checked", true);
    }

    if (acheieved.stat.percentage != (acheieved.stat.done / acheieved.stat.total * 100).toFixed(0)) {
      checke_total();
    }
  }
  checke_total();

  if (acheieved.stat.total + acheieved.stat.failed >= 1000) {
    $("#세포분열_1000 + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  } else if (acheieved.stat.total + acheieved.stat.failed >= 500) {
    $("#세포분열_500 + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  } else if (acheieved.stat.total + acheieved.stat.failed >= 100) {
    $("#세포분열_100 + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  }

  if (acheieved.stat.percentage >= 75) {
    $("#재귀함수_75 + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  } else if (acheieved.stat.percentage >= 50) {
    $("#재귀함수_50 + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  } else if (acheieved.stat.percentage >= 25) {
    $("#재귀함수_25 + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  }

  $("h1").append("<class class='percentage'>" + acheieved.stat.percentage + "% (" +
    acheieved.stat.done + "/" + acheieved.stat.total + ")</span>");

  $("h2:not(nav h2, #실적)").each(function() {
    var i = $("h2").index(this);
    $(this).append("<span class='percentage'>" + ($("h2:nth(" + i + ") + section.sup dt[checked]").length / $("h2:nth(" + i + ") + section.sup dt").length * 100).toFixed(0) + "%</span>");
  });

  $("h3:not(nav h3)").each(function() {
    var i = $("h3").index(this);
    $(this).append("<span class='percentage'>" + ($("h3:nth(" + i + ") + section.sub dt[checked]").length / $("h3:nth(" + i + ") + section.sub dt").length * 100).toFixed(0) + "%</span>");
  });
}

var this_year = new Date().getFullYear();
var this_month = ("00" + (new Date().getMonth() + 1)).slice(-2);
var i_info = 0;
var info_count = 25;
var info_timmer = 300; //css transition과 같은 값으로 설정해야한다.
var info_width = $(".dashboard").width();
var info_height = $(".dashboard").height();
var info_length = $("span.date").length;

function info() { // 대시보드
  $("#acheieved_count").html(acheieved.stat.done);
  $("#acheieved_count_subtitle").html(acheieved.stat.percentage + "%<br/>현재까지의 달성율<span class='not_important'>을 나타냅니다.</span>");
  $("#unacheieved_count").text(acheieved.stat.total - acheieved.stat.done);
  $("#list_count").text(acheieved.stat.total + acheieved.stat.failed);
  $("#failed_count").text(acheieved.stat.failed);
  $("#failed_count_subtitle").html((acheieved.stat.failed / (acheieved.stat.failed + acheieved.stat.total) * 100).toFixed(0) + "%<br/>영원히 달성 불가능한 과제입니다.");

  setTimeout(function() {
    if (i_info < $("span.date").length) {

      function inner_info() {
        var year = $("span.date")[i_info].innerHTML.substring(0, 4);
        var month = $("span.date")[i_info].innerHTML.substring(5, 7);
        if (year == this_year) {
          acheieved.in.this_year++;
          acheieved.in.recent_3_years++;
        } else if (year == this_year - 1) {
          acheieved.in.last_year++;
          acheieved.in.recent_3_years++;
        } else if (year == this_year - 2) {
          acheieved.in.lastlast_year++;
          acheieved.in.recent_3_years++;
        } else if (year == this_year - 3) {
          acheieved.in.years_ago_3++;
          if (month >= this_month) {
            acheieved.in.recent_3_years++;
          } else {
            acheieved.in.recent_3_6_years++;
          }
        } else if (year >= this_year - 6) {
          if (month >= this_month) {
            acheieved.in.recent_3_6_years++;
          }
        }
        i_info++;
      }

      for (var i = 0; i < info_count; i++) {
        if (i_info < $("span.date").length) {
          inner_info();
        }
      }

      $("#acheieved_in_this_year").text(acheieved.in.this_year);
      $("#acheieved_in_this_year_subtitle").html(((acheieved.in.this_year >= acheieved.in.last_year) ? "▴ " : "▾ ") + (acheieved.in.this_year - acheieved.in.last_year) + " (" + ((acheieved.in.this_year - acheieved.in.last_year) / acheieved.in.last_year * 100).toFixed(0) + "%)<br/>vs. 지난해");
      $("#acheieved_in_last_year").text(acheieved.in.last_year);
      $("#acheieved_in_last_year_subtitle").html(((acheieved.in.last_year >= acheieved.in.lastlast_year) ? "▴ " : "▾ ") + (acheieved.in.last_year - acheieved.in.lastlast_year) + " (" + ((acheieved.in.last_year - acheieved.in.lastlast_year) / acheieved.in.lastlast_year * 100).toFixed(0) + "%)<br/>vs. 지지난해");
      $("#acheieved_in_lastlast_year").text(acheieved.in.lastlast_year);
      $("#acheieved_in_lastlast_year_subtitle").html(((acheieved.in.lastlast_year >= acheieved.in.years_ago_3) ? "▴ " : "▾ ") + (acheieved.in.lastlast_year - acheieved.in.years_ago_3) + " (" + ((acheieved.in.lastlast_year - acheieved.in.years_ago_3) / acheieved.in.years_ago_3 * 100).toFixed(0) + "%)<br/>vs. " + (this_year - 3) + "년");
      $("#acheieved_in_recent_3_years").text(acheieved.in.recent_3_years);
      $("#acheieved_in_recent_3_years_subtitle").html(((acheieved.in.recent_3_years >= acheieved.in.recent_3_6_years) ? "▴" : "▾ ") + (acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) + " (" + ((acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) / acheieved.in.recent_3_6_years * 100).toFixed(0) + "%)<br/>vs. 그 이전 3년간<span class='not_important'>과 비교합니다.</span>");
      $("#acheieved_in_recent_3_6_years").text(acheieved.in.recent_3_6_years);

      if (localStorage.setting__stat_on != "false") {
        info();
      }

    } else {
      $(".dashboard .progress").delay(250).fadeOut(100);
    }
    $(".dashboard .progress").css({
      "width": "calc(" + i_info / info_length * 100 + "% - 1em)"
    });
  }, info_timmer);

}

function info_pinned() {
  $(".dashboard .pin").on("click", function() {
    if (localStorage.setting__stat == "true") {
      localStorage.setting__stat = "false"
      $(".dashboard .pin i").text("turned_in_not");
      toast("통계 대시보드의 고정이 풀렸습니다.", "pie_chart");
    } else {
      localStorage.setting__stat = "true"
      $(".dashboard .pin i").text("turned_in");
      toast("통계 대시보드가 고정됐습니다.", "pie_chart");
    }
    check_dashboard_floating();
  });
}

percentage();
$("div#splash").addClass("off"); // splash

if (localStorage.setting__stat_on != "false") {
  info();
}
info_pinned();

// var dashboard_top = $(".dashboard").offset().top - 116;
dashboard_top = $("#그거_먹는건가요").offset().top - 32 // main_columns.js에 들어있는 코드인데 태블릿에서 순서 꼬여서 여기다가 하나 더 만들어놓음
dashboard_top = (dashboard_top >= 0 ? dashboard_top : 0);
// let dashboard_height;

function check_dashboard_floating() {
  if (localStorage.setting__stat == "true" && localStorage.setting__stat_on == "true") {
    $("body").addClass("floating_dashboard")
  } else {
    $("body").removeClass("floating_dashboard")
  }
}

$(window).scroll(function() {
  check_dashboard_floating();
});


$(document).ready(function() {
  $(".card_wrap").has(".dashboard").addClass("wrap_dashboard");
  if (localStorage.setting__stat == "true") {
    $(".dashboard .pin i").text("turned_in");
    check_dashboard_floating();
  }
});
