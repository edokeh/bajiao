define(function(require) {
    var listCard = require("./list_card");
    var detailCard = require("./detail_card");
    var progress = require("./progress");
    var User = require("webdb/user");
    
    $(document).ready(function() {
        initViewport(function() {
            listCard.init();
            detailCard.init();
            initDb();
        });
        
        function initViewport(callback) {
            $(window).bind("orientationchange", function() {
                $('body').css("height", Math.max(window.innerHeight, window.innerWidth) * 2 + "px");
                setTimeout(function() {
                    window.scrollTo(0, 1);
                    $('body, .card').css({
                        "height": window.innerHeight + "px",
                        "width": window.innerWidth + "px"
                    });
                    $("#wrapper").css("width", window.innerWidth * 2 + 10 + "px");
                    if ($("#wrapper").attr("data-maincard") === "false") {
                        $("#wrapper").css("-webkit-transform", "translate3d(-" + window.innerWidth + "px,0,0)");
                    }
                    callback();
                }, 1000);
            }).trigger("orientationchange");
        }
        
        function initDb() {
            var lastVersion = localStorage.dbVersion;
            if (lastVersion != nowVersion) {
                progress.show();
                User.truncate();
                $.get("/users.json", function(users) {
                    User.batchCreate(users, function(curr, total) {
                        var percent = curr / total;
                        progress.setPercent(percent);
                        if (curr === total) {
                            localStorage.dbVersion = nowVersion;
                            progress.hide();
                            listCard.renderList();
                        }
                    })
                }, "json");
            }
            else {
                listCard.renderList();
            }
        }
    });
    if (!"ontouchstart" in window) {
        $("body").bind("click", function(event) {
            $(event.target).trigger("tap");
        });
    }
});
