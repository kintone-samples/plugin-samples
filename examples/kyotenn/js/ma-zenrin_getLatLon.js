/*
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    var config = JSON.parse(kintone.plugin.app.getConfig(PLUGIN_ID).options);
    var addressField = config.addressField;
    var latField = config.latField;
    var lonField = config.lonField;
    var apikey = config.apikey;
    var domain = config.domain;
    //-------関数------------------------------//
    //外部JSをロードする関数
    function loadJS(src) {
        $('<script>')
            .attr('src', src)
            .attr('type', 'text/javascript')
            .appendTo('head');
    }
    //--------Main------------------------------//
    kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.index.edit.show'], function(event) {
        //SDK(JS)のロード
        loadJS('https://'+ domain +'/cgi/loader.cgi?key=' + apikey + '&ver=2.0&api=zdcmap.js,search.js&enc=SJIS');
        //緯度、経度フィールドのdisabled
        var record = event.record;
        record[latField].disabled = true;
        record[lonField].disabled = true;
        return event;
    });
    var submitEvents = ['app.record.create.submit', 'app.record.edit.submit', 'app.record.index.edit.submit'];
    kintone.events.on(submitEvents, function(event) {
        var record = event.record;
        var address = record[addressField].value;
        //住所の入力チェック
        if (address === '') {
            alert('住所を入力してください');
            return false;
        }
        //クエリの作成
        var query = {
            address: address,
            level: 'ebn'
        };
        return new kintone.Promise(function(resolve, reject) {
            //ZDCオブジェクトを利用して非同期リクエストを送信
            ZDC.Search.getLatLonByAddr(query, function(status, resp) {
                if (status.code === '000' && resp[0] !== null) {
                    record[latField].value = resp[0].latlon.lat;
                    record[lonField].value = resp[0].latlon.lon;
                    resolve(event);
                } else if (status.code === '000' && resp[0] === null) {
                    alert('Error: 入力された住所から緯度・経度を取得できませんでした');
                    reject();
                } else {
                    alert('Error: 緯度・経度が取得できませんでした');
                    reject();
                }
            });
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
