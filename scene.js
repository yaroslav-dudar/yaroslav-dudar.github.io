function MainScene(level_settings, field_width, field_height) {
    
    this.settings = level_settings;
    // at the start of the game neither block is selected
    this.selected_block = null;
    /* disable selecting any block during animation
       by default neither block selected */
    this.disable_select = false;

    // field size
    this.field_width = field_width;
    this.field_height = field_height;
    // distance between cells
    this.separator_h = field_height * 0.03; // 3%
    this.separator_w = field_width * 0.03; // 3%

    this.cellule_width = (field_width - this.separator_w * (
        this.settings.width_count + 1)) / this.settings.width_count;

    this.cellule_height = (field_height - this.separator_h * (
        this.settings.height_count + 1)) / this.settings.height_count;

    this.search_remove_candidates = function(axis, block) {
        // axis must be: w or h
        var reverse_axis = axis == 'h' ? 'w': 'h';
        var remove_list = [];
        var self = this;

        this.children.filter(function(elem){
            // note:every block has is_main property
            return 'is_main' in elem && elem[axis] == block[axis] && elem.color == block.color;
        }).sort(function(a, b) {return a[reverse_axis] - b[reverse_axis]}).reduce(function(prev, current) {
            if (prev.length == 0) {
                prev.push(current);
            } else {
                if (prev[prev.length - 1][reverse_axis] + 1 == current[reverse_axis]) {
                    prev.push(current);
                } else {
                    prev = [current];
                }
            }
            if (prev.length == self.settings.count_successively) {
                remove_list.push(prev);
                prev = [];
            }
            return prev;
        }, []);

        return remove_list;
    }

    this.calculate_center_of_cellule = function(block) {
        var w_pos = this.separator_w + this.separator_w *
            block.w + this.cellule_width * block.w + this.cellule_width / 2;
        var h_pos = this.separator_h + this.separator_h *
            block.h + this.cellule_height * block.h + this.cellule_height / 2;
        return {w: w_pos, h: h_pos};
    }
};


function Cellule(w, h, color) {
    this.w = w; this.h = h;
    this.color = color;
}


function Block(w, h, color, is_main) {
    this.w = w; this.h = h;
    this.color = color; this.is_main = is_main;

    this.calculate_block_center = function(sep_w, sep_h, block_h, block_w) {
        var w_pos = sep_w + sep_w * this.w + block_w * this.w + block_w / 2;
        var h_pos = sep_h + sep_h * this.h + block_h * this.h + block_h / 2;
        return {w: w_pos, h: h_pos};
    }
}


