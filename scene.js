function Scene(level_settings, field_width, field_height, Client, UI) {
    
    this.settings = level_settings;
    this.client = new Client(this);
    this.ui = new UI();

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
                    client.lock_scene('#fff');
                    client.draw_message('Game Over :(', '#303030')
                    client.scene.ui.create_btn('Restart');
                    client.scene.ui.handle_click_on_btn(client.scene.restart_callback.bind(client.scene));
                }
            }
        }

        if (sprite.is_main && client.scene.get_lvl_settings().destination_w == sprite.w
            && client.scene.get_lvl_settings().destination_h == sprite.h && !is_game_lose) {

            client.lock_scene('#fff');
            client.draw_message('Level complete!', '#303030')
            client.scene.ui.create_btn('Next Level');
            client.scene.ui.handle_click_on_btn(client.scene.next_level_callback.bind(client.scene));
        }
        client.scene.disable_select = false;
    };

    this.restart_callback = function() {
        this.client.remove_all_scene_elements();
        this.render_lvl();
        this.ui.remove_btn();
    };

    this.next_level_callback = function() {
        this.client.remove_all_scene_elements();
        if (this.current_lvl + 1 <= this.settings.length) {
            this.current_lvl += 1;
            this.update_scene_data();
        }
        this.render_lvl();
        this.ui.remove_btn();
    };
};


function Cellule(w, h, color) {
    this.w = w; this.h = h;
    this.color = color;
};


function Block(w, h, color, is_main, star_color) {
    this.w = w; this.h = h;
    this.color = color; this.is_main = is_main;
    this.star_color = star_color;

    // block not selected by default
    this.is_selected = false;

    this.calculate_block_center = function(sep_w, sep_h, block_h, block_w) {
        var w_pos = sep_w + sep_w * this.w + block_w * this.w + block_w / 2;
        var h_pos = sep_h + sep_h * this.h + block_h * this.h + block_h / 2;
        return {w: w_pos, h: h_pos};
    }
};

function is_block_can_moved(shift_w, shift_h) {
    if (!(shift_h == 0 || shift_w == 0)) return false;
    if (!(shift_h >= -1 && shift_h <= 1)) return false;
    if (!(shift_w >= -1 && shift_w <= 1)) return false;

    return true;
};

function UI() {

    this.btn = null;

    this.create_btn = function(text) {
        this.btn = document.createElement('button');
        this.btn.setAttribute('id', 'btn');
        this.btn.innerHTML = text;
        var screen_elem = document.getElementById('screen');
        screen_elem.parentNode.insertBefore(this.btn, screen_elem.nextSibling);
    }

    this.remove_btn = function() {
        document.getElementById('container').removeChild(this.btn);
        this.btn = null;
    }

    this.handle_click_on_btn = function(callback) {
        this.btn.addEventListener('click', callback);
    }
};