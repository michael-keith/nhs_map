
var width = window.innerWidth/2,
height = window.innerHeight * 0.9;

var projection = d3
.geoMercator()
.scale(width * 4.6)
.rotate([0, 0, 0])
.center([-1.1743, 52.95])
.translate([width / 2, height / 2]);

var colours = ["#2877b4", "#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c", "#d91B1e", "#dB1D20"];
var colour = d3.scaleThreshold()
.domain([0.01, 0.02, 0.03, 0.05, 0.8, 0.10, 0.12, 0.14 ,0.16, 0.18, 0.20])
.range(colours);

var path = d3.geoPath().projection(projection);　

var svg = d3.select("body")
.select("#nhs_map")
.append("svg")
.attr("width", width)
.attr("height", height);

var map = d3.select("svg")
.call(d3.zoom().on("zoom", function () {
  console.log(d3.event.transform);
  map.attr("transform", d3.event.transform)

  map.selectAll("circle")
  .attr("r", calc_zoom_size(d3.event.transform))

}))
.append("g");

function calc_zoom_size(k) {
  zoom = Math.floor(2 / (d3.event.transform.k / 3));
  console.log(zoom);
  if(zoom < 1) {zoom = 1;}
  if(zoom >= 3) {zoom = 3;}

  return zoom;
}

// Define the div for the tooltip
var tooltip = d3.select("#nhs_map").append("div")
.attr("class", "tooltip")
.style("opacity", 1);

var hospital_info = svg.append("text")
.attr("class", "trust_info")
.attr("x", width - 300)
.attr("y", 40);

var trust_info = svg.append("text")
.attr("class", "trust_info")
.attr("x", width - 300)
.attr("y", 60);

d3.json("uk.json", drawMaps);

function drawMaps(geojson) {

  map.selectAll("path")
  .data(geojson.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("class", function(d){return d.properties.EER13NM;})
  .on("mouseover", function(d) {
    // d3.select(this)
    // .style("stroke-width", 1)
  })
  .on("mouseout", function(d) {
    //d3.select(this)
    //.style("stroke-width", 0.3)
  })
  .on("click", function(d) {
    // d3.select(this)
    // .style("fill", "green");
    console.log(d.properties)
  })

  d3.json("hospitals.json", drawPoints);

}

function drawPoints(hospitals_json) {

  var staffByHospital = {};
  hospitals_json.forEach(function(d) { staffByHospital[d.id] = +d.eu_staff_perc/100; });

  // add circles to svg
  map.selectAll("circle")
  .data(hospitals_json)
  .enter()
  .append("circle")
  .attr("cx", function(d) { return projection([d.lon,d.lat])[0]; })
  .attr("cy", function(d) { return projection([d.lon,d.lat])[1]; })
  .attr("r", "3px")
  .attr("class", function(d){ return d.trust;})
  .style("fill", function(d) { return colour(staffByHospital[d.id]); })
  .on("mouseover", function(d) {
    console.log(d.eu_staff_perc);

    map.selectAll("circle")
    .style("stroke-opacity", 0)
    //.style("opacity", 0.05);

    map.selectAll("." + d.trust)
    .style("stroke-opacity", "1")
    //.style("opacity", 1);

    hospital_info.html(d.name);
    hospital_info.attr("x", width - hospital_info.node().getBBox().width - 10 );

    trust_info.html(d.clean_trust);
    trust_info.attr("x", width - trust_info.node().getBBox().width - 10 );

  })
  .on("mouseout", function(d) {
    hospital_info.html("");
    trust_info.html("");
    map.selectAll("circle")
    .style("opacity", 1);
    map.selectAll("." + d.trust)
    .style("stroke-opacity", 0)
  })
  .on("click", function(d) {
    map.selectAll("circle")
    .style("fill-opacity", 0.02);

    map.selectAll("." + d.trust)
    .attr("clicked", 1)
    .style("fill-opacity", 1)
    .style("stroke-opacity", 1);
  })

}

/////////////////////////////////////////////////////////////////////////
//////////////////////// Draw the legend ////////////////////////////////
/////////////////////////////////////////////////////////////////////////

//Needed for gradients
var defs = svg.append("defs");

var colourRange = d3.range(0, 1, 1.0 / (colours.length - 1));
colourRange.push(1);

//Calculate the gradient
defs.append("linearGradient")
.attr("id", "gradient-rainbow-colors")
.attr("x1", "0%").attr("y1", "0%")
.attr("x2", "100%").attr("y2", "0%")
.selectAll("stop")
.data(colours)
.enter().append("stop")
.attr("offset", function(d,i) { return i/(colours.length-1); })
.attr("stop-color", function(d) { return d; });

var legendWidth = width * 0.5,
legendHeight = 10;

//Colour Legend container
var legendsvg = svg.append("g")
.attr("class", "legendWrapper")
.attr("transform", "translate(" + (width/2) + "," + (height-50) + ")");

//Background box
legendsvg.append("rect")
.attr("x", (-legendWidth * 1.2)/2)
.attr("y", -20)
.attr("width", legendWidth * 1.2)
.attr("height", "80px")
.attr("fill", "white")
.style("opacity", "0.7");

//Draw the Rectangle
legendsvg.append("rect")
.attr("class", "legendRect")
.attr("x", -legendWidth/2)
.attr("y", 10)
//.attr("rx", legendHeight/2)
.attr("width", legendWidth)
.attr("height", legendHeight)
.style("fill", "none");

//Append title
legendsvg.append("text")
.attr("class", "legendTitle")
.attr("x", 0)
.attr("y", -2)
.text("Percentage of EU staff");

//Set scale for x-axis
var xScale = d3.scaleLinear()
.range([0, legendWidth])
.domain([0,0.2]);
//.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

//Define x-axis
var formatPercent = d3.format(".0%");
var xAxis = d3.axisBottom()
.ticks(10)  //Set rough # of tick
.tickFormat(formatPercent)
.scale(xScale);

//Set up X axis
legendsvg.append("g")
.attr("class", "axis")  //Assign "axis" class
.attr("transform", "translate(" + (-legendWidth/2) + "," + (10 + legendHeight) + ")")
.call(xAxis);

svg.select(".legendRect")
.style("fill", "url(#gradient-rainbow-colors)");
