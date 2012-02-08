/**
 * websql的封装
 * @author geliang
 */
var WebDB = function(dbName) {
    this.migrations = []; //数据表迁移数组
    this.migVersions = [];
    this.db = openDatabase(dbName, '', '', 5 * 1024 * 1024);
}
WebDB.prototype = {
    /**
     * 添加迁移脚本
     * @param {float} newV 新的数据库版本号
     * @param {Array or String} sql 迁移sql，可以为string或string数组
     */
    addMigration: function(newV, sql) {
        this.migrations.push(sql);
        this.migVersions.push(parseFloat(newV));
    },
    
    /**
     * 执行迁移操作
     */
    doMigrate: function() {
        var lastestV = this.migVersions[this.migVersions.length - 1] + "";
        if (this.db.version !== lastestV) {
            var _this = this;
            var currV = parseFloat(this.db.version || -1);
            
            console.log("migrate from " + currV);
            var migSqls = [];
            for (var i = 0; i < this.migVersions.length; i++) {
                if (this.migVersions[i] > currV) {
                    if (this.migrations[i] instanceof Array) {
                        migSqls = migSqls.concat(this.migrations[i]);
                    }
                    else {
                        migSqls.push(this.migrations[i]);
                    }
                    
                }
            }
            this.db.changeVersion(this.db.version, lastestV, function(t) {
                for (var i = 0; i < migSqls.length; i++) {
                    t.executeSql(migSqls[i]);
                }
            }, function(e) {
                alert("db migration failed! " + e.message);
                console.log(e);
            }, function() {
                console.log("migrate ok!");
            });
        }
    },
    /**
     * 发起查询
     * @param {String} sql
     * @param {Array} seg
     * @param {Function} callback 回调函数，有1个参数SQLResultSetRowList
     */
    query: function(sql, seg, callback) {
        this.db.readTransaction(function(t) {
            t.executeSql(sql, seg, function(t, result) {
                callback(result.rows);
            });
        }, function(e) {
            alert("query error！ " + e.message);
            console.log(e);
        });
    },
    
    /**
     * 执行SQL
     * @param {String} sql
     * @param {Array} seg
     */
    exeSql: function(sql, seg) {
        seg = seg || [];
        this.db.transaction(function(t) {
            t.executeSql(sql, seg, function() {
            
            });
        }, function(e) {
            alert("exeSql " + sql + " error！ " + e.message);
            console.log(e);
        });
    }
}
