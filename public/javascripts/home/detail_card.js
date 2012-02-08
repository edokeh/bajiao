/**
 * 详情card
 */
define(function(require, exports) {
    var User = require("webdb/user");
    
    return {
        init: function() {
            //返回
            $(".back").tap(function() {
                $("#wrapper").css("-webkit-transform", "translate3d(0,0,0)").attr("data-maincard", "true");
            });
            new iScroll("detailPanel", {
                checkDOMChanges: true
            });
        },
        /**
         * 根据id渲染card
         * @param {Object} id 用户id
         */
        render: function(id) {
            $("#wrapper").append($("#detail"));
            $("#wrapper").css("-webkit-transform", "translate3d(-" + window.innerWidth + "px,0,0)").attr("data-maincard", "false");
            
            $("#staffPhoto").attr("src", "/images/nophoto.jpg");
            User.find(id, function(user) {
                $("#staffPhoto").attr("src", "/user_photos/" + user.user_photo_id);
                var fields = "cnname,phone,email,dept,duty,workno".split(",");
                $("#staffDetail").find("span").each(function() {
                    var field = fields.shift();
                    if (field === "email") {
                        $(this).html('<a href="mailto:' + user[field] + '">' + user[field] + '</a>');
                    }
                    else {
                        $(this).html(user[field]);
                    }
                    
                });
            });
        }
    }
});
