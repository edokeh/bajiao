/**
 * 关于弹出层
 */
define(function(require, exports) {
    return {
        /**
         * 显示关于弹出层
         */
        show: function() {
            $("#aboutPop").parent().css({
                "height": window.innerHeight + "px",
                "width": window.innerWidth + "px"
            }).show();
        },
        /**
         * 隐藏进度条弹出层
         */
        hide: function() {
            $("#aboutPop").parent().hide();
        }
    }
});
