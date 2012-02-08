/**
 * 列表card
 */
define(function(require) {
    var ime = require("./ime");
    var about = require("./about");
    var detailCard = require("./detail_card");
    var User = require("webdb/user");
    
    return {
        /**
         * 初始化界面
         */
        init: function() {
            this.initSearchInput();
            this.initScroll();
            ime.init();
            ime.onInput(function(key) {
              alert(key);
            });
            
            //关于按钮
            $("#about").tap(function() {
                about.show();
            });
            $("#rebuildDb").tap(function() {
                localStorage.dbVersion = null;
            });
        },
        
        /**
         * 初始化搜索框
         */
        initSearchInput: function() {
            var _this = this;
            var searchTimer;
            //点击搜索框
            $("#searchInput").focus(function() {
                window.scrollTo(0, 1);
                setTimeout(function() {
                    $("#list header").hide();
                    $("#searchInput").focus();
                }, 100);
                searchTimer = setInterval(function() {
                    var lastKey = $("#searchInput").data("lastKey") || "";
                    if (lastKey !== $("#searchInput").val()) {
                        $("#searchInput").trigger("keyChange");
                    }
                    $("#searchInput").data("lastKey", $("#searchInput").val());
                }, 1000);
            }).blur(function() {
                $("#list header").show();
                window.scrollTo(0, 1);
                clearTimeout(searchTimer);
            }).on("keyChange", function() {
                _this.renderList($("#searchInput").val());
            });
        },
        
        /**
         * 初始化列表
         */
        initScroll: function() {
            var touchTimer;
            var removeTouchClass = function() {
                clearTimeout(touchTimer);
                $("#staffList li.touched").removeClass("touched");
            }
            var listScroll = new iScroll("staffListWrapper", {
                onBeforeScrollStart: function(e) {
                    clearTimeout(touchTimer);
                    touchTimer = setTimeout(function() {
                        $(e.target).addClass("touched");
                    }, 5);
                    
                    e.preventDefault();
                },
                onScrollMove: removeTouchClass,
                onBeforeScrollEnd: removeTouchClass,
                checkDOMChanges: true
            });
            $("#staffList").on("tap", "li", function() {
                detailCard.render($(this).attr("data-userid"));
                setTimeout(function() {
                    $("#searchInput").blur();
                }, 1000);
            });
        },
        
        /**
         * 根据关键词渲染list
         * @param {String} key 搜索关键字，可以不传
         */
        renderList: function(key) {
            $("#staffList").empty();
            User.search(key).limit(20).each(function(users) {
                for (var i = 0; i < users.length; i++) {
                    //<span class="phone">' + users[i].phone + '</span>
                    $("#staffList").append('<li data-userid="' + users[i].id + '"><span class="username">' + users[i].cnname + '</span></li>');
                }
            });
        }
    }
});
