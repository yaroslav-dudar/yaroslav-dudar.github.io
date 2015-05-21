document.addEventListener("DOMContentLoaded", function(event) {
    var settings = [{
        width_count: 3, height_count: 3,
        destination_w: 0, destination_h: 2,
        count_successively: 3,
        blocks: [
            {w: 2, h: 0, color: "#FF6600", is_main: false},
            {w: 1, h: 1, color: "#FF6600", is_main: false},
            {w: 1, h: 2, color: "#FF6600", is_main: false},
            {w: 2, h: 2, color: "#FF6600", is_main: true, star_color: '#CC6600'},
            {w: 0, h: 0, color: "#990033", is_main: false},
            {w: 1, h: 0, color: "#990033", is_main: false},
            {w: 0, h: 1, color: "#990033", is_main: false},
            {w: 2, h: 1, color: "#990033", is_main: false}
        ]

    }, {
        width_count: 4, height_count: 4,
        destination_w: 3, destination_h: 2,
        count_successively: 3,
        blocks: [
            {w: 0, h: 0, color: "#006600", is_main: true, star_color: '#333300'},
            {w: 2, h: 0, color: "#006600", is_main: false},{w: 3, h: 3, color: "#006600", is_main: false},
            {w: 1, h: 1, color: "#006600", is_main: false},{w: 3, h: 1, color: "#006600", is_main: false},
            {w: 0, h: 2, color: "#006600", is_main: false},{w: 1, h: 3, color: "#006600", is_main: false},
            {w: 2, h: 2, color: "#006600", is_main: false},{w: 2, h: 1, color: "#CCFF33", is_main: false},
            {w: 1, h: 0, color: "#CCFF33", is_main: false},{w: 0, h: 1, color: "#CCFF33", is_main: false},
            {w: 3, h: 0, color: "#CCFF33", is_main: false},{w: 1, h: 2, color: "#CCFF33", is_main: false},
            {w: 0, h: 3, color: "#CCFF33", is_main: false},{w: 2, h: 3, color: "#CCFF33", is_main: false},
        ]
    }, {
        width_count: 5, height_count: 5,
        destination_w: 4, destination_h: 0,
        count_successively: 3,
        blocks: [
            {w: 0, h: 3, color: "#006666", is_main: true, star_color: '#009966'},
            {w: 0, h: 4, color: "#006666", is_main: false},{w: 1, h: 3, color: "#006666", is_main: false},
            {w: 1, h: 4, color: "#006666", is_main: false},{w: 2, h: 1, color: "#006666", is_main: false},
            {w: 2, h: 0, color: "#006666", is_main: false},
            {w: 1, h: 2, color: "#FF0000", is_main: false},{w: 2, h: 3, color: "#FF0000", is_main: false},
            {w: 4, h: 4, color: "#FF0000", is_main: false},
            {w: 0, h: 2, color: "#FF9900", is_main: false},{w: 2, h: 4, color: "#FF9900", is_main: false},
            {w: 4, h: 1, color: "#FF9900", is_main: false},
            {w: 1, h: 1, color: "#FFFF00", is_main: false},{w: 3, h: 1, color: "#FFFF00", is_main: false},
            {w: 4, h: 3, color: "#FFFF00", is_main: false},
            {w: 3, h: 3, color: "#66FFFF", is_main: false},{w: 2, h: 2, color: "#66FFFF", is_main: false},
            {w: 0, h: 0, color: "#66FFFF", is_main: false},
            {w: 1, h: 0, color: "#990099", is_main: false},{w: 3, h: 2, color: "#990099", is_main: false},
            {w: 4, h: 2, color: "#990099", is_main: false},
            {w: 0, h: 1, color: "#330000", is_main: false},{w: 3, h: 0, color: "#330000", is_main: false},
            {w: 3, h: 4, color: "#330000", is_main: false},
        ]
    }];
    var canvas_elem = document.getElementById('screen');
    canvas_elem.width = 500;
    canvas_elem.height = 500;
    // canvas tag id: screen
    var main_scene = new Scene(settings, canvas_elem.height, canvas_elem.width, CreateJsClient, UI);
    main_scene.render_lvl();
});