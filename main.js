function init() {

    var field_width = document.getElementById('screen').offsetWidth;
    var field_height = document.getElementById('screen').offsetHeight;

    var height_count = 3;
    var width_count = 3;

    // get canvas context
    var main_screen = new createjs.Stage("screen");

    var background = new createjs.Shape();
    background.graphics.beginFill("#ddd").drawRoundRectComplex(0,
        0, field_width, field_height, 10, 10, 10, 10);

    main_screen.addChild(background);

    // calculate params
    var separator_h = field_height * 0.03; // 3%
    var separator_w = field_width * 0.03; // 3%

    var cellule_width = (field_width - separator_w * (width_count + 1)) / width_count;
    var cellule_height = (field_height - separator_h * (height_count + 1)) / height_count;

    // generate cellules
    for (var i = 0; i < height_count; i++) {
        for (var j = 0; j < width_count; j++) {

            var w_pos = separator_w + separator_w * j + cellule_width * j;
            var h_pos = separator_h + separator_h * i + cellule_height * i;

            var cellule = new createjs.Shape();
            cellule.graphics.beginFill("#aaa").drawRoundRectComplex(w_pos,
                h_pos, cellule_width, cellule_height, 10, 10, 10, 10);

            main_screen.addChild(cellule);
        }
    }

    // render main block(position w: 2, h: 2)
    var main_block = new createjs.Shape();
    var w_pos_block = separator_w + separator_w * 2 + cellule_width * 2;
    var h_pos_block = separator_h + separator_h * 2 + cellule_height * 2;

    main_block.graphics.beginFill("#fff").drawRoundRectComplex(w_pos_block,
        h_pos_block, cellule_width, cellule_height, 10, 10, 10, 10);
    // check if exists default method to get x,y position!!
    main_block.w_pos = w_pos_block;
    main_block.h_pos = h_pos_block;

    main_screen.addChild(main_block);

    main_block.on('click', function(event) {
        // if block not selected
        if (!this.graphics._stroke) {
            this.graphics.clear().setStrokeStyle(5).beginStroke("#000");
        } else {
            this.graphics.clear();
        }

        this.graphics.beginFill("#fff").drawRoundRectComplex(this.w_pos,
            this.h_pos, cellule_width, cellule_height, 10, 10, 10, 10);
        main_screen.update();
    });

    main_screen.update();
}
