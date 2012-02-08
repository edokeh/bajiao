/**
 * 进度条
 */
define(function(require) {
    return {
        /**
         * 显示进度条弹出层
         */
        show: function() {
            $("#progressPercent").css("width", 0);
            $("#progressPop").parent().css({
                "height": window.innerHeight + "px",
                "width": window.innerWidth + "px"
            }).show();
        },
        /**
         * 隐藏进度条弹出层
         */
        hide: function() {
            $("#progressPop").parent().hide();
        },
        /**
         * 设置进度条百分比
         * @param {Float} percent 如果是20.5%，请传递0.205，小数点后保留两位
         */
        setPercent: function(percent) {
            percent = (percent * 100).toFixed(2);
            $("#progressText").text(percent + "%");
            $("#progressPercent").css("width", percent + "%");
        }
    };
});
