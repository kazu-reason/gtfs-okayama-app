var options = {
    // initialization options;
};

var pgp = require("pg-promise")(options);
var db = pgp("postgres://postgres:password@localhost:5432/gtfs-okayama");
 
module.exports = db;