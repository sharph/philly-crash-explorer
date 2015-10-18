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
        var baseWhere = ['the_geom && ', bbox, ' AND (', whereClause, ') '].join('');;
        var selects = [];
        var select;
        for (var hour = 0; hour < 24; hour++) {
            for (var dow = 1; dow <= 7; dow++) {
                select = ['(select count(*) from ', tableName,
                          ' where (',
                          baseWhere,
                          ') and ',
                          'day_of_week = ', dow,
                          ' and hour_of_day = ', hour,
                          ') as ',
                          'd', dow, 'h', hour].join('');
                selects.push(select);
            }
        }
        query = ['select ', selects.join(', ')].join('');
        console.log(query);
        sql.execute(query).done(function (data) {
            callback(data.rows[0]);
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
                html += '">';
                console.log('d' + d + 'h' + h)
                html += data['d' + d + 'h' + h];
                html += '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        $('.sk-cube-grid').addClass('sk-hidden');
        $('#toddow').html(html);
    }

    $('.sk-cube-grid').removeClass('sk-hidden');
    $('#toddow').html('');
    toddowData(updateToddow);
}
