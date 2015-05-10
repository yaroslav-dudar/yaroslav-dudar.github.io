function Scene(level_settings, field_width, field_height, Client) {
    
    this.settings = level_settings;
    this.client = new Client(this);

    this.current_lvl = 1;
    // at the start of the game neither block is selected
    this.selected_block = null;
    /* disable selecting any tile during animation
       by default neither tile selected */
    this.disable_select = false;

    // field size
    this.field_width = field_width;
    this.field_height = field_height;

    // add ability to add, remove, search, render elements
    this.__proto__ = this.client.create_stage('screen');

    this.render_lvl = function() {
        this.client.draw_background('#ddd');
        this.render_game_field(Cellule, '#606060', '#aaa');
        this.render_tiles(Block);
        this.client.enable_scene_animation();
    }

    this.render_tiles = function(Block) {
        for (var index = 0; index < this.get_lvl_settings().blocks.length; index++) {
            var block_data = this.get_lvl_settings().blocks[index];

            var block = new Block(block_data.w,
                block_data.h, block_data.color, block_data.is_main, block_data.star_color);

            this.client.draw_tile(block, 0.5);

            this.client.handle_click_on_tile(block, this.click_on_tile_callback);
            this.client.add_light(block);
            this.addChild(block);
        }
        // find remove candidates before lvl started
        this.pre_start_check();
    };

    this.pre_start_check = function() {
        // axis:w
        this.check_axis(this.get_lvl_settings().width_count, 'w');
        // axis:h
        this.check_axis(this.get_lvl_settings().height_count, 'h');
    }

    this.check_axis = function(count, pos) {
        // check w or h axis before lvl started
        for(var p = 0; p < count; p++) {
            var del_list = this.search_remove_candidates(pos, p, this);
            if (del_list.length > 0) {
                var is_game_lose = del_list.some(function(candidates) {
                    return candidates.some(function(elem) {
                        return elem.is_main;
                    });
                });

                for (var l_i = del_list.length - 1; l_i >= 0 ; l_i--) {
                    for(var e_i = 0; e_i < del_list[l_i].length; e_i++) {
                        this.removeChild.apply(this.scene, del_list[l_i]);
                    }
                }

                if (is_game_lose) {
                    //this.show_menu_screen('lose');
                }
            }
        }
    };
    this.get_lvl_settings = function() {
        return this.settings[this.current_lvl - 1];
    }

    this.is_last_lvl = function() {
        return this.settings.length == this.current_lvl;
    }

    this.update_scene_data = function() {
        // distance between cells
        this.separator_h = field_height * 0.03; // 3%
        this.separator_w = field_width * 0.03; // 3%

        this.cellule_width = (field_width - this.separator_w * (
            this.get_lvl_settings().width_count + 1)) / this.get_lvl_settings().width_count;

        this.cellule_height = (field_height - this.separator_h * (
            this.get_lvl_settings().height_count + 1)) / this.get_lvl_settings().height_count;
    }

    this.update_scene_data(); // calculate separarator, cellule size

    this.search_remove_candidates = function(axis, index, client) {
        // axis must be: w or h
        var reverse_axis = axis == 'h' ? 'w': 'h';
        var remove_list = [];
        var self = this;

        this.client.get_tiles_from(axis, index)
            .sort(function(a, b) {return a[reverse_axis] - b[reverse_axis]})
            .reduce(function(prev, current) {
            if (prev.length == 0) {
                prev.push(current);
            } else {
                if (prev[prev.length - 1][reverse_axis] + 1 == current[reverse_axis] &&
                    prev[prev.length - 1].color == current.color) {

                    prev.push(current);
                } else {
                    prev = [current];
                }
            }
            if (prev.length == self.get_lvl_settings().count_successively) {
                remove_list.push(prev);
                prev = [];
            }
            return prev;
        }, []);

        return remove_list;
    }

    this.calculate_elem_center_pos = function(block) {
        var pos = this.calculate_elem_pos(block);
        return {w: pos.w + this.cellule_width / 2, h: pos.h + this.cellule_height / 2};
    };

    this.calculate_elem_pos = function(block) {
        var w_pos = this.separator_w + this.separator_w *
            block.w + this.cellule_width * block.w;

        var h_pos = this.separator_h + this.separator_h *
            block.h + this.cellule_height * block.h;
        return {w: w_pos, h:h_pos};
    };

    this.render_game_field = function(Cellule, standart_collor, destination_collor) {
        // render game field
        for (var h = 0; h < this.get_lvl_settings().height_count; h++) {
            for (var w = 0; w < this.get_lvl_settings().width_count; w++) {
                var cellule_color = (this.get_lvl_settings().destination_h == h) && (
                    this.get_lvl_settings().destination_w == w) ? standart_collor: destination_collor;

                var cellule = new Cellule(w, h, cellule_color);
                this.client.draw_cellule(cellule);
                this.client.handle_click_on_cellule(cellule, this.click_on_cellule_callback);
            }
        }
    };

    this.click_on_tile_callback = function(event, client) {
        if (client.scene.disable_select) return;
        if (client.scene.selected_block && client.scene.selected_block != this) {
            client.simulate_click(client.scene.selected_block);
        }

        if (this.is_selected) {
            client.scene.selected_block = null;
            this.is_selected = false;
        } else {
            client.scene.selected_block = this;
            this.is_selected = true;
        }
        var stroke_width = this.is_selected ? 5 : 0.5;
        client.draw_tile(this, stroke_width);
        this.x = 0; this.y = 0;
    };

    this.click_on_cellule_callback = function(event, client) {
        if (client.scene.selected_block) {
            var shift_w = this.w - client.scene.selected_block.w;
            var shift_h = this.h - client.scene.selected_block.h;
            // check if block can be moved
            if (!is_block_can_moved(shift_w, shift_h)) {
                client.shake_sprite(client.scene.selected_block);
                return;
            }
            var new_w_pos = shift_w * client.scene.separator_w + shift_w * client.scene.cellule_width;
            var new_h_pos = shift_h * client.scene.separator_h + shift_h * client.scene.cellule_height

            client.moveSpriteTo(client.scene.selected_block,
                new_w_pos, new_h_pos, 300, client.scene.move_after_callback);

            var selected_block_copy = client.scene.selected_block;

            // deselected block
            client.scene.selected_block.dispatchEvent('click');

            selected_block_copy.w = this.w;
            selected_block_copy.h = this.h;

            // disable block selection during animation
            client.scene.disable_select = true;
        }
    };

    this.move_after_callback = function(client, sprite) {
        var axis = ['h', 'w'];
        for (var i = 0; i < axis.length; i++) {
            var del_list = client.scene.search_remove_candidates(axis[i], sprite[axis[i]], client);
            if (del_list.length > 0) {
                var is_game_lose = del_list.some(function(candidates) {
                    return candidates.some(function(elem) {
                        return elem.is_main;
                    });
                });
                // fade out animation
                for (var l_i = del_list.length - 1; l_i >= 0 ; l_i--) {
                    var list = del_list[l_i];
                    for(var e_i = 0; e_i < list.length; e_i++) {
                        client.fade_out(list[e_i]);
                    }
                }

                if (is_game_lose) {
                    //self.show_menu_screen('lose');
                }
            }
        }

        if (sprite.is_main && client.scene.get_lvl_settings().destination_w == sprite.w
            && client.scene.get_lvl_settings().destination_h == sprite.h && !is_game_lose) {
            //self.show_menu_screen('win');
        }
        client.scene.disable_select = false;
    }
};


