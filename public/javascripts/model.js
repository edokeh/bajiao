/**
 * 简易的ORM
 */
/**
 * Model类，所有的表都应当继承此类
 * @param {Object} options
 */
function Model(options) {
    this.table = options.table;
    this.columns = options.columns; //请不要增加主键
};

Model.Config = {
    webdb: null
}

Model.prototype = {
    /**
     * 创建表的一个新纪录
     * @param {Object} json对象，可以不传递
     */
    newRecord: function(json) {
        var record = new Record();
        record.model = this;
        if (json) {
            for (var i = 0; i < this.columns.length; i++) {
                record[this.columns[i]] = json[this.columns[i]];
            }
        }
        var t = new Date().getTime();
        record.created_at = t;
        record.updated_at = t;
        return record;
    },
    
    /**
     * 根据sql取记录，结果集不会包装成record数组
     * @param {String} sql
     * @param {Array} seg
     */
    find_by_sql: function(sql, seg, callback) {
        var _this = this;
        Model.Config.webdb.query(sql, seg, function(rows) {
            callback(rows);
        });
    },
    
    /**
     * 根据id取记录
     * @param {Object} id
     * @param {Object} callback
     */
    find: function(id, callback) {
        var _this = this;
        Model.Config.webdb.query("SELECT * FROM " + this.table + " WHERE id=?", [id], function(rows) {
            if (rows.length > 0) {
                var r = new Record();
                r.model = _this;
                var columns = _this.columns;
                for (var i = 0; i < columns.length; i++) {
                    r[columns[i]] = rows.item(0)[columns[i]];
                }
                r.id = rows.item(0).id;
                callback(r);
            }
            else {
                callback(null);
            }
        });
    },
    /**
     * 根据条件取记录
     * @param {Object} condition 条件数组，形如["name=? and score=?", "geliang", 18]
     */
    where: function(condition) {
        var relation = new Relation(this);
        return relation.where(condition);
    },
    
    /**
     * 取所有记录
     * @param {Object} callback
     */
    all: function() {
        return this.where(["1=1"]);
    },
    
    limit: function(num) {
        var relation = new Relation(this);
        return relation.limit(num);
    },
    order: function(str) {
        var relation = new Relation(this);
        return relation.order(str);
    },
    
    /**
     * 清空数据库
     */
    truncate: function() {
        Model.Config.webdb.exeSql("DELETE FROM " + this.table);
        Model.Config.webdb.exeSql("UPDATE sqlite_sequence SET seq=1 WHERE name=?", [this.table]);
    }
};

/**
 * where,limit,order等方法返回的中间对象
 */
function Relation(model) {
    this.model = model;
    this.where_condition = null;
    this.where_values = [];
    this.order_values = null;
    this.limit_values = null;
}

Relation.prototype = {
    where: function(condition) {
        this.where_condition = condition.shift();
        this.where_values = condition;
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
    each: function(callback) {
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
        var _this = this;
        Model.Config.webdb.query(sql, this.where_values, function(rows) {
            var result = [];
            var columns = _this.model.columns;
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var r = new Record();
                    r.model = _this;
                    for (var j = 0; j < columns.length; j++) {
                        r[columns[j]] = rows.item(i)[columns[j]];
                    }
                    r.id = rows.item(i).id;
                    result.push(r);
                }
            }
            callback(result);
        });
    }
}


/**
 * 表中一条数据的类
 */
function Record() {
}

Record.prototype = {
    save: function() {
        var tmp = [];
        var seg = [];
        var columns = this.model.columns;
        for (var i = 0, len = columns.length; i < len; i++) {
            tmp.push("?");
            seg.push(this[columns[i]]);
        }
        var sql = "INSERT INTO " + this.model.table + "(" + columns.join(",") + ") VALUES (" + tmp + ")";
        Model.Config.webdb.exeSql(sql, seg);
    },
    update: function() {
        var tmp = [];
        var seg = [];
        var columns = this.model.columns;
        for (var i = 0, len = columns.length; i < len; i++) {
            tmp.push("?");
            seg.push(this[columns[i]]);
        }
        var sql = "INSERT INTO " + this.model.table + "(" + columns.join(",") + ") VALUES (" + tmp + ")";
        Model.Config.webdb.exeSql(sql, seg);
    }
}
