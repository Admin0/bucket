// 전역 함수
var acheieved = {
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
  acheieved.stat.failed = $("input[failed]").length;
  acheieved.stat.total = ($("input").length - acheieved.stat.failed);
  if (acheieved.stat.total >= 1000) {
    $("#세포분열_1000").attr("checked", true);
    $("#세포분열_1000 + dt + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  }
  if (acheieved.stat.total >= 500) {
    $("#세포분열_500").attr("checked", true);
    $("#세포분열_500 + dt + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  }
  if (acheieved.stat.total >= 100) {
    $("#세포분열_100").attr("checked", true);
    $("#세포분열_100 + dt + dd > .date").text(acheieved.stat.total + acheieved.stat.failed + "개 생성");
  }

  //재귀함수
  function checke_total() {
    acheieved.stat.done = $("input[checked]").length;
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

  if (acheieved.stat.percentage >= 75) {
    $("#재귀함수_75 + dt + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  } else if (acheieved.stat.percentage >= 50) {
    $("#재귀함수_50 + dt + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  } else if (acheieved.stat.percentage >= 25) {
    $("#재귀함수_25 + dt + dd > .date").text("." + acheieved.stat.percentage + " 완료");
  }

  $("h1").append("<class class='percentage'>" + acheieved.stat.percentage + "% (" +
    acheieved.stat.done + "/" + acheieved.stat.total + ")</span>");

  $("h2:not(nav h2, #실적)").each(function() {
    var i = $("h2").index(this);
    $(this).append("<span class='percentage'>" + ($("h2:nth(" + i + ") + section.sup input[checked]").length / $("h2:nth(" + i + ") + section.sup input").length * 100).toFixed(0) + "%</span>");
  });

  $("h3:not(nav h3)").each(function() {
    var i = $("h3").index(this);
    $(this).append("<span class='percentage'>" + ($("h3:nth(" + i + ") + section.sub input[checked]").length / $("h3:nth(" + i + ") + section.sub input").length * 100).toFixed(0) + "%</span>");
  });
}

// function info() {
//
//   // 대시보드
//   var this_year = new Date().getFullYear();
//   var this_month = ("00" + (new Date().getMonth() + 1)).slice(-2);
//   for (i = 0; i < $("span.date").length; i++) {
//
//     var year = $("span.date")[i].innerHTML.substring(0, 4);
//     var month = $("span.date")[i].innerHTML.substring(5, 7);
//     if (year == this_year) {
//       acheieved.in.this_year++;
//     } else if (year == this_year - 1) {
//       acheieved.in.last_year++;
//     } else if (year == this_year - 2) {
//       acheieved.in.lastlast_year++;
//     } else if (year == this_year - 3) {
//       acheieved.in.years_ago_3++;
//       if (month >= this_month) {
//         acheieved.in.recent_3_years++;
//       } else {
//         acheieved.in.recent_3_6_years++;
//       }
//     } else if (year >= this_year - 6) {
//       if (month >= this_month) {
//         acheieved.in.recent_3_6_years++;
//       }
//     }
//     $("#acheieved_in_this_year").text(acheieved.in.this_year);
//     $("#acheieved_in_last_year").text(acheieved.in.last_year);
//     $("#acheieved_in_lastlast_year").text(acheieved.in.lastlast_year);
//     $("#acheieved_in_recent_3_years").text(acheieved.in.this_year + acheieved.in.last_year + acheieved.in.lastlast_year + acheieved.in.recent_3_years);
//     $("#acheieved_in_recent_3_6_years").text(acheieved.in.recent_3_6_years);
//     $("#acheieved_count").html(acheieved.stat.done);
//     $("#unacheieved_count").text(acheieved.stat.total - acheieved.stat.done);
//     $("#list_count").text(acheieved.stat.total + acheieved.stat.failed);
//     $("#failed_count").text(acheieved.stat.failed);
//
//     $("#acheieved_in_last_year_subtitle").html(((acheieved.in.last_year >= acheieved.in.lastlast_year) ? "▴ " : "▾ ") + (acheieved.in.last_year - acheieved.in.lastlast_year) + " (" + ((acheieved.in.last_year - acheieved.in.lastlast_year) / acheieved.in.lastlast_year * 100).toFixed(0) + "%)<br/>vs. 지지난해");
//     $("#acheieved_in_lastlast_year_subtitle").html(((acheieved.in.lastlast_year >= acheieved.in.years_ago_3) ? "▴ " : "▾ ") + (acheieved.in.lastlast_year - acheieved.in.years_ago_3) + " (" + ((acheieved.in.lastlast_year - acheieved.in.years_ago_3) / acheieved.in.years_ago_3 * 100).toFixed(0) + "%)<br/>vs. " + (this_year - 3) + "년");
//     $("#acheieved_in_recent_3_years_subtitle").html(((acheieved.in.recent_3_years >= acheieved.in.recent_3_6_years) ? "▴" : "▾ ") + (acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) + " (" + ((acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) / acheieved.in.recent_3_6_years * 100).toFixed(0) + "%)<br/>vs. 그 이전 3년간<span class='not_important'>과 비교합니다.</span>");
//     $("#acheieved_count_subtitle").html(acheieved.stat.percentage + "%<br/>현재까지의 달성율<span class='not_important'>을 나타냅니다.</span>");
//     $("#failed_count_subtitle").html((acheieved.stat.failed / (acheieved.stat.failed + acheieved.stat.total) * 100).toFixed(0) + "%<br/>영원히 달성 불가능한 과제입니다.");
//   }
//
//   $(".dashboard .rotate").remove();
//   // console.log("acheieved_this_year (" + i + "):" + acheieved_this_year);
// }

var this_year = new Date().getFullYear();
var this_month = ("00" + (new Date().getMonth() + 1)).slice(-2);
var i_info = 0;

function info() {
  // 대시보드

  setTimeout(function() {
    if (i_info < $("span.date").length) {

      function inner_info() {
        var year = $("span.date")[i_info].innerHTML.substring(0, 4);
        var month = $("span.date")[i_info].innerHTML.substring(5, 7);
        if (year == this_year) {
          acheieved.in.this_year++;
        } else if (year == this_year - 1) {
          acheieved.in.last_year++;
        } else if (year == this_year - 2) {
          acheieved.in.lastlast_year++;
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
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      if (i_info < $("span.date").length) {
        inner_info();
      }
      $("#acheieved_in_this_year").text(acheieved.in.this_year);
      $("#acheieved_in_last_year").text(acheieved.in.last_year);
      $("#acheieved_in_lastlast_year").text(acheieved.in.lastlast_year);
      $("#acheieved_in_recent_3_years").text(acheieved.in.this_year + acheieved.in.last_year + acheieved.in.lastlast_year + acheieved.in.recent_3_years);
      $("#acheieved_in_recent_3_6_years").text(acheieved.in.recent_3_6_years);

      $("#acheieved_in_last_year_subtitle").html(((acheieved.in.last_year >= acheieved.in.lastlast_year) ? "▴ " : "▾ ") + (acheieved.in.last_year - acheieved.in.lastlast_year) + " (" + ((acheieved.in.last_year - acheieved.in.lastlast_year) / acheieved.in.lastlast_year * 100).toFixed(0) + "%)<br/>vs. 지지난해");
      $("#acheieved_in_lastlast_year_subtitle").html(((acheieved.in.lastlast_year >= acheieved.in.years_ago_3) ? "▴ " : "▾ ") + (acheieved.in.lastlast_year - acheieved.in.years_ago_3) + " (" + ((acheieved.in.lastlast_year - acheieved.in.years_ago_3) / acheieved.in.years_ago_3 * 100).toFixed(0) + "%)<br/>vs. " + (this_year - 3) + "년");
      $("#acheieved_in_recent_3_years_subtitle").html(((acheieved.in.recent_3_years >= acheieved.in.recent_3_6_years) ? "▴" : "▾ ") + (acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) + " (" + ((acheieved.in.recent_3_years - acheieved.in.recent_3_6_years) / acheieved.in.recent_3_6_years * 100).toFixed(0) + "%)<br/>vs. 그 이전 3년간<span class='not_important'>과 비교합니다.</span>");
      info();
    } else {
      // $(".dashboard .rotate").remove();
      $(".dashboard .progress").remove();
      toast("통계 불러오기 완료", "pie_chart");
      // console.log(columns);
      // info_columns();
    }
    $(".dashboard .progress").css({
      "width": "calc(" + i_info / $("span.date").length * 100 + "% - 1em)"
    });
    // console.log(i_info + "/" + $("span.date").length);
    // i_info++;
  }, 1);

  $("#acheieved_count").html(acheieved.stat.done);
  $("#acheieved_count_subtitle").html(acheieved.stat.percentage + "%<br/>현재까지의 달성율<span class='not_important'>을 나타냅니다.</span>");
  $("#unacheieved_count").text(acheieved.stat.total - acheieved.stat.done);
  $("#list_count").text(acheieved.stat.total + acheieved.stat.failed);
  $("#failed_count").text(acheieved.stat.failed);
  $("#failed_count_subtitle").html((acheieved.stat.failed / (acheieved.stat.failed + acheieved.stat.total) * 100).toFixed(0) + "%<br/>영원히 달성 불가능한 과제입니다.");


  function info_columns() {
    var columns = Math.floor($("body").width() / 500);
    if (columns <= 1) {
      $(".not_important").css({
        "display": "none"
      });
    } else {
      $(".not_important").css({
        "display": "initial"
      });
    }
  }
  info_columns();
  // console.log("acheieved_this_year (" + i + "):" + acheieved_this_year);
}


percentage();
info();

// $(document).ready(function() {
//
// });
