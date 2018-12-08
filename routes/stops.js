var express = require('express');
var db = require('../db');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    const query = `
    select
    	'Feature' as type,
	    row_to_json(
    		(
		    select p from (
    			select
				    stop_name as stop_name,
    				stop_id as stop_id
			    ) as p
    		)
    	)as properties,
	    st_asGeoJson(geom)::json as geometry
    from
        stops
    `

    db.task(async t => {
        const rtn = await t.any(query);
        // console.log(rtn)
        res.json(rtn)
    })
});

module.exports = router;
