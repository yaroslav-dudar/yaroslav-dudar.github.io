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
            .style("z-index", 100000)
            .style("top", (d3.event.pageY) + "px");
    }

    function mouseout (d) {
        tooltip.transition()        
          .duration(500)      
          .style("opacity", 0)
          .style("z-index", -1)
    }
});

// ILLINIOS MAP
var projection = d3.geo.mercator().center([-89, 40]).scale(3500);

var illinois_map = d3.select("#illinois-map").append("svg")
    .attr("viewBox", "0 0 960 500")
    .attr("preserveAspectRatio", "xMidYMid")
    .call(d3.behavior.zoom().scaleExtent([1,5]).on("zoom", function () {
        illinois_map.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }))
    .append('g');

var color = ['#446CB3', '#E4F1FE', '#4183D7', '#336E7B', '#22313F', '#3A539B', '#89C4F4', '#4B77BE',
            '#59ABE3', '#81CFE0', '#52B3D9', '#19B5FE', '#6BB9F0', '#34495E', '#2574A9', '#5C97BF',
            '#C5EFF7', '#22A7F0', '#3498DB', '#2C3E50', '#1E8BC3', '#67809F', '#1F3A93'
]

var sites_cfc = [
    {'name': 'Lake County Health Department', 'counties': d3.set([17097])},
    {'name': 'Regional Office of Education for Carroll, Jo Daviess, & Stephenson Co.', 'counties': d3.set([17015, 17037, 17085, 17103, 17177, 17195])},
    {'name': 'Access Services of Northern Illinois', 'counties': d3.set([17007, 17011, 17123, 17141, 17155, 17201])},
    {'name': 'Reg. Office of Education  # 26', 'counties': d3.set([17057, 17067, 17071, 17095, 17109, 17131, 17161, 17169, 17187])},
    {'name': '3000 W. Rohmann Ave.', 'counties': d3.set([17073, 17143, 17175, 17179, 17203])},
    {'name': 'Services of Will, Grundy, & Kankakee Counties, Inc.', 'counties': d3.set([17063, 17091, 17099, 17197])},
    {'name': '103 S. Country Fair Dr.', 'counties': d3.set([17019, 17053, 17075, 17105, 17113, 17183])},
    {'name': 'ROE of Adams/Pike Counties', 'counties': d3.set([17001, 17009, 17013, 17017, 17061, 17083, 17137, 17149, 17171])},
    {'name': 'Sangamon Co. Public Health Department', 'counties': d3.set([17107, 17125, 17129, 17167])},
    {'name': 'Macon County Community Mental Health Board', 'counties': d3.set([17023, 17029, 17035, 17039, 17041, 17045, 17115, 17139, 17147, 17173])},
    {'name': 'Child & Family Connections', 'counties': d3.set([17005, 17021, 17025, 17033, 17049, 17051, 17079, 17101, 17117, 17135, 17159])},
    {'name': 'Regional Office of Education #13', 'counties': d3.set([17119, 17133, 17157, 17163])},
    {'name': 'Regional Office of Education #13', 'counties': d3.set([17027, 17055, 17081, 17121, 17189, 17199])},
    {'name': 'Wabash & Ohio Valley Special Education Dist.', 'counties': d3.set([17047, 17059, 17065, 17165, 17185, 17191, 17193])},
    {'name': 'Archway, Inc.', 'counties': d3.set([17003, 17069, 17077, 17087, 17127, 17145, 17151, 17153, 17181])},
    {'name': 'Options & Advocacy for McHenry Co.', 'counties': d3.set([17111])},
    {'name': 'DayOne Network', 'counties': d3.set([17089, 17093])},
]

