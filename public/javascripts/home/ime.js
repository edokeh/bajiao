//输入法
define(function(require) {
    return {
        init: function() {
            var _this = this;
            this.keys = [];
            $("#ime table").height($("#ime").height());
            $("#ime table").show()
            $("#ime").find("td").on("touchstart",  function() {
                $(this).addClass("touched");
            }).on("touchend",  function() {
                $(this).removeClass("touched");
                var key = this.innerHTML;
                if (key === "←") {
                    _this.keys.pop();
                }
                else {
                    _this.keys.push(key);
                }
            });
            
            this.renderInputText();
        },
        
        /**
         * 渲染字符
         */
        renderInputText: function() {
            var _this = this;
            var text = this.keys.join("");
            if (this.lastText !== text) {
                $("#imeText").text(text);
                this.lastText = text;
            }
            setTimeout(function() {
                _this.renderInputText();
            }, 50);
        },
        
        onInput: function(callback) {
            this.inputCallback = callback;
        }
    }
});
