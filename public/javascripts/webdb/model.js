/**
 * 配置ORM，包括配置数据库及执行迁移操作
 */
define(function(require, exports) {
    var Chaos = require("chaos_webdb");
    var webdb = new Chaos.Webdb("bajiao");
    
    require("./migration")(webdb);
    
    Chaos.Model.config({
        "webdb": webdb
    });
    
    return Chaos.Model;
});
