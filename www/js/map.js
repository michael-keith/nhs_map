
var width = document.getElementById("nhs_map").offsetWidth - 10,
height = window.innerHeight * 0.75;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var projection = d3
.geoMercator()
.scale(width * 4.3)
.rotate([0, 0, 0])
.center([-2.2943, 52.85])
.translate([width / 2, height / 2]);

var colours = ["#2877b4", "#2c7bb6", "#00a6ca", "#00ccbc","#90eb9d","#efef7c","#f9d057","#f29e2e","#e76818","#d7191c", "#dB1D20"];
var colour_range = d3.range(0, 1, 0.2 / (colours.length - 1));
colour_range.push(1);

var colour = d3.scaleThreshold()
.domain( colour_range )
.range(colours);

var border_width = 0.5;

var path = d3.geoPath().projection(projection);

var zoom = d3.zoom().on("zoom", zoomed);

var svg = d3.select("body")
.select("#nhs_map")
.append("svg")
.attr("width", width)
.attr("height", height)
.call(zoom)
.on("dblclick.zoom", null);

var map = d3.select("svg")
.append("g");

function zoomed() {
  map.selectAll("circle")
  .attr("r", calc_zoom_size(d3.event.transform.k));

  map.attr("transform", d3.event.transform);
}

function calc_zoom_size(k) {
  let zoom = 2 / (k / 3);
  console.log(zoom);
  if(zoom < 0.2) {zoom = 0.2;}
  if(zoom >= 3) {zoom = 3;}

  if(zoom<0.5){border_width = 0.1;}
  else {border_width = 0.5;}

  return zoom;
}

// Define the containers for the 'tooltop' info
var tooltip = svg.append("rect")
.attr("class", "det_bg")
.attr("width", 0)
.attr("height", 58)
.attr("x", 0)
.attr("y", 18);

var hospital_info = svg.append("text")
.attr("class", "trust_info")
.attr("x", width - 300)
.attr("y", 40);

var trust_info = svg.append("text")
.attr("class", "trust_info")
.attr("x", width - 300)
.attr("y", 60);

d3.json("json/uk.json", drawMaps);

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
    //console.log(d.properties)
  })

  d3.json("json/hospitals.json", drawPoints );

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
    // map.selectAll("circle")
    // .style("stroke-opacity", 0)

    map.selectAll("." + d.trust)
    .style("stroke-width", border_width);

    hospital_info.html(d.name);
    hospital_info.attr("x", width - hospital_info.node().getBBox().width - 20 );

    trust_info.html(d.clean_trust);
    trust_info.attr("x", width - trust_info.node().getBBox().width - 20 );

    if( trust_info.node().getBBox().width > hospital_info.node().getBBox().width) {
      max_width = trust_info.node().getBBox().width;
    }
    else {max_width = hospital_info.node().getBBox().width; }

    tooltip.attr("x", width - max_width - 30 );
    tooltip.attr("width", max_width + 20 );

  })
  .on("mouseout", function(d) {
    hospital_info.html("");
    trust_info.html("");
    tooltip.attr("width", 0 );
    // map.selectAll("circle")
    // .style("opacity", 1);
    map.selectAll("." + d.trust)
    .style("stroke-width", 0)
  })
  .on("click", function(d) {
    display_trust(d.trust_id);
    // map.selectAll("circle")
    // .style("fill-opacity", 0.02);
    //
    // map.selectAll("." + d.trust)
    // .attr("clicked", 1)
    // .style("fill-opacity", 1)
    // .style("stroke-opacity", 1);
  })

}

function update(type, clean_title) {

  d3.json("json/hospitals.json", function(error, data) {

    var circles = map.selectAll("circle")
    .data(data)
    .style("fill", function(d) {
      return colour(d[type]/100);
    })
  });

  d3.select("#map_select_title")
  .html(clean_title);

}

// Draw the legend

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
.attr("transform", "translate(" + (width/2) + "," + (height-60) + ")");

//Background box
legendsvg.append("rect")
.attr("class", "legend")
.attr("x", (-legendWidth * 1.2)/2)
.attr("y", -20)
.attr("width", legendWidth * 1.2)
.attr("height", "65px");

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

//Zoom buttons
var zoom_button_size = 36;

var zoom_controls = svg.append("g")
.attr("class", "zoom_controls")
.attr("transform", "translate(" + 15 + "," + 15 + ")");

var zoom_in = zoom_controls.append("g")
.attr("id", "zoom_in")
.attr("class", "zoom_button");
zoom_in.append("rect")
.attr("width", zoom_button_size)
.attr("height", zoom_button_size)
.style("fill", "white");

var zoom_out = zoom_controls.append("g")
.attr("id", "zoom_out")
.attr("class", "zoom_button")
.on("click", function(d) {
  console.log("zoom_out")
});
zoom_out.append("rect")
.attr("y", zoom_button_size)
.attr("width", zoom_button_size)
.attr("height", zoom_button_size)
.style("fill", "white");

// + button
zoom_in.append("line")
.attr("x1", zoom_button_size/2)
.attr("y1", 10)
.attr("x2", zoom_button_size/2)
.attr("y2", 26)
.attr("stroke-width", 4)
.attr("stroke", "#666666");
zoom_in.append("line")
.attr("x1", 10)
.attr("y1", zoom_button_size/2)
.attr("x2", 26)
.attr("y2", zoom_button_size/2)
.attr("stroke-width", 4)
.attr("stroke", "#666666");

// - button
zoom_out.append("line")
.attr("x1", 10)
.attr("y1", zoom_button_size + (zoom_button_size/2) )
.attr("x2", 26)
.attr("y2", zoom_button_size + (zoom_button_size/2) )
.attr("stroke-width", 4)
.attr("stroke", "#666666");

// +/- divider
zoom_controls.append("line")
.attr("x1", 5)
.attr("y1", zoom_button_size)
.attr("x2", 31)
.attr("y2", zoom_button_size)
.attr("stroke-width", 1)
.attr("stroke", "#e6e6e6");

d3.select("#zoom_in").on("click", function() {
  zoom.scaleBy(svg.transition().duration(300), 2);
});
d3.select("#zoom_out").on("click", function() {
  zoom.scaleBy(svg.transition().duration(300), 0.5);
});
