/**
 * webdb的migration
 */
define(function(require, exports) {
    return function(webdb) {
        // v0.1 migration
        (function() {
            var createUser = "CREATE TABLE users (\
                      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
                      cnname VARCHAR(255),\
                      workno INTEGER,\
                      email VARCHAR(255),\
                      phone VARCHAR(255),\
                      dept VARCHAR(255),\
                      py VARCHAR(255),\
                      duty VARCHAR(255),\
                      user_photo_id INTEGER,\
                      quit INTEGER,\
                      re_created_at timestamp)";
            webdb.addMigration(0.1, [createUser]);
        })();
        
        webdb.doMigrate();
    }
});
