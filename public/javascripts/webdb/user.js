/**
 * User Model
 */
define(function(require, exports) {
    var Model = require("./model");
    
    var User = Model.define({
        table: "users",
        columns: "cnname,workno,email,phone,dept,py,duty,user_photo_id,quit,re_created_at"
    });
    /**
     * 搜索
     * @param {String} key 关键词，可以是数字，字母，中文，可以为空
     */
    User.search = function(key) {
        key = key || "";
        var sql = [];
        if (/^\d+$/.test(key)) {
            sql = ['(phone LIKE ? OR workno = ?) AND quit=?', key + "%", key, "false"];
        }
        else if (/^[a-zA-Z]+$/.test(key)) {
            sql = ['(py LIKE ? OR email LIKE ?) AND quit=?', key + "%", key + "%", "false"];
        }
        else if (/[\u4e00-\u9fa5]+/.test(key)) {
            sql = ['(cnname LIKE ? OR dept LIKE ?) AND quit=?', key + "%", "%" + key + "%", "false"];
        }
        else {
            sql = ["quit=?", "false"];
        }
        return User.where(sql);
    }
    
    return User;
});
