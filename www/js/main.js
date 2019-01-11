var trusts=[];
var lines = [];

jQuery.getJSON("json/trusts.json", function(data) {
  trusts = data;
});
jQuery.getJSON("json/lines.json", function(data) {
  lines = data;

  chart_box("ouh", 313);
  chart_box("barts", 12);
  chart_box("lth", 295);
  chart_box("coch", 241);

  chart_box("uhb", 300);

});

function chart_box(div_base, id) {
  generate_chart(div_base + "_total", id, "all_eu_staff");
  generate_chart(div_base + "_doctors", id, "doctors");
  generate_chart(div_base + "_nurses", id, "nurses");
  generate_chart(div_base + "_midwives", id, "midwives");

  $("#" + div_base + "_total").parent().parent().parent().find("h3").text( lines[id].name );
}

function display_trust(trust_id) {

  $("#map_details_title").text(trusts[trust_id-1].name);
  $("#map_details_title").stop().css("opacity", 0 );
  $("#map_details_title").stop().css("border-color", colour(trusts[trust_id-1]["eu_staff_perc"]/100) );
  $("#map_details_title").fadeTo(1000, 1);

  update_details(trust_id, "eu_staff");
  update_details(trust_id, "frontline");
  update_details(trust_id, "doctors");
  update_details(trust_id, "nurses");
  update_details(trust_id, "midwives");

  // $("#constit_details").html("");
  // trusts[trust_id-1]["constits"].forEach(function(constit){
  //   console.log(constit[0].name);
  //   $("#constit_details").append("<p>" + constit[0].name + " - " + constit[0].vote + "</p>");
  // })

}

// Change the details side and update colours, do the fade in transition, etc...
function update_details(trust_id, div_id, subtitle_id) {

  //Headlines and border
  $("#" + div_id + "_perc").html(trusts[trust_id-1][div_id + "_perc"] + "<span class='percent'>%</span>");
  $("#" + div_id + "_perc").parent().css("background-color", "#FFF" );
  $("#" + div_id + "_perc").parent().css("color", "#000" );
  $("#" + div_id + "_perc").parent().stop().css("opacity", 0 );
  $("#" + div_id + "_perc").parent().css("border-color", colour(trusts[trust_id-1][div_id + "_perc"]/100) );
  $("#" + div_id + "_perc").parent().fadeTo(1000, 1);

  //Subtitles
  if(div_id == "eu_staff") {
    $("#" + div_id + "_total").text( "(" + trusts[trust_id-1][div_id] + "/" + numberWithCommas(trusts[trust_id-1]["total_staff"]) + ")" );
  }
  else {
    $("#" + div_id + "_total").text( "(" + trusts[trust_id-1][div_id + "_eu"] + "/" + numberWithCommas(trusts[trust_id-1][div_id + "_total"]) + ")" );
  }

  if(trusts[trust_id-1][div_id + "_perc"] == 0 && trusts[trust_id-1][div_id + "_total"] == 0) {
    $("#" + div_id + "_perc").parent().css("border-color", "#acacac" );
    $("#" + div_id + "_perc").parent().css("color", "#acacac" );
    $("#" + div_id + "_perc").parent().css("background-color", "#ececec" );
  }

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
