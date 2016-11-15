/*
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
*/

/* global ZDC */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    var config = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).options);
    var latField = config.latField;
    var lonField = config.lonField;
    var tooltipTitle = config.tooltipTitle;
    var apikey = config.apikey;
    var domain = config.domain;
    var indexMapAvailable = config.indexMapAvailable;
    var indexMapHeight = config.indexMapHeight || '600px';
    var centerLat = parseFloat(config.indexCenterLat, 10) || undefined;
    var centerLon = parseFloat(config.indexCenterLon, 10) || undefined;
    var zoomSize = parseFloat(config.indexZoomSize, 10) || 10;
    var latlons = [];
    //--------------関数--------------------------//
    //外部JSをロードする関数
    function loadJS(src) {
        $('<script>')
            .attr('src', src)
            .attr('type', 'text/javascript')
            .appendTo('head');
    }
    function setClickEvent(mark, obj) {
        ZDC.bind(mark, ZDC.MARKER_CLICK, obj, function() {
            location.href = this.url; //obj.url
        });
    }
    //地図上にプロットするピンのオブジェクトリストを作成
    function makeMarkList(records) {
        var markList = [];
        var url = location.href.replace(/\?.*/, '') + 'show#record=';
        for (var i = 0; i < records.length; i++) {
            var lat = records[i][latField].value;
            var lon = records[i][lonField].value;
            var recNo = records[i].$id.value;
            var tooltipText = records[i][tooltipTitle].value;
            var latlon = new ZDC.LatLon(lat, lon);
            if (lat && lon) {
                latlons.push(latlon);
            }
            var mark = new ZDC.Marker(latlon, {
                color: ZDC.MARKER_COLOR_ID_BLUE_S,
                number: ZDC.MARKER_NUMBER_ID_STAR_S
            });
            mark.setTitle(tooltipText);
            var obj = {url: url + recNo};
            setClickEvent(mark, obj);
            markList.push(mark);
        }
        return markList;
    }
    //マップを画面上に描画する
    function displayMap(markList) {
        //マップを表示するスペース
        var mapSpace = kintone.app.getHeaderSpaceElement();
        if ($("[id^='itsumo-navi-map']")[0]) {
            return;
        }
        var $mapElement = $('<div>')
            .attr('id', 'itsumo-navi-map')
            .attr('name', 'itsumo-navi-map')
            .css({
                'width': 'auto',
                'height': indexMapHeight,
                'margin-right': '30px',
                'border': 'solid 2px #c4b097'
            });
        $(mapSpace).append($mapElement);
        //オプションを指定
        var tmpCenterLat = (centerLat) ? centerLat : 35.68;
        var tmpCenterLon = (centerLon) ? centerLon : 139.76;
        var mapOption = {
            latlon: new ZDC.LatLon(tmpCenterLat, tmpCenterLon),
            zoom: zoomSize
        };
        //マップを描画
        var map = new ZDC.Map($('#itsumo-navi-map')[0], mapOption);
        //コントロールを表示
        var control = new ZDC.Control({
            type: ZDC.CTRL_TYPE_NORMAL
        });
        map.addWidget(control);
        if (centerLat === undefined || centerLon === undefined) {
            var adjust = map.getAdjustZoom(latlons);
            if (adjust) {
                map.setZoom(adjust.zoom);
                map.moveLatLon(adjust.latlon);
                map.setZoom(adjust.zoom);
            }else {
                alert('取得住所が広域なためマップのサイズ調整が必要です。');
            }
        }
        //ピンをプロット
        for (var i = 0; i < markList.length; i++) {
            var mark = markList[i];
            map.addWidget(mark);
        }
    }
    //いつもNAVI API(JS)がロードされるのを待って処理を実行する
    function waitLoaded(event, interval, timeout) {
        setTimeout(function() {
            var remainingTime = timeout - interval;
            if (typeof ZDC === 'object') {
                var records = event.records;
                var markList = makeMarkList(records);
                if (event.records.length > 0) {
                    displayMap(markList);
                }else {
                    var $myMsg = $('<p></p>', {
                        text: 'レコードを登録してください。CSVでの登録時は、緯度・経度は自動で登録されません。'
                    }).css({
                        textAlign: 'center',
                        backgroundColor: '#e1f2f7'
                    });
                    $(kintone.app.getHeaderSpaceElement()).append($myMsg);
                }
            } else if (timeout > 0) {
                waitLoaded(event, interval, remainingTime);
            } else {
                return false;
            }
        }, interval);
    }
    //初期化
    function init(event) {
        if (indexMapAvailable) {
            //add js-file by using zenrin API
            loadJS('https://' + domain + '/cgi/loader.cgi?key=' +
            apikey + '&ver=2.0&api=zdcmap.js,control.js&enc=SJIS');
            //waiting ZDC object defined, and loading marker and map
            waitLoaded(event, 200, 4000);
        }
    }
    //--------------Main--------------------------//
    kintone.events.on('app.record.index.show', init);
})(jQuery, kintone.$PLUGIN_ID);
