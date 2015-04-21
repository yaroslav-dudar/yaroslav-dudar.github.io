function init() {

    var field_width = document.getElementById('screen').offsetWidth;
    var field_height = document.getElementById('screen').offsetHeight;

    var height_count = 3;
    var width_count = 3;
    // blocks on level. main block should be only one
    var blocks = [{w: 2, h: 2, color: "#fff", is_main: false},
        {w: 0, h: 0, color: "#FFFF00", is_main: false},
        {w: 1, h: 1, color: "#FFFF00", is_main: false},
        {w: 2, h: 0, color: "#FFFF00", is_main: true}];
    // variable with coordinates for destination(finish) cellue
    var destination_cellule = {w: 0, h: 1};
    // at the start of the game neither block is selected
    var selected_block = null;
    /* disable selecting any block during animation
       by default neither block selected */
    var disable_select = false;
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

    // render game field
    for (var i = 0; i < height_count; i++) {
        for (var j = 0; j < width_count; j++) {

            var w_pos = separator_w + separator_w * j + cellule_width * j;
            var h_pos = separator_h + separator_h * i + cellule_height * i;

            var cellule = new createjs.Shape();
            // get cellue color
            var cellule_color = destination_cellule.h == i && destination_cellule.w == j ? '#606060': "#aaa"; 
            cellule.graphics.beginFill(cellule_color).drawRoundRectComplex(w_pos,
                h_pos, cellule_width, cellule_height, 10, 10, 10, 10);

            main_screen.addChild(cellule);
            // save position data
            cellule.w_pos = j;
            cellule.h_pos = i;

            cellule.on('click', function(event) {
                if (selected_block) {
                    var shift_w = this.w_pos - selected_block.w_pos;
                    var shift_h = this.h_pos - selected_block.h_pos;

                    // check if block can be moved
                    if (!is_block_can_moved(shift_w, shift_h)) {
                        // shake effect
                        createjs.Tween.get(selected_block, {loop: false})
                            .to({x: -5, y: 0}, 100)
                            .to({x: 5, y: 0}, 100)
                            .to({x: -5, y: 0}, 100)
                            .to({x: 0, y: 0}, 100);
                        return;
                    }

                    var w = shift_w * separator_w + shift_w * cellule_width;
                    var h = shift_h * separator_h + shift_h * cellule_height;
                    // disable block selection during animation
                    disable_select = true;
                    // start move animation and handle when it ended
                    createjs.Tween.get(selected_block, {loop: false}).to({x: w, y: h}, 300).call(function() {
                        // represent how match blocks with same color must be consecutive to disappear
                        var count_successively = 3;

                        var positions = ['h_pos', 'w_pos'];
                        for (var i = 0; i < positions.length; i++) {
                            var candidates = search_remove_blocks(positions[i], block_copy, count_successively);
                            if (candidates.length == count_successively) {
                                var is_game_lose = candidates.filter(function(block) {return block.is_main;}).length > 0;
                                // TODO: remove animation
                                main_screen.removeChild.apply(main_screen, candidates);
                                if (is_game_lose) {
                                    console.log('You lose. Main block destroied');
                                    show_restart_screen();
                                }
                                break;
                            }
                        }

                        // check destination cellule
                        if (block_copy.is_main && destination_cellule.w == block_copy.w_pos
                            && destination_cellule.h == block_copy.h_pos && !is_game_lose) {
                            // TODO: level complete
                            console.log('You win!');
                        }
                        disable_select = false;
                    });
                    var block_copy = selected_block;
                    // unselected block
                    selected_block.dispatchEvent('click');

                    // upd block position
                    block_copy.w_pos = this.w_pos;
                    block_copy.h_pos = this.h_pos;
                }
            });
        }
    }

    render_blocks_for_current_level();
    // settings for animation
    createjs.Ticker.addEventListener('tick', main_screen);
    createjs.Ticker.setFPS(60);
    main_screen.update();

    function search_remove_blocks(pos, block, count_successively) {
        // pos must be: w_pos or h_pos
        var reverse_pos = pos == 'h_pos' ? 'w_pos': 'h_pos';

        return main_screen.children.filter(function(elem){
            // note:every block has is_main property
            return 'is_main' in elem && elem[pos] == block[pos] && elem.shadow.color == block.shadow.color;
        }).sort(function(a, b) {return a[reverse_pos] - b[reverse_pos]}).reduce(function(prev, current) {
            if (prev.length == count_successively) return prev;
            if (prev.length == 0) {
                prev.push(current); return prev;
            } else {
                if (prev[prev.length - 1][reverse_pos] + 1 == current[reverse_pos]) {
                    prev.push(current); return prev;
                } else {
                    return [];
                }
            }
        }, []);
    }

    function remove_all_blocks() {
        var all_blocks = main_screen.children.filter(function(elem){
            // note:every block has is_main property
            return 'is_main' in elem
        });
        main_screen.removeChild.apply(main_screen, all_blocks);
    }

    function render_blocks_for_current_level() {
        // render all blocks and add event hendlers
        for (var i = 0; i < blocks.length; i++) {

            var block = new createjs.Shape();

            var w_pos_block = separator_w + separator_w * blocks[i].w + cellule_width * blocks[i].w;
            var h_pos_block = separator_h + separator_h * blocks[i].h + cellule_height * blocks[i].h;

            block.graphics.beginFill(blocks[i].color).drawRoundRectComplex(w_pos_block,
                h_pos_block, cellule_width, cellule_height, 10, 10, 10, 10);
            // glow effect
            block.shadow = new createjs.Shadow(blocks[i].color, 0, 0, cellule_width / 10);

            block.w_pos = blocks[i].w;
            block.h_pos = blocks[i].h;
            block.is_main = blocks[i].is_main;
            main_screen.addChild(block);

            block.on('click', function(event) {
                if (selected_block) {
                    if (!(selected_block === this)) {
                        // select another block, and deselect current
                        selected_block.dispatchEvent('click');
                    }
                }

                selected_block = !this.graphics._stroke ? this: null;
                // if block not selected
                if (!this.graphics._stroke) {
                    if (disable_select) return;
                    this.graphics.clear().setStrokeStyle(5).beginStroke("#000");
                } else {
                    this.graphics.clear();
                }
                // calculate block position in pixels
                var w_pos_block = separator_w + separator_w * this.w_pos + cellule_width * this.w_pos;
                var h_pos_block = separator_h + separator_h * this.h_pos + cellule_height * this.h_pos;
                // shadow color the same as shape color
                this.graphics.beginFill(this.shadow.color).drawRoundRectComplex(w_pos_block,
                    h_pos_block, cellule_width, cellule_height, 10, 10, 10, 10);
                this.x = 0; this.y = 0;
                main_screen.update();
            });
        }
    }

    function show_restart_screen() {
        // blocking main screen
        var block_screen = new createjs.Shape();
        block_screen.graphics.beginFill("#fff").drawRoundRectComplex(0,
            0, field_width, field_height, 10, 10, 10, 10);
        block_screen.on('click', function(event) {});
        block_screen.alpha = 0;
        main_screen.addChild(block_screen);

        createjs.Tween.get(block_screen).to({alpha: 0.7}, 500);

        // create button dynamicly
        var btn = document.createElement('button');
        btn.setAttribute('id', 'btn');
        btn.innerHTML = 'Restart';
        document.getElementById('container').appendChild(btn);

        btn.addEventListener('click', function() {
            remove_all_blocks();
            main_screen.removeChild(block_screen);
            render_blocks_for_current_level();
            document.getElementById('container').removeChild(this);
        });
    }
}

function is_block_can_moved(shift_w, shift_h) {
    if (!(shift_h == 0 || shift_w == 0)) return false;
    if (!(shift_h >= -1 && shift_h <= 1)) return false;
    if (!(shift_w >= -1 && shift_w <= 1)) return false;

    return true;
}