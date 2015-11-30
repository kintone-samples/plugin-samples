/*
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    var config = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).options);
    var latField = config.latField;
    var lonField = config.lonField;
    var detailMapField = config.detailMapField;
    var tooltipTitle = config.tooltipTitle;
    var detailMapAvailable = config.detailMapAvailable;
    var dispalyRootAvailable = config.dispalyRootAvailable;
    var detailMapWidth = config.detailMapWidth || '600px';
    var detailMapHeight = config.detailMapHeight || '600px';
    var apikey = config.apikey;
    var domain = config.domain;
    var map;
    var rootMethod;
    //-------関数------------------------------//
    //外部JSをロードする関数
    function loadJS(src) {
        $('<script>')
            .attr('src', src)
            .attr('type', 'text/javascript')
            .appendTo('head');
    }
    //地図上にプロットするピンのオブジェクトを作成
    function makeMarkObject(record) {
        var lat = record[latField].value;
        var lon = record[lonField].value;
        var tooltipText = record[tooltipTitle].value;
        var latlonObj = new ZDC.LatLon(lat, lon);
        var markObj = new ZDC.Marker(latlonObj, {
            color: ZDC.MARKER_COLOR_ID_BLUE_S,
            number: ZDC.MARKER_NUMBER_ID_STAR_S
        });
        markObj.setTitle(tooltipText);
        return [markObj, latlonObj];
    }
    //マップを画面上に描画する
    function displayMap(markAndlatlon) {
        var mark = markAndlatlon[0];
        var latlon = markAndlatlon[1];
        //マップを表示するスペースを作成
        var mapSpace = kintone.app.record.getSpaceElement(detailMapField);
        var mapElement = document.createElement('div');
        mapElement.id = 'itsunavi-map';
        mapElement.name = 'itsunavi-map';
        mapElement.setAttribute(
            'style', 'width: ' + detailMapWidth +
            '; height: ' + detailMapHeight +
            '; margin-right: 30px; border: solid 2px #c4b097'
        );
        mapSpace.appendChild(mapElement);
        //オプションを指定
        var mapOption = {
            latlon: latlon,
            zoom: 10
        };
        //マップを描画し、ピンをプロットする
        map = new ZDC.Map(mapElement, mapOption);
        map.addWidget(mark);
        //コントロールを表示
        var control = new ZDC.Control({
            type: ZDC.CTRL_TYPE_NORMAL
        });
        map.addWidget(control);
    }
    //歩いていく場合の処理
    function displayWalkRoot(fromPoint, toPoint) {
        ZDC.Search.getRouteByWalk({
            from: fromPoint,
            to: toPoint
        }, function(status, res) {
            if (status.code === '000') {
                //取得成功
                var start = new ZDC.Marker(fromPoint);
                var end = new ZDC.Marker(toPoint);
                var routeOpt = {
                    strokeColor: '#3000ff',
                    strokeWeight: 5,
                    lineOpacity: 0.5
                };
                var link = res.route.link;
                var pl, latlons = [];
                for (var i = 0, j = link.length; i < j; i++) {
                    var pllatlons = [];
                    for (var k = 0, l = link[i].line.length; k < l; k++) {
                        pllatlons.push(link[i].line[k]);
                        latlons[i] = link[i].line[0];
                        if (i === j - 1 && k === 1) {
                            latlons[i + 1] = link[i].line[1];
                        }
                    }
                    pl = new ZDC.Polyline(pllatlons, routeOpt);
                    map.addWidget(pl);
                }
                map.addWidget(start);
                map.addWidget(end);
                var adjust = map.getAdjustZoom([fromPoint, toPoint]);
                map.moveLatLon(adjust.latlon);
                map.setZoom(adjust.zoom);
            } else {
                //取得失敗
                alert(status.text);
            }
        });
    }
    //車でいく場合の処理
    function displayCarRoot(fromPoint, toPoint) {
        ZDC.Search.getRouteByDrive({
            from: fromPoint,
            to: toPoint
        }, function(status, res) {
            if (status.code === '000') {
                //取得成功
                var start = new ZDC.Marker(fromPoint);
                var end = new ZDC.Marker(toPoint);
                var routeOpt = {
                    strokeColor: '#3000ff',
                    strokeWeight: 5,
                    lineOpacity: 0.5
                };
                var link = res.route.link;
                var pl, latlons = [];
                for (var i = 0, j = link.length; i < j; i++) {
                    var pllatlons = [];
                    for (var k = 0, l = link[i].line.length; k < l; k++) {
                        pllatlons.push(link[i].line[k]);
                        latlons[i] = link[i].line[0];
                        if (i === j - 1 && k === 1) {
                            latlons[i + 1] = link[i].line[1];
                        }
                    }
                    pl = new ZDC.Polyline(pllatlons, routeOpt);
                    map.addWidget(pl);
                }
                map.addWidget(start);
                map.addWidget(end);
                var adjust = map.getAdjustZoom([fromPoint, toPoint]);
                map.moveLatLon(adjust.latlon);
                map.setZoom(adjust.zoom);
            } else {
                //取得失敗
                alert(status.text);
            }
        });
    }
    //Geolocationのコールバック処理
    function geoCallBak(resp) {
        //緯度・経度オブジェクトの作成
        var wgsfromPoint = new ZDC.LatLon(resp.coords.latitude, resp.coords.longitude);
        //世界測地系から日本測地系に変換
        var fromPoint = ZDC.wgsTotky(wgsfromPoint);
        //目的地を取得
        var recobj = kintone.app.record.get();
        var record = recobj.record;
        var toPoint = new ZDC.LatLon(record.lat.value, record.lng.value);
        //rootMethodによって歩行 or  車でルート検索
        if (rootMethod === 'itsunavi-root-walk') {
            //歩いていく場合
            displayWalkRoot(fromPoint, toPoint);
        } else if (rootMethod === 'itsunavi-root-car') {
            //車でいく場合
            displayCarRoot(fromPoint, toPoint);
        }
    }
    //Geolocationのエラー処理関数
    function geoErrBak(error) {
        //エラーコードのメッセージを定義
        var errorMessage = {
            0: "原因不明のエラーが発生しました…。",
            1: "位置情報の取得が許可されませんでした…。",
            2: "電波状況などで位置情報が取得できませんでした…。",
            3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
        };
        //エラーコードに合わせたエラー内容をアラート表示
        alert(errorMessage[error.code]);
    }
    //地図上に現在地から目的地のルートを表示する
    function writeRoute() {
        //歩いていく or 車で行く
        rootMethod = this.id;
        //現在地をGeolocationを利用して取得する
        var options = {
            enableHighAccuracy: true,
            timeout: 8000
        };
        navigator.geolocation.getCurrentPosition(geoCallBak, geoErrBak, options);
    }
    //ボタンを作成する関数
    function setButton(spaceName, msgText, method) {
        //メニューの右側の空白部分の要素にボタンを配置する
        var buttonSpace = kintone.app.record.getHeaderMenuSpaceElement();
        var button = document.createElement('button');
        button.id = method;
        button.type = 'button';
        button.className = 'button-simple-cybozu';
        button.style.height = '25px';
        button.innerHTML = msgText;
        button.onclick = writeRoute;
        buttonSpace.appendChild(button);
    }
    //いつもNAVI API(JS)がロードされるのを待って処理を実行する
    function waitLoaded(event, interval, timeout) {
        setTimeout(function() {
            var remainingTime = timeout - interval;
            //ZDCオブジェクトが存在するか
            if (typeof ZDC === 'object') {
                //ルートを表示オプションの有効の場合ボタンを表示する
                if (dispalyRootAvailable) {
                    setButton('button1', '歩いて行く', 'itsunavi-root-walk');
                    setButton('button2', '車で行く', 'itsunavi-root-car');
                }
                //レコードの緯度・経度から地図を表示する
                var record = event.record;
                var markAndlatlon = makeMarkObject(record);
                displayMap(markAndlatlon);
            } else if (timeout > 0) {
                waitLoaded(event, interval, remainingTime);
            } else {
                return false;
            }
        }, interval);
    }
    //初期化
    function init(event) {
        //詳細画面でのマップ表示のONの場合、マップを表示する
        if (detailMapAvailable) {
            //API(JS)をロード
            loadJS('https://'+ domain +'/cgi/loader.cgi?key=' +
            apikey + '&ver=2.0&enc=SJIS&api=zdcmap.js,search.js,shape.js,control.js');
            //waiting ZDC object defined, and loading marker and map
            waitLoaded(event, 200, 4000);
        }
    }
    //--------------Main--------------------------//
    kintone.events.on('app.record.detail.show', init);
})(jQuery, kintone.$PLUGIN_ID);
