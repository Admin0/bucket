// setting__stat (dashboard)
if (window.localStorage['setting__stat_on'] == "true") {
  info();
  $("#setting__stat").removeClass("disabled");
} else {
  $("#setting__stat").addClass("disabled");
}
if (window.localStorage["setting__stat"] == "true" && window.localStorage['setting__stat_on'] == "true") {
  $(".dashboard .pin i").text("turned_in");
} else {
  $(".dashboard .pin i").text("turned_in_not");
}
info_position();
