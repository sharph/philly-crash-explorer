var layer;
var map;
var vis;
var map;
var whereClause = '1=1';

cartodb.createVis('map', 'https://sharp.cartodb.com/api/v2/viz/c6209c60-751f-11e5-b83a-0e787de82d45/viz.json')
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
    if ($('#automobile-checkbox').is(':checked')) { where.push('automobile_count > 0'); }
    if ($('#ped-checkbox').is(':checked')) { where.push('ped_count > 0'); }

    whereClause = where.join(' AND ');

    query = [
        'SELECT * FROM ',
        tableName,
        ' WHERE ',
        whereClause,
    ].join('');
    layer.setSQL(query);
    refreshToddow();
}
