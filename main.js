function init() {
    // offset work differently in chrome and firefox!!
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
                            if (candidates) {
                                var is_game_lose = candidates.filter(function(block) {return block.is_main;}).length > 0;
                                // reduction animation
                                for (var i = 0; i < candidates.length; i++) {
                                    // calculate center of the cellule
                                    var cellule_center = calculate_center_of_cellule(candidates[i]);
                                    createjs.Tween.get(candidates[i], {loop: false}).to(
                                        {scaleX: 0, scaleY: 0, x: cellule_center.w, y: cellule_center.h}, 400).call(function() {
                                            main_screen.removeChild(candidates[i]);
                                        });
                                }
                                //main_screen.removeChild.apply(main_screen, candidates);
                                if (is_game_lose) {
                                    show_menu_screen('lose');
                                }
                                break;
                            }
                        }

                        // check destination cellule
                        if (block_copy.is_main && destination_cellule.w == block_copy.w_pos
                            && destination_cellule.h == block_copy.h_pos && !is_game_lose) {
                            show_menu_screen('win');
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
    // check blocks before rendering level
    remove_blocks_in_column_or_row(3);

    main_screen.update();

    function search_remove_blocks(pos, block, count_successively) {
        // pos must be: w_pos or h_pos
        var reverse_pos = pos == 'h_pos' ? 'w_pos': 'h_pos';

        var candidates = main_screen.children.filter(function(elem){
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

        if (candidates.length == count_successively) {
            return candidates;
        }
        // else return undefined
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

    function show_menu_screen(screen_type) {
        // screen_type: lose, win
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
        var screen_elem = document.getElementById('screen');
        screen_elem.parentNode.insertBefore(btn, screen_elem.nextSibling);
        // render message on the scrren
        var text = screen_type == 'lose' ? 'Game over :(' : 'Level complete!';
        var message = new createjs.Text(text,
            "bold 20px Brush Script MT, cursive, Arial", "#303030");
        message.x = document.getElementById('screen').offsetWidth / 2 - 60;
        message.y = document.getElementById('screen').offsetHeight / 2 - 10;
        main_screen.addChild(message);
        // TODO: next level if win

        btn.addEventListener('click', function() {
            remove_all_blocks();
            main_screen.removeChild(block_screen, message);
            render_blocks_for_current_level();
            document.getElementById('container').removeChild(this);
        });
    }

    function calculate_center_of_cellule(block) {
        var w_pos = separator_w + separator_w *
            block.w_pos + cellule_width * block.w_pos + cellule_width / 2;
        var h_pos = separator_h + separator_h *
            block.h_pos + cellule_height * block.h_pos + cellule_height / 2;
        return {w: w_pos, h: h_pos};
    }

    function remove_blocks_in_column_or_row(count_successively) {
        // run before start each level
        function search_del_candidates(candidates) {
            var del_candidates = [];
            for (pos = candidates.length - 1; pos >= 0; pos--) {
                if (del_candidates.length == 0) {
                    del_candidates.push(candidates[pos]);
                } else if (del_candidates.length != 0
                    && del_candidates[0].shadow.color == candidates[pos].shadow.color) {

                    del_candidates.push(candidates[pos]);
                } else {
                    del_candidates = [candidates[pos]];
                }
                if (del_candidates.length == count_successively) {
                    main_screen.removeChild.apply(main_screen, del_candidates);
                    candidates.splice(del_candidates[0], del_candidates.length);
                    del_candidates = [];
                }
            }
        };

        for (var i = 0; i < height_count; i++) {
            var candidates = main_screen.children.filter(function(elem){
                return 'is_main' in elem && elem.w_pos == i;
            }).sort(function(a, b) {return a.h_pos - b.h_pos});
            search_del_candidates(candidates);
        }

        for (var i = 0; i < width_count; i++) {
            var candidates = main_screen.children.filter(function(elem){
                return 'is_main' in elem && elem.h_pos == i;
            }).sort(function(a, b) {return a.w_pos - b.w_pos});
            search_del_candidates(candidates);
        }
    }
}

function is_block_can_moved(shift_w, shift_h) {
    if (!(shift_h == 0 || shift_w == 0)) return false;
    if (!(shift_h >= -1 && shift_h <= 1)) return false;
    if (!(shift_w >= -1 && shift_w <= 1)) return false;

    return true;
}