$(function(){ 
    L.mapbox.accessToken = 'pk.eyJ1IjoieWR1ZGFyIiwiYSI6IjBmYWRiMzk5ZTljODRlNTc4ZGU2ZjZkNWY5YzRjNWMzIn0.QqtTC5sdENWbluDyZoJx4w';
    var map = L.mapbox.map('mapbox', 'mapbox.streets')
        .setView([40, -89.50], 6);

    omnivore.csv('Entity_CFCs.csv').addTo(map);
});