function MainScene(level_settings, field_width, field_height) {
    
    this.settings = level_settings;
    // at the start of the game neither block is selected
    this.selected_block = null;
    /* disable selecting any block during animation
       by default neither block selected */
    this.disable_select = false;

    // distance between cells
    this.separator_h = field_height * 0.03; // 3%
    this.separator_w = field_width * 0.03; // 3%

    this.cellule_width = (field_width - this.separator_w * (
        this.settings.width_count + 1)) / this.settings.width_count;

    this.cellule_height = (field_height - this.separator_h * (
        this.settings.height_count + 1)) / this.settings.height_count;
};


function Cellule(w, h, color) {
    this.w = w; this.h = h;
    this.color = color;
}


function Block(w, h, color, is_main) {
    this.w = w; this.h = h;
    this.color = color; this.is_main = is_main;
}


function CreateJSClient(scene) {
    this.scene = scene;

    this.render_lvl_blocks = function(Block) {
        for (var index = 0; index < scene.settings.blocks.length; index++) {
            var block_data = scene.settings.blocks[index];

            var w_pos = scene.separator_w + scene.separator_w *
                block_data.w + scene.cellule_width * block_data.w;
            var h_pos = scene.separator_h + scene.separator_h *
                block_data.h + scene.cellule_height * block_data.h;

            var block = new Block(scene, block_data.w,
                block_data.h, block_data.color, block_data.is_main);

            block.__proto__ = new createjs.Shape();
            // add event listener for block
            this.handle_click_on_block(block);

            block.graphics.beginFill(block.color).drawRoundRectComplex(w_pos,
                h_pos, scene.cellule_width, scene.cellule_height, 10, 10, 10, 10);
            block.shadow = new createjs.Shadow(block_data.color, 0, 0, scene.cellule_width / 10);
            scene.addChild(block);
        }
    };

    this.handle_click_on_block = function(block) {

        block.on('click', function(event) {
            if (this.scene.selected_block) {
                if (!(this.scene.selected_block === this)) {
                    // select another block, and deselect current
                    this.scene.selected_block.dispatchEvent('click');
                }
            }

            this.scene.selected_block = !this.graphics._stroke ? this: null;
            // if block not selected
            if (!this.graphics._stroke) {
                if (this.scene.disable_select) return;
                this.graphics.clear().setStrokeStyle(5).beginStroke("#000");
            } else {
                this.graphics.clear();
            }
            // calculate block position in pixels
            var w_pos = this.scene.separator_w + this.scene.separator_w *
                this.w + this.scene.cellule_width * this.w;
            var h_pos = this.scene.separator_h + this.scene.separator_h *
                this.h + this.scene.cellule_height * this.h;
            // shadow color the same as shape color
            this.graphics.beginFill(this.color).drawRoundRectComplex(w_pos, h_pos,
                this.scene.cellule_width, this.scene.cellule_height, 10, 10, 10, 10);
            this.x = 0; this.y = 0;
            this.scene.update();
        });
    };

    this.render_game_field = function(Cellule, standart_collor, destination_collor) {
        // render game field
        for (var h = 0; h < this.scene.settings.height_count; h++) {
            for (var w = 0; w < this.scene.settings.width_count; w++) {
                var cellule_color = (this.scene.settings.destination_h == h) && (
                    this.scene.settings.destination_w == w) ? standart_collor: destination_collor;

                var cellule = new Cellule(this.scene, w, h, cellule_color);
                cellule.__proto__ = new createjs.Shape();
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
    }

    this.handle_click_on_cellule = function(cellule) {

    }
}