/*
 * Sansan plug-in
 * Copyright (c) 2016 Cybozu
 *
 * create by masaya chikamoto
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();
(function($) {
    "use strict";
    //エスケープ
    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    //Sansanから取得したデータのフォーマットを変更
    function changeRecordsFormat(sansan_records) {
        for (var i = 0; sansan_records.length > i; i++) {
            var sansan_record = sansan_records[i];
            //会社名、氏名、Emailが全て空文字の場合、リストに含めない。
            if (sansan_record['companyName'] === "" && sansan_record['lastName'] === "" &&
                sansan_record['firstName'] === "" && sansan_record['email'] === "") {
                sansan_records.splice(i, 1);
                i += -1;
            }

            //名刺交換日nullチェック&空文字置換
            if (sansan_record["exchangeDate"] === null) {
                sansan_record["exchangeDate"] = "";
            }
            //郵便番号nullチェック&空文字置換
            if (sansan_record["postalCode"] === null) {
                sansan_record["postalCode"] = "";
            }
            //住所nullチェック&空文字置換
            if (sansan_record["prefecture"] === null) {
                sansan_record["prefecture"] = "";
            }
            if (sansan_record["city"] === null) {
                sansan_record["city"] = "";
            }
            if (sansan_record["street"] === null) {
                sansan_record["street"] = "";
            }
            if (sansan_record["building"] === null) {
                sansan_record["building"] = "";
            }
        }
        return sansan_records;
    }

    //重複処理
    function clearRecordValues(sansan_records, numbers) {
        var exchangedates = [];
        var nullarray = [];
        var array = [];
        var registeredTimes = [];
        var numbers2 = [];

        for (var m = 0; numbers.length > m; m++) {
            exchangedates.push(sansan_records[numbers[m]]['exchangeDate']);
            registeredTimes.push(sansan_records[numbers[m]]['registeredTime']);
        }
        //名刺交換日を降順にソート
        exchangedates.sort(function(a, b) {
            return (a < b ? 1 : -1);
        });

        //名刺交換日nullチェック
        for (var i = 0; i < exchangedates.length; i++) {
            if (exchangedates[i] === null) {
                nullarray.push(exchangedates[i]);
            } else {
                array.push(exchangedates[i]);
            }
        }
        exchangedates = array.concat(nullarray);

        //重複があれば会社名、氏名、Emailを空文字にする = リストに含まない
        for (var n = 0; numbers.length > n; n++) {
            if (sansan_records[numbers[n]]['exchangeDate'] !== exchangedates[0]) {

                sansan_records[numbers[n]]['companyName'] = "";
                sansan_records[numbers[n]]['lastName'] = "";
                sansan_records[numbers[n]]['firstName'] = "";
                sansan_records[numbers[n]]['email'] = "";
            } else {
                numbers2.push(numbers[n]);
            }
        }

        //EMail及び名刺交換日がどちらも重複している場合、名刺登録日で判別
        if (numbers2.length > 1) {
            for (var n2 = 0; numbers2.length > n2; n2++) {
                if (sansan_records[numbers2[n2]]['registeredTime'] !== registeredTimes[0]) {

                    sansan_records[numbers2[n2]]['companyName'] = "";
                    sansan_records[numbers2[n2]]['lastName'] = "";
                    sansan_records[numbers2[n2]]['firstName'] = "";
                    sansan_records[numbers2[n2]]['email'] = "";
                }
            }
        }
        return sansan_records;
    }
    function clearOverlappedRecords(sansan_records) {
        var check_records_number = [];
        for (var k = 0; sansan_records.length > k; k++) {
            for (var l = 0; sansan_records.length > l; l++) {
                //レコード内にEmailの重複があった場合、対象のレコード番号取得
                if (sansan_records[l]['email'] !== "" && sansan_records[k]['email'] === sansan_records[l]['email']) {
                    check_records_number.push(l);
                }
            }
            //名刺交換日が古いレコードの会社名、氏名、Emailを空にする。
            if (check_records_number.length > 1) {
                clearRecordValues(sansan_records, check_records_number);
            }
            check_records_number = [];
        }
        return sansan_records;
    }

    //スピナー表示/非表示
    var Spin = {
        spinner: new Spinner({
            lines: 13,
            length: 28,
            width: 14,
            radius: 42,
            scale: 1,
            corners: 1,
            color: "#FFF",
            opacity: 0.25,
            rotate: 0,
            direction: 1,
            speed: 1,
            trail: 60,
            fps: 20,
            zIndex: 2e9,
            className: "spinner",
            top: "50%",
            left: "50%",
            shadow: false,
            hwaccel: false,
            position: "fixed"
        }),
        showSpinner: function() {
            if ($(".kintone-spinner").length === 0) {
                // spinner back ground
                var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');
                $(document.body).append(spin_bg_div);

                $(spin_bg_div).css({
                    "position": "fixed",
                    "top": "0px",
                    "left": "0px",
                    "z-index": "500",
                    "width": "100%",
                    "height": "1000%",
                    "background-color": "#000",
                    "opacity": "0.5",
                    "filter": "alpha(opacity=50)",
                    "-ms-filter": "alpha(opacity=50)"
                });
            }
            $(".kintone-spinner").show();
            this.spinner.spin($("html")[0]);
        },
        hideSpinner: function() {
            $(".kintone-spinner").hide();
            this.spinner.stop();
        }
    };
    window.sansanLib = window.sansanLib || {};
    window.sansanLib.escapeHtml = escapeHtml;
    window.sansanLib.Spin = Spin;
    window.sansanLib.changeRecordsFormat = changeRecordsFormat;
    window.sansanLib.clearRecordValues = clearRecordValues;
    window.sansanLib.clearOverlappedRecords = clearOverlappedRecords;
})(jQuery);