function CreateJSClient(scene) {
    this.scene = scene;

    this.render_lvl_blocks = function(Block) {
        for (var index = 0; index < this.scene.settings.blocks.length; index++) {
            var block_data = this.scene.settings.blocks[index];

            var w_pos = this.scene.separator_w + this.scene.separator_w *
                block_data.w + this.scene.cellule_width * block_data.w;
            var h_pos = this.scene.separator_h + this.scene.separator_h *
                block_data.h + this.scene.cellule_height * block_data.h;

            var block = new Block(block_data.w,
                block_data.h, block_data.color, block_data.is_main);

            block.__proto__ = new createjs.Shape();
            // add event listener for block
            this.handle_click_on_block(block);
            block.graphics.beginFill(block.color).drawRoundRectComplex(w_pos,
                h_pos, this.scene.cellule_width, this.scene.cellule_height, 10, 10, 10, 10);
            block.shadow = new createjs.Shadow(block_data.color, 0, 0, this.scene.cellule_width / 10);
            this.scene.addChild(block);
        }
    };

    this.handle_click_on_block = function(block) {
        var self = this;
        block.on('click', function(event) {
            if (self.scene.selected_block) {
                if (!(self.scene.selected_block === this)) {
                    // select another block, and deselect current
                    self.scene.selected_block.dispatchEvent('click');
                }
            }

            self.scene.selected_block = !this.graphics._stroke ? this: null;
            // if block not selected
            if (!this.graphics._stroke) {
                if (self.scene.disable_select) return;
                this.graphics.clear().setStrokeStyle(5).beginStroke("#000");
            } else {
                this.graphics.clear();
            }
            // calculate block position in pixels
            var w_pos = self.scene.separator_w + self.scene.separator_w *
                this.w + self.scene.cellule_width * this.w;
            var h_pos = self.scene.separator_h + self.scene.separator_h *
                this.h + self.scene.cellule_height * this.h;
            // shadow color the same as shape color
            this.graphics.beginFill(this.color).drawRoundRectComplex(w_pos, h_pos,
                self.scene.cellule_width, self.scene.cellule_height, 10, 10, 10, 10);
            this.x = 0; this.y = 0;
            self.scene.update();
        });
    };

    this.render_game_field = function(Cellule, standart_collor, destination_collor) {
        // render game field
        for (var h = 0; h < this.scene.settings.height_count; h++) {
            for (var w = 0; w < this.scene.settings.width_count; w++) {
                var cellule_color = (this.scene.settings.destination_h == h) && (
                    this.scene.settings.destination_w == w) ? standart_collor: destination_collor;

                var cellule = new Cellule(w, h, cellule_color);
                cellule.__proto__ = new createjs.Shape();
                this.handle_click_on_cellule(cellule);
                // calculate cellule position on the scene
                var w_pos = this.scene.separator_w + this.scene.separator_w *
                    w + this.scene.cellule_width * w;
                var h_pos = this.scene.separator_h + this.scene.separator_h *
                    h + this.scene.cellule_height * h;

                cellule.graphics.beginFill(cellule.color).drawRoundRectComplex(w_pos,
                    h_pos, this.scene.cellule_width, this.scene.cellule_height, 10, 10, 10, 10);
                this.scene.addChild(cellule);
            }
        }
    };

    this.show_menu_screen = function(screen_type) {
        // screen_type: lose, win
        // blocking main screen
        var block_screen = new createjs.Shape();
        block_screen.graphics.beginFill("#fff").drawRoundRectComplex(0,
            0, this.scene.field_width, this.scene.field_height, 10, 10, 10, 10);
        block_screen.on('click', function(event) {});
        block_screen.alpha = 0;
        this.scene.addChild(block_screen);

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

        var self = this;
        this.scene.addChild(message);
        // TODO: next level if win
        btn.addEventListener('click', function() {
            //remove_all_blocks();
            self.scene.removeChild(block_screen, message);
            //render_blocks_for_current_level();
            document.getElementById('container').removeChild(this);
        });
    };

    this.handle_click_on_cellule = function(cellule) {
        var self = this;
        cellule.on('click', function(event) {
            if (self.scene.selected_block) {
                var shift_w = cellule.w - self.scene.selected_block.w;
                var shift_h = cellule.h - self.scene.selected_block.h;
                // check if block can be moved
                if (!is_block_can_moved(shift_w, shift_h)) {
                    // shake effect
                    createjs.Tween.get(self.scene.selected_block, {loop: false})
                        .to({x: -5, y: 0}, 100)
                        .to({x: 5, y: 0}, 100)
                        .to({x: -5, y: 0}, 100)
                        .to({x: 0, y: 0}, 100);
                    return;
                }

                var w = shift_w * self.scene.separator_w + shift_w * self.scene.cellule_width;
                var h = shift_h * self.scene.separator_h + shift_h * self.scene.cellule_height;
                // disable block selection during animation
                self.scene.disable_select = true;
                // start move animation and handle when it ended
                createjs.Tween.get(self.scene.selected_block).to({x: w, y: h}, 300).call(function() {

                    var axis = ['h', 'w'];
                    for (var i = 0; i < axis.length; i++) {
                        
                        var del_list = self.scene.search_remove_candidates(axis[i], block_copy);
                        
                        if (del_list.length > 0) {
                            var is_game_lose = del_list.some(function(candidates) {
                                return candidates.some(function(elem) {
                                    return elem.is_main;
                                });
                            });
                            // reduction animation
                            for (var l_i = del_list.length - 1; l_i >= 0 ; l_i--) {
                                // calculate center of the cellule
                                for(var e_i = 0; e_i < del_list[l_i].length; e_i++) {
                                    var cellule_center = self.scene.calculate_center_of_cellule(del_list[l_i][e_i]);
                                    createjs.Tween.get(del_list[l_i][e_i]).to(
                                    {scaleX: 0, scaleY: 0, x: cellule_center.w, y: cellule_center.h},
                                    400).call(function() {
                                        self.scene.removeChild.apply(self.scene, del_list[l_i]);
                                    });
                                }
                            }

                            if (is_game_lose) {
                                self.show_menu_screen('lose');
                            }
                        }
                    }

                    // check destination cellule
                    if (block_copy.is_main && self.scene.settings.destination_w == block_copy.w
                        && self.scene.settings.destination_h == block_copy.h && !is_game_lose) {
                        self.show_menu_screen('win');
                    }
                    self.scene.disable_select = false;
                });
                var block_copy = self.scene.selected_block;
                // unselected block
                self.scene.selected_block.dispatchEvent('click');

                // upd block position
                block_copy.w = cellule.w;
                block_copy.h = cellule.h;
            }
        });
    };
}

function is_block_can_moved(shift_w, shift_h) {
    if (!(shift_h == 0 || shift_w == 0)) return false;
    if (!(shift_h >= -1 && shift_h <= 1)) return false;
    if (!(shift_w >= -1 && shift_w <= 1)) return false;

    return true;
}