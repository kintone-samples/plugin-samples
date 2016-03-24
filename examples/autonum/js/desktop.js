/*
 * Auto Number plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

(function(PLUGIN_ID) {
    "use strict";

    // [追加画面/編集画面]表示イベント
    var EVENTS1 = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.index.edit.show'
    ];
    var EVENTS2 = ['app.record.create.submit'];// [追加画面]保存実行前イベント

    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);//設定値取得
    var C_TEXT = CONFIG['text'];
    var C_FIELDCODE = CONFIG['autofield'];
    var C_SELECTFORMAT = CONFIG['format'];
    var C_DATESELECTFORMAT = CONFIG['dateformat'];
    var C_CONNECTIVE = CONFIG['connective'];
    var C_RESETTIMING = CONFIG['timing'];
    var C_FORMAT = [
        CONFIG['format1'],
        CONFIG['format2'],
        CONFIG['format3']
    ];

    //採番の値を作る関数 例：20151101-text-00001
    function formatCreate(number) {

        var date = "";
        if (C_DATESELECTFORMAT !== "null") {
            date = moment().format(C_DATESELECTFORMAT);
        }

        switch (C_SELECTFORMAT) {
            case "format1":
                return (number);

            case "format2":
                return (date + C_CONNECTIVE + number);

            case "format3":
                return (date + C_CONNECTIVE + C_TEXT + C_CONNECTIVE + number);

            case "format4":
                return (C_TEXT + C_CONNECTIVE + number);

            case "format5":
                return (C_TEXT + C_CONNECTIVE + date + C_CONNECTIVE + number);

            default:
                return ("");
        }
    }

    //連番を数える関数
    function countupNumber(newlayout, countnumber) {

        var appId = kintone.app.getId();
        var newcountnumber = countnumber;
        var newlayout2 = newlayout;
        var zerono = ("0000" + countnumber).slice(-5);
        var query = C_FIELDCODE + "=\"" + newlayout2 + "\"";
        var appUrl = kintone.api.url('/k/v1/records', true);
        var params = {
            "app": appId,
            "query": query
        };

        return kintone.api(appUrl, 'GET', params).then(function(respdata) {
            // レコードを取得できた場合、重複のため番号を振りなおす
            if (respdata.records.length > 0) {
                newcountnumber += 1;
                zerono = ("0000" + newcountnumber).slice(-5);
                newlayout2 = formatCreate(zerono);
                return countupNumber(newlayout2, newcountnumber);
            }
            return newlayout2;

        }, function(error) {
            return Promise.reject(new Error(error.message));
        });
    }

    //連番リセットタイミングチェック関数 true:連番1から
    function isDateResetTimingCheck(before, after) {

        var digit;
        switch (C_RESETTIMING) {

            case "0"://なし
                return false;

            case "1"://年毎
                // 西暦が2桁の場合は、2桁で比較し、それ以外は4桁で比較
                if (C_DATESELECTFORMAT === "YY") {
                    digit = 2;
                } else {
                    digit = 4;
                }
                // 年が異なる場合、切替タイミング
                if (before.substr(0, digit) !== after.substr(0, digit)) {
                    return true;
                }
                return false;

            case "2"://月毎
                // 西暦が6桁の場合は、2桁で比較し、それ以外は4桁
                if (C_DATESELECTFORMAT === "YYYYMMDD" || C_DATESELECTFORMAT === "YYYYMM") {
                    digit = 6;
                } else {
                    digit = 2;
                }
                // 異なる場合、切替タイミング
                if (before.substr(0, digit) !== after.substr(0, digit)) {
                    return true;
                }
                return false;

            case "3"://日毎
                // 異なる場合、切替タイミング
                if (before !== after) {
                    return true;
                }
                return false;

            default:
                return false;
        }
    }

    //startpointカウントアップ
    function countupStartPoint(startpoint, format) {

        var formatdate = moment().format(C_DATESELECTFORMAT);

        // 書式で「日付」が選択されている場合
        if (format === "date") {
            var datelen = formatdate.length + 1;
            return (startpoint + datelen);

        // 書式で「テキスト」が選択されている場合
        } else if (format === "text") {
            var textlen = C_TEXT.length + 1;
            return (startpoint + textlen);
        }
    }

    //日付・テキストのフォーマットチェック
    function checkFormat(startpoint, autonum, format) {

        var formatdate = moment().format(C_DATESELECTFORMAT);// 書式で「日付」が選択されている場合、日付情報作成
        var before;// 取得した採番の形式チェック
        var after;// 取得した採番の形式チェック

        // 書式で「日付」が選択されている場合の形式チェック
        if (format === "date") {
            // 日付+接続語の長さを取得
            var datelen = formatdate.length + 1;

            before = autonum.substr(startpoint, datelen);
            after = formatdate + C_CONNECTIVE;

            // 接続語の位置が一致しているかの確認
            if (before.indexOf(C_CONNECTIVE) !== after.indexOf(C_CONNECTIVE)) {
                return true;
            }

            // 頭1文字で比較(桁数が同じ場合の制御で「西暦(4桁)」「月日(4桁)」、「テキスト設定」「日付」の比較用)
            if (before.substr(0, 1) !== after.substr(0, 1)) {
                return true;
            }

            // 日付によるリセットタイミングの確認
            if (isDateResetTimingCheck(before, after)) {
                return true;
            }
            return false;

        // 書式で「テキスト」が選択されている場合の形式チェック
        } else if (format === "text") {
            // テキスト設定+接続語の長さを取得

            var textlen = C_TEXT.length + 1;

            before = autonum.substr(startpoint, textlen);
            after = C_TEXT + C_CONNECTIVE;

            // 設定文書のテキスト設定と前採番の形式チェック
            if (before !== after) {
                return true;
            }
            return false;
        }
    }

    //連番チェック true:連番1から false:連番カウントアップへ進む。
    function isResetNumber(respdata) {

        var loopnum;// 書式情報を取得

        // 書式の連番位置からループ回数の取得
        if (C_FORMAT[0] === "number") {
            loopnum = 0;
        } else if (C_FORMAT[1] === "number") {
            loopnum = 1;
        } else if (C_FORMAT[2] === "number") {
            loopnum = 2;
        }

        // 検索にヒットした最新の採番取得
        var autonum = respdata['records'][0][C_FIELDCODE]['value'];
        var count = 0;
        var pos = autonum.indexOf(C_CONNECTIVE);

        // 直近に採番された書式の接続語の個数計算

        while (pos !== -1) {
            count++;
            pos = autonum.indexOf(C_CONNECTIVE, pos + 1);
        }

        // 直近に採番された書式と新しく採番する書式の接続語の個数比較
        if (loopnum !== count) {
            return true;
        }
        var startpoint = 0;

        // 書式で「日付」「テキスト」が選択されている場合のみ形式チェックを行う
        for (var i = 0; i < loopnum; i++) {
            if (checkFormat(startpoint, autonum, C_FORMAT[i])) {
                return true;
            }
            startpoint = countupStartPoint(startpoint, C_FORMAT[i]);
        }
        return false;
    }

    // [追加画面/編集画面]表示イベント
    kintone.events.on(EVENTS1, function(event) {

        if (!CONFIG) {
            return false;
        }
        var record = event['record'];// レコードの取得
        record[C_FIELDCODE]['disabled'] = true;// フィールドの編集不可
        return event;
    });

    // [追加画面]保存実行前イベント
    kintone.events.on(EVENTS2, function(event) {

        var record = event.record;
        var appId = kintone.app.getId();
        var query = "order by $id desc limit 1";
        var appUrl = kintone.api.url('/k/v1/records', true);
        var params = {
            "app": appId,
            "query": query
        };

        return new kintone.Promise(function(resolve, reject) {
            kintone.api(appUrl, 'GET', params, function(respdata) {
                resolve(respdata);
            }, function(error) {
                reject(error);
            });

        }).then(function(respdata) {
            if (!respdata.records[0]) {
                record[C_FIELDCODE]['value'] = formatCreate("00001");// フィールドに値を設定
                return formatCreate("00001");
            }

            var autonum = respdata['records'][0][C_FIELDCODE]['value'];
            var no;// 連番部分作成

            if (isResetNumber(respdata)) {// 直近の採番情報と形式が異なっている場合、1から採番し直す
                no = 1;
            } else {// 直近の採番情報と形式が同じ場合、+1する
                no = parseInt(autonum.slice(-5), 10) + 1;//連番持ってきて整数番号のみをもってくる。例 10
            }

            var zerono = ("0000" + no).slice(-5);// 桁数分0(ゼロ)埋め情報を作成する
            var newlayout = formatCreate(zerono);//採番用の書式作成。
            newlayout = countupNumber(newlayout, no);//再度重複チェック&連番カウントアップ。
            return newlayout;

        }).then(function(newlayout) {
            record[C_FIELDCODE]['value'] = newlayout;// フィールドに値を設定
            return event;

        }).catch(function(error) {
            swal('Error!', '自動採番の番号取得に失敗しました\n' + error.message, 'error');
            return false;
        });
    });
})(kintone.$PLUGIN_ID);
