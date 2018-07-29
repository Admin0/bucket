// 전역 함수
var list_total, acheieved, percent_total;

function percentage() {

  // 세포분열
  list_total = ($("input").length - $("input[failed]").length);
  if (list_total >= 1000) {
    $("#세포분열_1000").attr("checked", true);
    $("#세포분열_1000 + dt + dd > .date").text(list_total + "개 생성");
  }
  if (list_total >= 500) {
    $("#세포분열_500").attr("checked", true);
    $("#세포분열_500 + dt + dd > .date").text(list_total + "개 생성");
  }
  if (list_total >= 100) {
    $("#세포분열_100").attr("checked", true);
    $("#세포분열_100 + dt + dd > .date").text(list_total + "개 생성");
  }

  //재귀함수
  function checke_total() {
    acheieved = $("input[checked]").length;
    percent_total = (acheieved / list_total * 100).toFixed(0);
    if (percent_total >= 75) {
      $("#재귀함수_75").attr("checked", true);
    }
    if (percent_total >= 50) {
      $("#재귀함수_50").attr("checked", true);
    }
    if (percent_total >= 25) {
      $("#재귀함수_25").attr("checked", true);
    }

    if (percent_total != (acheieved / list_total * 100).toFixed(0)) {
      checke_total();
    }
  }
  checke_total();

  if (percent_total >= 75) {
    $("#재귀함수_75 + dt + dd > .date").text("." + percent_total + " 완료");
  } else if (percent_total >= 50) {
    $("#재귀함수_50 + dt + dd > .date").text("." + percent_total + " 완료");
  } else if (percent_total >= 25) {
    $("#재귀함수_25 + dt + dd > .date").text("." + percent_total + " 완료");
  }

  $("h1").append("<class class='percentage'>" + percent_total + "% (" +
    acheieved + "/" + list_total + ")</span>");

  $("h2:not(nav h2, #실적)").each(function() {
    var i = $("h2").index(this);
    $(this).append("<span class='percentage'>" + ($("h2:nth(" + i + ") + section.sup input[checked]").length / $("h2:nth(" + i + ") + section.sup input").length * 100).toFixed(0) + "%</span>");
  });

  $("h3:not(nav h3)").each(function() {
    var i = $("h3").index(this);
    $(this).append("<span class='percentage'>" + ($("h3:nth(" + i + ") + section.sub input[checked]").length / $("h3:nth(" + i + ") + section.sub input").length * 100).toFixed(0) + "%</span>");
  });
}

// 대시보드
function info() {
  var acheieved_in_this_year = 0, // 올해
    acheieved_in_last_year = 0, //지난해
    acheieved_in_lastlast_year = 0, //지지난해
    acheieved_in_recent_3_years = 0; //최근 3년... 인데 지난해랑 지지난해 뺀거
  acheieved_in_recent_3_6_years = 0; //최근 3년... 이후 3년 ㅎ
  var this_year = new Date().getFullYear();
  var this_month = ("00" + (new Date().getMonth() + 1)).slice(-2);
  for (i = 0; i < $("span.date").length; i++) {
    var year = $("span.date")[i].innerHTML.substring(0, 4);
    var month = $("span.date")[i].innerHTML.substring(5, 7);
    if (year == this_year) {
      acheieved_in_this_year++;
    } else if (year == this_year - 1) {
      acheieved_in_last_year++;
    } else if (year == this_year - 2) {
      acheieved_in_lastlast_year++;
    } else if (year == this_year - 3) {
      if (month >= this_month) {
        acheieved_in_recent_3_years++;
      } else {
        acheieved_in_recent_3_6_years++;
      }
    } else if (year >= this_year - 6) {
      if (month >= this_month) {
        acheieved_in_recent_3_6_years++;
      }
    }
  }


  $("#acheieved_in_this_year").text(acheieved_in_this_year);
  $("#acheieved_in_last_year").text(acheieved_in_last_year);
  $("#acheieved_in_lastlast_year").text(acheieved_in_lastlast_year);
  $("#acheieved_in_recent_3_years").text(acheieved_in_this_year + acheieved_in_last_year + acheieved_in_lastlast_year + acheieved_in_recent_3_years);
  $("#acheieved_in_recent_3_6_years").text(acheieved_in_recent_3_6_years);
  $("#acheieved_count").html(acheieved + " <span style='font-size:.75em;'>(" + percent_total + "%)</span>");

  $("#acheieved_in_last_year_subtitle").html(((acheieved_in_last_year >= acheieved_in_lastlast_year) ? "▲ " : "▼ ") + (acheieved_in_last_year - acheieved_in_lastlast_year) + " (" + ((acheieved_in_last_year - acheieved_in_lastlast_year) / acheieved_in_lastlast_year * 100).toFixed(0) + "%)<br/>vs. 지지난해");
  $("#acheieved_in_recent_3_years_subtitle").html(((acheieved_in_recent_3_years >= acheieved_in_recent_3_6_years) ? "▲ " : "▼ ") + (acheieved_in_recent_3_years - acheieved_in_recent_3_6_years) + " (" + ((acheieved_in_recent_3_years - acheieved_in_recent_3_6_years) / acheieved_in_recent_3_6_years * 100).toFixed(0) + "%)<br/>vs. 그 이전 3년간과 비교합니다.");

  // console.log("acheieved_this_year (" + i + "):" + acheieved_this_year);
}

$(document).ready(function() {
  percentage();
  info();
});
