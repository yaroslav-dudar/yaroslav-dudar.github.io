document.addEventListener("DOMContentLoaded", function(event) {
    var settings = [{
        width_count: 3, height_count: 3,
        destination_w: 0, destination_h: 1,
        count_successively: 3,
        blocks: [
            {w: 0, h: 0, color: "#FFFF00", is_main: false},
            {w: 1, h: 1, color: "#FFFF00", is_main: false},
            {w: 2, h: 0, color: "#FFFF00", is_main: true, star_color: '#FFCC33'},
            {w: 2, h: 2, color: "#fff", is_main: false}
        ]

    }, {
        width_count: 4, height_count: 4,
        destination_w: 0, destination_h: 3,
        count_successively: 3,
        blocks: [
            {w: 2, h: 0, color: "#006600", is_main: true, star_color: '#333300'},
            {w: 2, h: 1, color: "#006600", is_main: false},
            {w: 2, h: 3, color: "#006600", is_main: false},
            {w: 3, h: 0, color: "#fff", is_main: false},
            {w: 0, h: 1, color: "#fff", is_main: false},
            {w: 1, h: 1, color: "#fff", is_main: false}
        ]
    }, {
        width_count: 5, height_count: 5,
        destination_w: 3, destination_h: 4,
        count_successively: 3,
        blocks: [
            {w: 2, h: 0, color: "#fff", is_main: true, star_color: '#C8C8C8'},
            {w: 2, h: 1, color: "#fff", is_main: false},
            {w: 2, h: 3, color: "#fff", is_main: false},
            {w: 0, h: 4, color: "#fff", is_main: false},
            {w: 1, h: 1, color: "#fff", is_main: false},
            {w: 2, h: 4, color: "#fff", is_main: false},
            {w: 3, h: 3, color: "#fff", is_main: false},
            {w: 3, h: 2, color: "#fff", is_main: false}
        ]
    }];
    var field_width = document.getElementById('screen').offsetWidth;
    var field_height = document.getElementById('screen').offsetHeight;

    // canvas tag id: screen
    MainScene.prototype = new createjs.Stage("screen");

    var main_scene = new MainScene(settings, field_height, field_width);
    var background = new createjs.Shape();

    background.graphics.beginFill("#ddd").drawRoundRectComplex(0,
        0, field_width, field_height, 10, 10, 10, 10);
    main_scene.addChild(background);

    var client = new CreateJSClient(main_scene); 
    client.render_game_field(Cellule, '#606060', '#aaa');
    client.render_lvl_blocks(Block);

    createjs.Ticker.addEventListener('tick', main_scene);
    createjs.Ticker.setFPS(60);

    main_scene.update();
});