var sites_cfc_zipcodes = [
    {'name': 'Fantus Health Center', 'zipcodes': d3.set([60601, 60602, 60603, 60604, 60605, 60606, 60607, 60608, 60612, 60616,60623, 60624, 60632, 60644, 60661])},
    {'name': 'Clearbrook Center', 'zipcodes': d3.set([60004, 60005, 60006, 60007, 60008, 60010, 60015, 60016, 60018, 60022, 60025, 60026, 60029, 60035, 60043, 60053, 60056, 60062, 60067, 60068, 60070, 60074, 60076, 60077, 60082, 60089, 60090, 60091, 60093, 60095, 60106, 60107, 60120, 60133, 60143, 60149, 60157, 60169, 60172, 60173, 60192, 60193, 60194, 60195, 60196, 60201, 60202, 60203, 60204, 60666, 60712, 60714])},
    {'name': 'Suburban Access, Inc', 'zipcodes': d3.set([60104, 60130, 60131, 60141, 60153, 60154, 60155, 60160, 60162, 60163, 60164, 60165, 60171, 60176, 60301, 60302, 60303, 60304, 60305, 60402, 60513, 60521, 60525, 60526, 60527, 60534, 60546, 60558, 60706, 60707, 60804])},
    {'name': 'Easter Seals Society of Metropolitan Chicago.', 'zipcodes': d3.set([60620, 60628, 60629, 60633, 60638, 60643, 60652, 60655, 60805, 60827])},
    {'name': 'Easter Seals Society of Metropolitan Chicago', 'zipcodes': d3.set([60406, 60409, 60411, 60415, 60417, 60419, 60422, 60423, 60425, 60426, 60428, 60429, 60430, 60439, 60438, 60443, 60445, 60448, 60449, 60452, 60453, 60455, 60456, 60457, 60458, 60459, 60461, 60462, 60463, 60464, 60465, 60466, 60467, 60469, 60471, 60472, 60473, 60475, 60476, 60477, 60478, 60480, 60482, 60487, 60491, 60501, 60803])},
    {'name': 'La Rabida Children’s Hospital', 'zipcodes': d3.set([60609, 60615, 60617, 60619, 60621, 60636, 60637, 60649, 60653])},
    {'name': '945 W. George St., Suite 300', 'zipcodes': d3.set([60610, 60611, 60613, 60614, 60618, 60622, 60625, 60626, 60630, 60631, 60634, 60639, 66040, 60641, 60642, 60645, 60646, 60647, 60651, 60654, 60656, 60657, 60659, 60660])},
    {'name': 'PACT, Inc.', 'zipcodes': d3.set([60103, 60126, 60101, 60105, 60106, 60108, 60116, 60117, 60126, 60128, 60132, 60137, 60138, 60139, 60143, 60148, 60157, 60172, 60181, 60184, 60185, 60186, 60187, 60188, 60189, 60190, 60191, 60197, 60199, 60439, 60504, 60514, 60515, 60516, 60517, 60519, 60521, 60522, 60523, 60527, 60532, 60540, 60555, 60559, 60561, 60563, 60565, 60566, 60567, 60572, 60598, 60599])},
]

var path = d3.geo.path()
    .projection(projection);

d3.json("il-counties.json", function(error, il) {
    if (error) throw error;

    illinois_map.append("path")
      .datum(topojson.feature(il, il.objects.counties))
      .attr("class", "state")
      .attr("d", path);

    for (var i_=0; i_ < sites_cfc.length; i_++) {
        illinois_map.append("path") 
            .datum(topojson.merge(il, il.objects.counties.geometries.filter(function(d) {
                return sites_cfc[i_]['counties'].has(d.id);
            })))
            .attr("class", "state selected")
            .style("fill", function(d){return rand_color();})
            .attr("d", path);
    }
    
    d3.json("il-zipcodes.json", function(error, il_zipcodes) {
        for (var i_=0; i_ < sites_cfc_zipcodes.length; i_++) {
            illinois_map.append("path")
                .datum(topojson.merge(il_zipcodes, il_zipcodes.objects.zipcodes.geometries.filter(function(d) {
                    return sites_cfc_zipcodes[i_]['zipcodes'].has(d.id);
                })))
                .attr("class", "state selected")
                .style("fill", function(d){return rand_color();})
                .attr("d", path);
        }

        d3.csv("Entity_CFCs.csv", function(CFCs) {
            var points = []
            for (var i=0; i < CFCs.length - 1; i++) {
                points.push({
                    name: CFCs[i].Name, latitude: CFCs[i].Lat,
                    longitude: CFCs[i].Lng, reviewer: CFCs[i].Reviewer,
                    city: CFCs[i].City, address: CFCs[i].Address1,
                });
            }
            illinois_map.selectAll(".pin")
                .data(points)
                .enter().append("circle", ".pin")
                .attr("r", 2)
                .attr("class","site")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .attr("transform", function(d) {
                   return "translate(" + projection([d.longitude, d.latitude]) + ")";
                });

            function mouseover(d) {
                tooltip.style("visibility", "visible");
                var text = "<strong><table class='table'><tr><td>Name:</td><td>" +
                    d.name + "</td></tr><tr><td>City:</td><td>" + d.city +
                    "</td></tr><tr><td>Reviewer:</td><td>" + d.reviewer + "</td></tr></table></strong>";
                tooltip.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                tooltip.html(text)  
                    .style("left", (d3.event.pageX) + 30 + "px")
                    .style("z-index", 100000)   
                    .style("top", (d3.event.pageY) + "px"); 
            }
            function mouseout (d) {
                tooltip.transition()        
                  .duration(500)      
                  .style("opacity", 0)
                  .style("z-index", -1);
            }
        });
    });
});

function rand_color() {
    return color[Math.floor(Math.random() * 23)];
}