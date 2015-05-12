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

    this.lock_scene = function(color) {
        var lock_elem = new createjs.Shape();
        lock_elem.graphics.beginFill(color).drawRoundRectComplex(0,
            0, this.scene.field_width, this.scene.field_height, 10, 10, 10, 10);
        // do nothing when is pressed on element
        lock_elem.on('click', function(event) {});
        lock_elem.alpha = 0;
        createjs.Tween.get(lock_elem).to({alpha: 0.7}, 500);
        this.scene.addChild(lock_elem);
    };

    this.draw_message = function(msg_text, color) {
        var message = new createjs.Text(msg_text,
            "bold 20px Ubuntu Mono, cursive, Arial", color);
        message.x = document.getElementById('screen').offsetWidth / 2 - 60;
        message.y = document.getElementById('screen').offsetHeight / 2 - 10;
        this.scene.addChild(message);
    };

    this.remove_all_scene_elements = function() {
        this.scene.removeAllChildren();
    };
}
