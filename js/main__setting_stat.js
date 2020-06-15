// setting__stat (dashboard)
if (localStorage.setting__stat_on == "true") {
  info();
  $("#setting__stat").removeClass("disabled");
} else {
  $("#setting__stat").addClass("disabled");
}
if (localStorage.setting__stat == "true" && localStorage.setting__stat_on == "true") {
  $(".dashboard .pin i").text("turned_in");
} else {
  $(".dashboard .pin i").text("turned_in_not");
}
info_position();
