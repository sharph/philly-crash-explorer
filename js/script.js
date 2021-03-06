var layer;
var map;
var vis;
var map;
var whereClause = '1=1';

cartodb.createVis('map', 'https://sharp.cartodb.com/api/v2/viz/bdf34ac8-76e7-11e5-9cfd-0e5db1731f59/viz.json')
    .done(function (vis, layers) {
        vis = vis;
        map = vis.getNativeMap();
        layer = layers[1].getSubLayer(0);
        refresh();
        map.on('moveend', onMapMove);
    });
var tableName = 'collisions_crash_2011_2014pubv';

function onMapMove() {
    refreshToddow();
}


function refresh() {
    var query;
    var where = ['1=1'];
    if ($('#bicycle-checkbox').is(':checked')) { where.push('bicycle_count > 0'); }
    if ($('#automobile-checkbox').is(':checked')) {
        where.push('(automobile_count > 0' +
                   ' or van_count > 0' +
                   ' or suv_count > 0' +
                   ' or small_truck_count > 0' +
                   ')');
    }
    if ($('#ped-checkbox').is(':checked')) { where.push('ped_count > 0'); }
    if ($('#motorcycle-checkbox').is(':checked')) { where.push('motorcycle_count > 0'); }
    if ($('#bus-checkbox').is(':checked')) { where.push('bus_count > 0'); }

    whereClause = '(' + where.join(' AND ') + ')';

    where = [];

    if ($('#2011-checkbox').is(':checked')) { where.push('crash_year = 2011'); }
    if ($('#2012-checkbox').is(':checked')) { where.push('crash_year = 2012'); }
    if ($('#2013-checkbox').is(':checked')) { where.push('crash_year = 2013'); }
    if ($('#2014-checkbox').is(':checked')) { where.push('crash_year = 2014'); }

    if (where.length > 0) {
        whereClause += ' AND (' + where.join(' OR ') + ')';
    }

    query = [
        'select street_centerline.cartodb_id, street_centerline.the_geom_webmercator, street_centerline.stname, ',
        'count(collisions_crash_2011_2014pubv)::float / ',
        '(select count(*) from collisions_crash_2011_2014pubv ',
        ' where ', whereClause, ') as i, ',
        'count(collisions_crash_2011_2014pubv) as count, ',
        'count(collisions_crash_2011_2014pubv.fatal_count) as fatal ',
        'FROM street_centerline, collisions_crash_2011_2014pubv ',
        'where collisions_crash_2011_2014pubv.seg_id = street_centerline.seg_id and (',
        whereClause, ') ',
        'group by street_centerline.the_geom_webmercator, street_centerline.stname, street_centerline.cartodb_id'
    ].join('');
    console.log(query);
    layer.setSQL(query);
    refreshToddow();
}
