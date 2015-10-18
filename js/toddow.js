var sql = cartodb.SQL({ user: 'sharp' });

var validRequest = null;

function refreshToddow() {
    var currentRequest = (new Date()).getTime();
    validRequest = currentRequest;

    function toddowData(callback) {
        var bounds = map.getBounds();
        var bbox = ['ST_MakeEnvelope(',
                    bounds.getWest(), ', ',
                    bounds.getSouth(), ', ',
                    bounds.getEast(), ', ',
                    bounds.getNorth(), ')'].join('');
        var baseWhere = ['the_geom && ', bbox, ' AND (', whereClause, ') '].join('');
        if (!$('#toddow-vp-checkbox').is(':checked')) {
            baseWhere = whereClause;
        }
        query = ['select day_of_week,hour_of_day,count(*),count(fatal_count) as fatal from ',
                 tableName,
                 ' where ',
                 baseWhere,
                 ' group by day_of_week,hour_of_day'].join('');
        sql.execute(query).done(function (data) {
            var transformedData = {};
            var row;
            for (var hour = 0; hour < 24; hour++) {
                for (var dow = 1; dow <= 7; dow++) {
                    transformedData['d'+dow+'h'+hour] = 0;
                }
            }
            for (i in data.rows) {
                row = data.rows[i];
                transformedData['d'+row.day_of_week+'h'+row.hour_of_day] = row.count;
                if (row.fatal) {
                    transformedData['d'+row.day_of_week+'h'+row.hour_of_day+'f'] = true;
                }
            }
            callback(transformedData);
        });
    }

    var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];

    function updateToddow(data) {
        if (currentRequest !== validRequest) {
            return;
        }
        var h;
        var html = '<table>';
        html += '<tr>';
        html += '<th></th>';
        var min = data['d1h0'];
        var max = data['d1h0'];
        var range;
        // find min
        for (k in data) {
            if (data[k] < min) {
                min = data[k];
            }
        }
        // find max
        for (k in data) {
            if (data[k] > max) {
                max = data[k];
            }
        }
        range = max - min;
        // top row header
        for(h = 0; h < 24; h++) {
            html += '<th>' + h + '</th>';
        }
        html += '</tr>';
        for(var d = 1; d <= 7; d++) {
            html += '<tr>';
            html += '<th>';
            html += days[d - 1];
            html += '</th>';
            for(h = 0; h < 24; h++) {
                html += '<td class="';
                html += 'val' + parseInt((data['d'+d+'h'+h] - min) * 16 / range);
                if (data['d'+d+'h'+h+'f']) {
                    html += " fatal";
                }
                html += '">';
                console.log('d' + d + 'h' + h)
                html += data['d' + d + 'h' + h];
                html += '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        $('#toddow').html(html);
    }

//    $('#toddow').html('');
    toddowData(updateToddow);
}
