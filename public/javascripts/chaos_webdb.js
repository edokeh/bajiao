(function(factory) {
    if (typeof define === 'function') {
        define(factory);
    }
    else {
        factory();
    }
})(function(require, exports) {
    var Chaos;
    if (typeof exports !== 'undefined') {
        Chaos = exports;
    }
    else {
        Chaos = this.Chaos = {};
    }
    
    /**
     * 数据库底层封装
     */
    Chaos.Webdb = function(dbName) {
        this.migrations = []; //数据表迁移数组
        this.migVersions = [];
        this.db = openDatabase(dbName, '', '', 5 * 1024 * 1024);
    }
    Chaos.Webdb.prototype = {
        constructor: Chaos.Webdb,
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
         * @param {Function} success 成功的回调
         */
        exeSql: function(sql, seg, success) {
            seg = seg || [];
            this.db.transaction(function(t) {
                t.executeSql(sql, seg, function(t, result) {
                    if (success) {
                        success(result);
                    }
                });
            }, function(e) {
                alert("exeSql " + sql + " error！ " + e.message);
                console.log(e);
            });
        },
        
        /**
         * 打开事务
         * @param {Function} callback 回调函数，第一个参数为t
         */
        transaction: function(callback) {
            this.db.transaction(callback, function(e) {
                alert("transaction error！ " + e.message);
                console.log(e);
            });
        }
    }
    
    /**
     * ORM类的管理类
     */
    Chaos.Model = {
        /**
         * 配置
         */
        config: function(options) {
            this.webdb = options["webdb"];
        },
        /**
         * 定义orm类
         * @param {Hash} options 需要传递table,columns参数
         *                       columns参数可以为字符串数组，或者用逗号、分号、空格隔开的字符串
         */
        define: function(options) {
            //实例构造方法
            var modelClass = function(json) {
                if (json) {
                    var columns = this.constructor.columns;
                    for (var i = 0; i < columns.length; i++) {
                        this[columns[i]] = json[columns[i]];
                    }
                }
                var t = new Date().getTime();
                this.created_at = t;
                this.updated_at = t;
            }
            //添加实例方法
            modelClass.prototype = this._instanceMethods;
            modelClass.prototype.constructor = modelClass;
            //添加类属性
            modelClass.table = options["table"];
            if (!(options["columns"] instanceof Array)) {
                options["columns"] = (options["columns"] + "").split(/,|;|\s/);
            }
            modelClass.columns = options["columns"];
            modelClass.webdb = this.webdb;
            //添加类方法
            for (var key in this._classMethods) {
                modelClass[key] = Chaos.Model._classMethods[key];
            }
            ["where", "order", "limit"].forEach(function(method) {
                modelClass[method] = function() {
                    var relation = new Chaos.Relation(modelClass);
                    return relation[method].apply(relation, arguments);
                }
            });
            return modelClass;
        },
        
        /**
         * orm类的类方法集合，方法的this都会指向实际的orm类
         */
        _classMethods: {
            /**
             * 根据id找一条记录
             */
            find: function(id, callback) {
                this.where("id=?", id).first(callback);
            },
            
            /**
             * 清空数据库
             */
            truncate: function() {
                this.webdb.exeSql("DELETE FROM " + this.table);
                this.webdb.exeSql("UPDATE sqlite_sequence SET seq=0 WHERE name=?", [this.table]);
            },
            
            /**
             * 批量新建
             * @param {Array} records
             * @param {Function} callback 回调，可用于显示进度，第一个参数为当前创建的个数，第二个参数为总个数
             */
            batchCreate: function(records, callback) {
                var sqls = [];
                var segs = [];
                for (var i = 0; i < records.length; i++) {
                    var tmp = [];
                    var seg = [];
                    var columns = this.columns;
                    for (var j = 0, len = columns.length; j < len; j++) {
                        tmp.push("?");
                        seg.push(records[i][columns[j]]);
                    }
                    var sql = "INSERT INTO " + this.table + "(" + columns.join(",") + ") VALUES (" + tmp.join(",") + ")";
                    sqls.push(sql);
                    segs.push(seg);
                }
                this.webdb.transaction(function(t) {
                    var curr = 0;
                    for (var i = 0; i < sqls.length; i++) {
                        t.executeSql(sqls[i], segs[i], function(t, result) {
                            callback(++curr, sqls.length);
                        });
                    }
                });
            }
        },
        
        /**
         * orm类的实例方法
         */
        _instanceMethods: {
            /**
             * 保存
             * @param {Function} success 成功时的回调，参数为插入记录的id
             */
            save: function(success) {
                var _this = this;
                var model = this.constructor;
                var tmp = [];
                var seg = [];
                var columns = model.columns;
                for (var i = 0, len = columns.length; i < len; i++) {
                    tmp.push("?");
                    seg.push(this[columns[i]]);
                }
                var sql = "INSERT INTO " + model.table + "(" + columns.join(",") + ") VALUES (" + tmp.join(",") + ")";
                model.webdb.exeSql(sql, seg, function(result) {
                    _this.id = result.insertId;
                    if (success) {
                        success(result.insertId);
                    }
                });
            },
            
            /**
             * 删除自己
             */
            destory: function() {
                var model = this.constructor;
                model.webdb.exeSql("DELETE FROM " + model.table + " WHERE id=?", [this.id]);
            }
        }
    }
    
    /**
     * model类的where,limit等语句生成的中间对象，用于链式调用
     */
    Chaos.Relation = function(model) {
        this.model = model;
        this.where_condition = null;
        this.where_values = [];
        this.order_values = null;
        this.limit_values = null;
    }
    Chaos.Relation.prototype = {
        constructor: Chaos.Relation,
        /**
         * 增加where子句
         * @param {Array} 可以传递任意个参数，如where("sex=1")或where("sex=?",1)
         *                 或者传递一个数组where(["sex=?",1])
         */
        where: function() {
            var args = Array.prototype.slice.call(arguments, 0);
            if (args.length === 1 && args[0] instanceof Array) {
                args = args[0];
            }
            this.where_condition = args.shift();
            this.where_values = args;
            return this;
        },
        limit: function(num) {
            this.limit_values = num;
            return this;
        },
        order: function(str) {
            this.order_values = str;
            return this;
        },
        /**
         * 遍历，此时才会执行sql
         * @param {Object} callback
         */
        each: function(callback) {
            var sql = this._buildSql();
            var _this = this;
            this.model.webdb.query(sql, this.where_values, function(rows) {
                var result = [];
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        result.push(_this._buildRec(rows.item(i)));
                    }
                }
                callback(result);
            });
        },
        
        /**
         * 执行sql，并取第一个结果
         */
        first: function(callback) {
            var sql = this._buildSql();
            var _this = this;
            this.model.webdb.query(sql, this.where_values, function(rows) {
                var record = null;
                if (rows.length > 0) {
                    record = _this._buildRec(rows.item(0));
                }
                callback(record);
            });
        },
        
        /**
         * 组装sql
         */
        _buildSql: function() {
            var sql = "SELECT * FROM " + this.model.table;
            if (this.where_condition) {
                sql += " WHERE " + this.where_condition;
            }
            if (this.order_values) {
                sql += " ORDER BY " + this.order_values;
            }
            if (this.limit_values) {
                sql += " LIMIT " + this.limit_values;
            }
            return sql;
        },
        
        /**
         * 根据web sql返回结果组装对象
         */
        _buildRec: function(obj) {
            var columns = this.model.columns;
            var r = new this.model();
            for (var j = 0; j < columns.length; j++) {
                r[columns[j]] = obj[columns[j]];
            }
            r.id = obj.id;
            return r;
        }
    }
});
