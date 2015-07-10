// load CFC entities
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
              .center([-116, 32])
              .rotate([0, 30])
              .scale(2000)
              .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
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