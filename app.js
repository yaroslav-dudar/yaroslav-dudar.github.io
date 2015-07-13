// CFC Location
$('map_usa').empty();
d3.csv("Entity_CFCs.csv", function(data) {
    var map = new Datamap({
        element: document.getElementById('map_usa'),
        projection: 'mercator',
        scope: 'usa',
        responsive: true,
        geographyConfig: {
            borderColor: '#000000',
            highlightFillColor: '#989898',
            highlightBorderColor: '#000000',
        },
        bubblesConfig: {
            borderColor: '#000000',
            highlightBorderColor: '#000000',
            highlightFillColor: '#003300',
        },
        fills: {
            defaultFill: "#F8F8F8",
            marker: '#006633',
        },
        
        setProjection: function(element) {
            var projection = d3.geo.equirectangular()
              .center([-113, 33.5])
              .rotate([0, 30])
              .scale(2000)
              .translate([700 / 2, 500 / 2]);
            var path = d3.geo.path()
              .projection(projection);
            
            return {path: path, projection: projection};
        },


    });

    d3.select(window).on('resize', function() {
        map.resize();
    });

    var bubbles = []
    for (var i=0; i < data.length - 1; i++) {
        bubbles.push({
            name: data[i].Name, latitude: data[i].Lat,
            longitude: data[i].Lng, radius: 3, reviewer: data[i].Reviewer,
            city: data[i].City, address: data[i].Address1, fillKey: 'marker',
        });
    }
    map.bubbles(bubbles, {
        popupTemplate: function(geo, data) {
            return "<div class='hoverinfo' style='font-size: 10px;'><p>Name: " + 
                data.name + "</p><p>Address: " + data.address + ', ' + data.city +  "</p></div>";
        }
    });
});

// CFC history
var providers = {'24': '24 - ARCHWAY, INC', '25': '25 - OPTIONS & ADVOCACY FOR MCHENRY COUNTY', '20': '20 - ARC COMMUNITY SUPPORT SYSTEMS', '21': '21 - SPECIAL CHILDREN, INC', '22': '22 - ROE #13', '23': '23 - WABASH & OHIO VALLEY SPECIAL ED DISTRICT', '1': '01 - ACCESS SERVCIES OF NORTHEN ILLINOIS', '3': '03 - ROE FOR CARROLL, JO DAVIESS, & STEPHENSON CO', '2': '02 - LAKE COUNTY HEALTH DEPARTMENT', '5': '05 - PACT, INC.', '4': '04 - DAYONE NETWORK', '7': '07 - SUBURBAN ACCESS, INC', '6': '06 - CLEARBROOK CENTER', '9': '09 - HEKTOEN INSTITUTE FOR MEDICAL RESEARCH', '8': '08 - EASTER SEALS SOCIETY OF METO CHICAGO', '13': '13 - EDUCATION SERVICE REGION #26', '11': '11 - RUSH UNIVERSITY MEDICAL CENTER', '10': "10 - LARABIDA CHILDREN'S HOSPITAL", 'Entity_ID': 'Name', '12': '12 - EASTER SEALS SOCIETY OF METRO CHICAGO', '15': '15 - SERVICES OF WILL, GRUNDY, & KANKAKEE COUNTIES', '14': '14 - PEORIA COUNTY BOARD FOR THE CARE AND TREATMENT OF PERSO', '17': '17 - ROE OF ADAMS/PIKE COUNTIES', '16': '16 - CROSSPOINT HUMAN SERVICES', '19': '19 - MACON COUNTY COMMUNITY MENTAL HEALTH BOARD', '18': '18 - SANGAMON COUNTY HEALTH DEPARTMENT'}

var create_date_format = d3.time.format("%m/%d/%Y"),
    format = d3.time.format("%Y-%m-%d");

var margin = {top: 20, right: 250, bottom: 0, left: 20},
    width = 760,
    height = 623;

var c = d3.scale.category20();

var x = d3.scale.linear()
    .domain([2007, 2015])
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

var formatYears = d3.format("0000");
xAxis.tickFormat(formatYears);

var svg = d3.select("#cfc_history").append("svg")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMidYMid")
    .style("margin-left", margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//  Tooltip Object
var tooltip = d3.select("body")
  .append("div").attr("id", "tooltip")
  .style("position", "absolute")
  .style("z-index", "100000")
  .style("visibility", "hidden")
  .text("a simple tooltip");

d3.csv("CaseNoteCFC.csv", function(csv) {
    var xScale = d3.time.scale()
        .domain([format.parse("2007-01-01"), format.parse("2015-03-01")])
        .range([0, width]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .style("font-size", "10px")
        .call(xAxis);

    var data = d3.nest()
        .key(function(d) { 
          try {
                return parseInt(d.Provider_ID);  
          }
          catch(err) {}
        })
        .rollup(function(d) { return d; })
        .map(csv);

    delete data['NaN'];
    var row = 0;
    for (var key in data) {
        var g = svg.append("g");

        var provider_data = d3.nest()
            .key(function(d) { 
              try {
                    var m_y = d3.time.format("%Y-%m-01")
                    return m_y(create_date_format.parse(d.Date_Create));  
              }
              catch(err) {
                    return d.Date_Create;
              }
            })
            .rollup(function(d) { return d; })
            .map(data[key]);
        
        var test_data = []
        for (var key_date in provider_data) {
            test_data.push([key_date, provider_data[key_date]]);
        }
        var circles = g.selectAll("circle")
            .data(test_data)
            .enter()
            .append("circle");
        
        var text = g.selectAll("text")
            .data(test_data)
            .enter()
            .append("text");
        
        var rScale = d3.scale.linear()
            .domain([0, d3.max(test_data, function(d) { return d[1].length; })])
            .range([1, 5]);
        
        circles
            .attr("cx", function(d, i) { return xScale(format.parse(d[0])); })
            .attr("cy", row * 20 + 20)
            .attr("r", function(d) { return rScale(d[1].length); })
            .style("fill", function(d) { return c(row); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        g.append("text")
            .attr("y", row * 20 + 20)
            .attr("x",width + 20)
            .attr("class","label")
            .text(providers[key])
            .style("font-size", "7px")
            .style("fill", function(d) { return c(row); })
        row++;
    };

    function mouseover(d) {
            tooltip.style("visibility", "visible");
            var full_data_name = d3.time.format("%B %Y")
            var purchase_text = full_data_name(format.parse(d[0])) + "<br>Casenote count: " + d[1].length;
            tooltip.transition()        
                        .duration(200)      
                        .style("opacity", .9);      
            tooltip.html(purchase_text)  
                        .style("left", (d3.event.pageX) + 30 + "px")     
                        .style("top", (d3.event.pageY) + "px"); 
        }

    function mouseout (d) {
        tooltip.transition()        
          .duration(500)      
          .style("opacity", 0);
    }
});


var data; // loaded asynchronously

var path = d3.geo.path();

var svg2 = d3.select("#illinois-map")
  .attr("viewBox", "0 0 960 500")
  .attr("preserveAspectRatio", "none")
  .append("svg");

var counties = svg2.append("g")
    .attr("id", "counties")
    .attr("class", "Blues");

var states = svg2.append("g")
    .attr("id", "states");

d3.json("ill-counties.json", function(json) {
  counties.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d", path);
});

// scale
svg2
    .attr("transform", "scale(5)translate(-540, -185)rotate(4, 300, 150)")
