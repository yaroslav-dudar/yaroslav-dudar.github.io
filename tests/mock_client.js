// mock js client, used for testing

function MockClient(scene) {
    this.scene = scene;
    this.actions = [];

    this.create_stage = function(canvas_id) {
        return {
            children: [],

            addChild: function() {
                this.children = this.children.concat(
                    Array.prototype.slice.call(arguments));
            },

            removeChild: function(arguments) {
                var args = Array.prototype.slice.call(arguments);
                this.children = this.filter(function(item) {
                    return args.indexOf(item) == -1;
                });
            },

            removeAllChildren: function() {
                this.children = [];
            }
        }
    };

    this.draw_background = function(bgr_color) {
        this.scene.addChild({'bgr_color': bgr_color});
        this.actions.push('draw background');
    };

    this.add_light = function(block) {
        block.shadow = {'color': block.color}
    };

    this.remove_all_scene_elements = function() {
        this.scene.removeAllChildren();
    };

    this.draw_tile = function(tile, stroke_width) {
        tile.__proto__ = {stroke: stroke_width, x: 0, y: 0};
        this.scene.addChild(tile);
    };

    this.draw_cellule = function(cellule) {
        cellule.__proto__ = {x: 0, y: 0};
        this.scene.addChild(cellule);
    };

    this.set_stroke = function(tile) {
        tile.stroke = 5;
    };

    this.clear_elem = function(elem) {
        this.actions.push({ clear_elem: elem });
    };

    this.get_tiles_from = function(axis, index) {
        return this.scene.children.filter(function(elem) {
            return 'is_main' in elem && elem[axis] == index;
        })
    };

    this.shake_sprite = function(sprite) {
        this.actions.push({ shake_sprite: sprite });
    };

    this.enable_scene_animation = function() {
        this.actions.push('enable animation');
    };

    this.moveSpriteTo = function(sprite, w, h, time, callback) {
        this.x = w;
        this.y = h;
        callback(this, sprite);
    }

    this.lock_scene = function(color) {
        var lock_elem = { lock_scene: color };
        this.scene.addChild(lock_elem);
    };

    this.draw_message = function(msg_text, color) {
        this.scene.addChild({ msg_text: msg_text, color: color });
    };

    this.fade_out = function(elem) {
        client.scene.removeChild(elem);
    }

    this.handle_click_on_tile = function(tile, callback) {
        //callback(this);
    };

    this.handle_click_on_cellule = function(cellule, callback) {
        //callback(this);
    };
}