function Cellule(w, h, color) {
    this.w = w; this.h = h;
    this.color = color;
    // cellule not selected by default
    this.is_selected = false;
}


function Block(w, h, color, is_main, star_color) {
    this.w = w; this.h = h;
    this.color = color; this.is_main = is_main;
    this.star_color = star_color;

    this.calculate_block_center = function(sep_w, sep_h, block_h, block_w) {
        var w_pos = sep_w + sep_w * this.w + block_w * this.w + block_w / 2;
        var h_pos = sep_h + sep_h * this.h + block_h * this.h + block_h / 2;
        return {w: w_pos, h: h_pos};
    }
}

function CreateJsClient(scene) {

    this.scene = scene;

    this.create_stage = function(canvas_id) {
        return new createjs.Stage(canvas_id);
    }

    this.draw_background = function(bgr_color) {
        var background = new createjs.Shape();

        background.graphics.beginFill(bgr_color).drawRoundRectComplex(0,
            0, this.scene.field_width, this.scene.field_height, 10, 10, 10, 10);

        this.scene.addChild(background);
    }

    this.add_light = function(block) {
        block.shadow = new createjs.Shadow(block.color, 0, 0, this.scene.cellule_width / 10);
    };

    this._draw_simple_tile = function(tile, stroke_width) {
        tile.__proto__ = new createjs.Shape();
        var position = this.scene.calculate_elem_pos(tile);
        tile.graphics.setStrokeStyle(stroke_width).beginStroke("#000");
        tile.graphics.beginFill(tile.color).drawRoundRectComplex(position.w, position.h, this.scene.cellule_width,
            this.scene.cellule_height, 10, 10, 10, 10);
    };

    this._draw_main_tile = function(tile, stroke_width) {
        tile.__proto__ = new createjs.Container();
        var star = new createjs.Shape();
        var position = this.scene.calculate_elem_pos(tile);

        star.graphics.beginFill(tile.star_color).drawPolyStar(
            position.w + this.scene.cellule_width / 2,
            position.h + this.scene.cellule_height / 2,
            this.scene.cellule_height / 4, 5, 0.6, -90);

        var block = new createjs.Shape();
        block.graphics.setStrokeStyle(stroke_width).beginStroke("#000");
        block.graphics.beginFill(tile.color).drawRoundRectComplex(position.w,
            position.h, this.scene.cellule_width, this.scene.cellule_height, 10, 10, 10, 10);
        tile.addChild(block, star);
    };

    this.draw_tile = function(tile, stroke_width) {
        tile.is_main ? this._draw_main_tile(tile, stroke_width): this._draw_simple_tile(tile, stroke_width);
    };

    this.draw_cellule = function(cellule) {
        cellule.__proto__ = new createjs.Shape();
        var position = this.scene.calculate_elem_pos(cellule);

        cellule.graphics.beginFill(cellule.color).drawRoundRectComplex(position.w,
            position.h, this.scene.cellule_width, this.scene.cellule_height, 10, 10, 10, 10);

        this.scene.addChild(cellule);
    };

    this.simulate_click = function(element) {
        element.dispatchEvent('click');
    };

    this.clear_elem = function(elem) {
        elem.graphics.clear();
    };

    this.set_stroke = function(tile) {
        tile.graphics.setStrokeStyle(5).beginStroke("#000");
    };

    this.get_tiles_from = function(axis, index) {
        return this.scene.children.filter(function(elem){
            // note:every block has is_main property
            return 'is_main' in elem && elem[axis] == index;
        })
    };

    this.handle_click_on_tile = function(tile, callback) {
        tile.on('click', callback, null, false, this);
    };

    this.handle_click_on_cellule = function(cellule, callback) {
        cellule.on('click', callback, null, false, this);
    };

    this.shake_sprite = function(sprite) {
        createjs.Tween.get(sprite)
            .to({x: -5, y: 0}, 100)
            .to({x: 5, y: 0}, 100)
            .to({x: -5, y: 0}, 100)
            .to({x: 0, y: 0}, 100);
    };

    this.enable_scene_animation = function() {
        createjs.Ticker.addEventListener('tick', this.scene);
        createjs.Ticker.setFPS(60);
    }

    this.moveSpriteTo = function(sprite, w, h, time, callback) {
        // callback execute after animation
        createjs.Tween.get(sprite).to({x: w, y: h}, time).call(callback, [this, sprite]);
    }

    this.fade_out = function(elem) {
        /*
            Additionally function remove element from scene
            (violates Single Responsibility Principle) !!!
        */
        // calculate center of the elem
        var elem_center = this.scene.calculate_elem_center_pos(elem);
        createjs.Tween.get(elem).to(
        {scaleX: 0, scaleY: 0, x: elem_center.w, y: elem_center.h},
        400).call(function(client) {
            client.scene.removeChild(elem);
        }, [this]);
    }
}

function Client(scene) {
    this.scene = scene;

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

        // create button
        var btn = document.createElement('button');
        btn.setAttribute('id', 'btn');
        btn.innerHTML = screen_type == 'lose' || this.scene.is_last_lvl() ? 'Restart': 'Next Level';
        var screen_elem = document.getElementById('screen');
        screen_elem.parentNode.insertBefore(btn, screen_elem.nextSibling);
        // render message on the scrren
        var text = screen_type == 'lose' ? 'Game over :(' : 'Level complete!';
        var message = new createjs.Text(text,
            "bold 20px Ubuntu Mono, cursive, Arial", "#303030");
        message.x = document.getElementById('screen').offsetWidth / 2 - 60;
        message.y = document.getElementById('screen').offsetHeight / 2 - 10;

        var self = this;
        this.scene.addChild(message);

        btn.addEventListener('click', function() {
            self.remove_all_blocks();
            self.scene.removeChild(block_screen, message);
            if (screen_type == 'win' && !self.scene.is_last_lvl()) {
                // switch lvl
                self.scene.current_lvl += 1;
                self.scene.removeAllChildren();
                self.scene.update_scene_data();

                var background = new createjs.Shape();

                background.graphics.beginFill("#ddd").drawRoundRectComplex(0,
                    0, self.scene.field_width, self.scene.field_height, 10, 10, 10, 10);
                self.scene.addChild(background);
                self.render_game_field(Cellule, '#606060', '#aaa');
            }
            self.render_lvl_blocks(Block);
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
                        
                        var del_list = self.scene.search_remove_candidates(axis[i], block_copy[axis[i]], self);
                        
                        if (del_list.length > 0) {
                            var is_game_lose = del_list.some(function(candidates) {
                                return candidates.some(function(elem) {
                                    return elem.is_main;
                                });
                            });
                            // reduction animation
                            for (var l_i = del_list.length - 1; l_i >= 0 ; l_i--) {
                                // calculate center of the cellule
                                var list = del_list[l_i];
                                for(var e_i = 0; e_i < list.length; e_i++) {
                                    var cellule_center = self.scene.calculate_elem_center_pos(list[e_i]);
                                    createjs.Tween.get(list[e_i]).to(
                                    {scaleX: 0, scaleY: 0, x: cellule_center.w, y: cellule_center.h},
                                    400).call(function() {
                                        self.scene.removeChild.apply(self.scene, list);
                                    });
                                }
                            }

                            if (is_game_lose) {
                                self.show_menu_screen('lose');
                            }
                        }
                    }

                    // check destination cellule
                    if (block_copy.is_main && self.scene.get_lvl_settings().destination_w == block_copy.w
                        && self.scene.get_lvl_settings().destination_h == block_copy.h && !is_game_lose) {
                        self.show_menu_screen('win');
                    }
                    self.scene.disable_select = false;
                });
                var block_copy = self.scene.selected_block;

                self.scene.selected_block.dispatchEvent('click');

                // upd block position
                block_copy.w = cellule.w;
                block_copy.h = cellule.h;
            }
        });
    };

    this.remove_all_blocks = function() {
        var all_blocks = this.scene.children.filter(function(elem){
            // note:every block has is_main property
            return 'is_main' in elem
        });
        this.scene.removeChild.apply(this.scene, all_blocks);
    }

}

function is_block_can_moved(shift_w, shift_h) {
    if (!(shift_h == 0 || shift_w == 0)) return false;
    if (!(shift_h >= -1 && shift_h <= 1)) return false;
    if (!(shift_w >= -1 && shift_w <= 1)) return false;

    return true;
}