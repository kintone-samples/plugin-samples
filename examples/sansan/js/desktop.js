/*
 * Sansan plug-in
 * Copyright (c) 2016 Cybozu
 *
 * create by masaya chikamoto
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    var EVENTS = ['app.record.create.show', 'app.record.edit.show'];

    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }

    var C_SPACEFIELD = CONFIG['spacefield'];//ボタンを配置するスペースフィールド
    var C_KEYFIELD = CONFIG['keyfield'];//kintoneでキーとするフィールド
    var C_ORIGINALFIELD = CONFIG['originalfield'];//コピー元のSansanフィールド
    var C_COPYFIELD = [
        CONFIG['copy_owner'],//名刺所有者名 → owner
        CONFIG['copy_companyname'],//会社名 → companyName
        CONFIG['copy_username'],//氏名 → lastName + firstName
        CONFIG['copy_departmentname'],//部署名 → departmentName
        CONFIG['copy_title'],//役職 → title
        CONFIG['copy_address'],//住所 → prefecture + city + street + building
        CONFIG['copy_email'],//E-mail → email
        CONFIG['copy_tel'],//Tel → tel
        CONFIG['copy_mobile']//携帯 → mobile
    ];

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

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

    var Sansanlookup = {

        lookUpMessage: function($msg) {
            $("#lookup_input_erea").append($msg);
        },

        copyFieldParams: function(params) {

            var checkEmptyString = function(str) {
                if (str && str !== "" && str !== "null") {
                    return str;
                }
                return "";
            };

            var record = kintone.app.record.get();
            var copyvalue = [];
            copyvalue.push(checkEmptyString(params.owner));
            copyvalue.push(checkEmptyString(params.companyname));
            copyvalue.push(checkEmptyString(params.username));
            copyvalue.push(checkEmptyString(params.departmentname));
            copyvalue.push(checkEmptyString(params.title));
            copyvalue.push(checkEmptyString(params.address));
            copyvalue.push(checkEmptyString(params.email));
            copyvalue.push(checkEmptyString(params.tel));
            copyvalue.push(checkEmptyString(params.mobile));

            for (var i = 0; copyvalue.length > i; i++) {
                if (C_COPYFIELD[i] !== "null") {
                    record["record"][C_COPYFIELD[i]]["value"] = copyvalue[i];
                }
            }

            kintone.app.record.set(record);
            var getdata_msg = '<div id="sansan_lookup_validator" class="validator-valid-custom">' +
                                '参照先からデータが取得されました。</div>';
            this.lookUpMessage($(getdata_msg));
            $("#sansan-lookup-dialog").dialog('close');
        },

        getElementParams: function(el) {
            return {
                owner: el.find(".sansan_lookup_owner").val(),
                companyname: el.find(".sansan_lookup_companyname").val(),
                username: el.find(".sansan_lookup_username").val(),
                departmentname: el.find(".sansan_lookup_departmentname").val(),
                title: el.find(".sansan_lookup_title").val(),
                address: el.find(".sansan_lookup_address").val(),
                email: el.find(".sansan_lookup_email").val(),
                tel: el.find(".sansan_lookup_tel").val(),
                mobile: el.find(".sansan_lookup_mobile").val()
            };
        },

        showLookupDialog: function(lookup_list) {
            Spin.hideSpinner();
            //ダイアログの初期設定
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-lookup-dialog');
            $date_dialog.html(lookup_list);
            $date_dialog.dialog({
                title: 'Sansan検索結果',
                autoOpen: false,
                width: 900,
                maxHeight: 700,
                show: 400,
                hide: 400,
                modal: true,
                buttons: {
                    Cancel: function() {
                        $(this).dialog('close');
                    }
                }
            });
            $('#sansan-lookup-dialog').dialog('open');
            $(".sansan-lookup-select").click(function() {
                Sansanlookup.copyFieldParams(Sansanlookup.getElementParams($(this).parents(".sansan-lookup-tr")));
            });
        },

        createLookupListView: function(sansan_records) {
            var result;
            var companylist = "";
            var count = 0;

            //Sansan検索結果のリストを作成
            for (var i = 0; sansan_records.length > i; i++) {
                var sansan_record = sansan_records[i];

                companylist +=
                '<tr id="lookuplist_' + i + '" class="sansan-lookup-tr">' +
                //1列目：選択ボタン
                '<td class="lookup-cell-kintone">' +
                '<span><button class="button-simple-custom sansan-lookup-select" type="button">' +
                '選択</button></span>' + '</td>' +
                //2列目：会社名
                '<td>' + '<div class="line-cell-kintone"><span>' +
                escapeHtml(sansan_record['companyName']) + '</span></div>' +
                //選択ボタンクリック時の取得値
                '<input class="sansan_lookup_owner" value="' +
                escapeHtml(sansan_record['owner']['name']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_companyname" value="' +
                escapeHtml(sansan_record['companyName']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_username" value="' +
                escapeHtml(sansan_record["lastName"] + " " + sansan_record["firstName"]) + '" type="hidden">' +
                '<input class="sansan_lookup_departmentname" value="' +
                escapeHtml(sansan_record['departmentName']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_title" value="' +
                escapeHtml(sansan_record['title']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_address" value="' +
                escapeHtml(sansan_record["prefecture"] + sansan_record["city"] +
                            sansan_record["street"] + sansan_record["building"]) + '" type="hidden">' +
                '<input class="sansan_lookup_email" value="' + escapeHtml(sansan_record['email']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_tel" value="' + escapeHtml(sansan_record['tel']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_mobile" value="' + escapeHtml(sansan_record['mobile']) +
                '" type="hidden">' + '</td>' +
                //3列目：氏名
                '<td>' + '<div class="line-cell-kintone"><span>' +
                escapeHtml(sansan_record['lastName'] + " " + sansan_record['firstName']) +
                '</span></div>' + '</td>' +
                //4列目：E-mail
                '<td>' + '<div class="line-cell-kintone"><span>' + escapeHtml(sansan_record['email']) +
                '</span></div>' + '</td>' + '</tr>';
                count++;
            }
            result =
            '<table class="listTable-kintone lookup-table-kintone">' +
            '<thead class="lookup-thead-gaia">' + '<tr>' +
            //1列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">' + count + '件' + '</span></div>' + '</th>' +
            //2列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">会社名</span></div>' + '</th>' +
            //3列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">氏名</span></div>' + '</th>' +
            //4列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">E-mail</span></div>' + '</th>' +
            '</tr>' + '</thead>' + '<tbody>' + companylist + '</tbody>' + '</table>';

            return result;
        },

        changeRecordsFormat: function(sansan_records) {
            for (var i = 0; sansan_records.length > i; i++) {
                var sansan_record = sansan_records[i];
                //会社名、氏名、Emailが全て空文字の場合、リストに含めない。
                if (sansan_record['companyName'] === "" && sansan_record['lastName'] === "" &&
                    sansan_record['firstName'] === "" && sansan_record['email'] === "") {
                    sansan_records.splice(i, 1);
                    i += -1;
                }
                //住所nullチェック
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
        },

        clearRecordValues: function(records, numbers) {
            var exchangedates = [];
            var nullarray = [];
            var array = [];
            var registeredTimes = [];
            var numbers2 = [];


            for (var m = 0; numbers.length > m; m++) {
                exchangedates.push(records[numbers[m]]['exchangeDate']);
                registeredTimes.push(records[numbers[m]]['registeredTime']);
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
                if (records[numbers[n]]['exchangeDate'] !== exchangedates[0]) {

                    records[numbers[n]]['companyName'] = "";
                    records[numbers[n]]['lastName'] = "";
                    records[numbers[n]]['firstName'] = "";
                    records[numbers[n]]['email'] = "";
                } else {
                    numbers2.push(numbers[n]);
                }
            }

            //EMail及び名刺交換日がどちらも重複している場合、名刺登録日で判別
            if (numbers2.length > 1) {
                for (var n2 = 0; numbers2.length > n2; n2++) {
                    if (records[numbers2[n2]]['registeredTime'] !== registeredTimes[0]) {

                        records[numbers2[n2]]['companyName'] = "";
                        records[numbers2[n2]]['lastName'] = "";
                        records[numbers2[n2]]['firstName'] = "";
                        records[numbers2[n2]]['email'] = "";
                    }
                }
            }
            return records;
        },

        clearOverlappedRecords: function(records) {
            var check_records_number = [];
            for (var k = 0; records.length > k; k++) {
                for (var l = 0; records.length > l; l++) {
                    //レコード内にEmailの重複があった場合、対象のレコード番号取得
                    if (records[l]['email'] !== "" && records[k]['email'] === records[l]['email']) {
                        check_records_number.push(l);
                    }
                }
                //名刺交換日が古いレコードの会社名、氏名、Emailを空にする。
                if (check_records_number.length > 1) {
                    Sansanlookup.clearRecordValues(records, check_records_number);
                }
                check_records_number = [];
            }
            return records;
        },

        searchSansanData: function(dates, opt_offset, opt_records) {
            //Sansanよりデータ取得
            var record = kintone.app.record.get();
            var offset = opt_offset || 0;
            var value = record['record'][C_KEYFIELD]['value'] || "";
            var allrecords = opt_records || [];
            var url = "https://api.sansan.com/v1/bizCards";
            if (!dates) {
                url += "/search" + "?range=all";
                if (value !== "") {
                    url += "&" + C_ORIGINALFIELD + "=" + encodeURIComponent(value);
                }
            } else {
                url += "?range=all" + "&registeredFrom" + "=" + encodeURIComponent(dates[0]) +
                        "&registeredTo" + "=" + encodeURIComponent(dates[1]);
            }
            url += "&offset=" + offset;
            return kintone.plugin.app.proxy(PLUGIN_ID, url, "GET", {}, {}).then(function(body) {
                allrecords = allrecords.concat(JSON.parse(body[0]).data);
                if (JSON.parse(body[1]) !== 200) {
                    var error_message = JSON.parse(body[0]).error[0].code;
                    if (JSON.parse(body[1]) === 429) {
                        error_message = "リクエスト数が制限値を超えています。\n5分以上時間を置いてから再度取得してください。";
                    }
                    return Promise.reject(new Error(error_message));
                }
                //5000件以上は処理終了
                if (allrecords.length >= 5000) {
                    return allrecords;
                }
                if (JSON.parse(body[0]).data.length === 100) {
                    return Sansanlookup.searchSansanData(dates, offset + 100, allrecords);
                }
                return allrecords;
            }, function(error) {
                return Promise.reject(new Error(error.message));
            });
        },

        getLookupList: function(dates) {

            Sansanlookup.searchSansanData(dates).then(function(sansan_data) {
                //Email値の重複チェック
                var sansan_records = Sansanlookup.clearOverlappedRecords(sansan_data);

                //Sansan取得データ数(0~5000件)チェック
                if (sansan_records.length === 0) {
                    var nodata_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                    '<span>データがありません。</span></div>';
                    Sansanlookup.lookUpMessage($(nodata_msg));
                    Spin.hideSpinner();
                    return false;

                } else if (sansan_records.length === 1) {
                    //ルックアップ表示せずに取得
                    Sansanlookup.changeRecordsFormat(sansan_records);
                    Spin.hideSpinner();
                    if (sansan_records.length === 0) {
                        var nodata_msg2 = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                        '<span>データがありません。</span></div>';
                        Sansanlookup.lookUpMessage($(nodata_msg2));
                        return false;
                    }
                    Sansanlookup.copyFieldParams(Sansanlookup.getRecordParams(sansan_records[0]));

                } else if (sansan_records.length >= 5000) {
                    //5000件以上の場合エラー
                    var find_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                    '<span>5000件以上のレコードがヒットしました<br>検索条件で絞り込んでください</span></div>';
                    Sansanlookup.lookUpMessage($(find_msg));
                    Spin.hideSpinner();
                    return false;

                } else {
                    //2~4999件の場合ルックアップ画面表示
                    Sansanlookup.changeRecordsFormat(sansan_records);
                    Sansanlookup.showLookupDialog(Sansanlookup.createLookupListView(sansan_records));
                }
            }).catch(function(error) {
                Spin.hideSpinner();
                swal('Error!', 'Sansanデータの取得に失敗しました。\n' + error.message, 'error');
                return false;
            });
        },

        checkDateValue: function(dates) {
            var date_msg = "";
            if (dates[0] && dates[1] && dates[0] > dates[1]) {
                date_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                '<span>開始期間を終了日付より前に設定してください。</span></div>';
                Sansanlookup.lookUpMessage($(date_msg));
                return false;
            }
            if (dates[0] === "Invalid date" || dates[1] === "Invalid date") {
                date_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                '<span>開始期間及び終了期間を設定してください。</span></div>';
                Sansanlookup.lookUpMessage($(date_msg));
                return false;
            }
            return true;
        },

        //取得したレコードが一つの場合、直接値を追加。
        getRecordParams: function(lookup_record) {
            return {
                owner: lookup_record["owner"]["name"],
                companyname: lookup_record["companyName"],
                username: lookup_record["lastName"] + lookup_record["firstName"],
                departmentname: lookup_record["departmentName"],
                title: lookup_record["title"],
                address: lookup_record["prefecture"] + lookup_record["city"] +
                        lookup_record["street"] + lookup_record["building"],
                email: lookup_record["email"],
                tel: lookup_record["tel"],
                mobile: lookup_record["mobile"]
            };
        },

        showDateDialog: function(date_list) {

            //ダイアログの初期設定
            var dates = [];
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-date-dialog');
            $date_dialog.html(date_list);
            $date_dialog.dialog({
                title: '検索期間設定',
                autoOpen: false,
                width: 500,
                maxHeight: 700,
                show: 400,
                hide: 400,
                modal: true,
                buttons: {
                    Cancel: function() {
                        $(this).dialog('close');
                        $(this).remove();
                    }
                }
            });
            $(function() {
                $('#start_date').datepicker({dateFormat: 'yy/mm/dd', changeMonth: "true", changeYear: "true" });
                $('#end_date').datepicker({dateFormat: 'yy/mm/dd', changeMonth: "true", changeYear: "true" });
            });
            $('#sansan-date-dialog').dialog('open');
            $(".sansan-date-select").click(function() {
                dates[0] = moment(new Date(escapeHtml($("#start_date").val()))).format();
                dates[1] = moment(new Date(escapeHtml($("#end_date").val()))).format();
                if (Sansanlookup.checkDateValue(dates)) {
                    Sansanlookup.doSearch(dates);
                }
                $('#sansan-date-dialog').dialog('close');
                $('#sansan-date-dialog').remove();
            });
        },

        createDateListView: function() {
            var result;
            result =
                '<table class="listTable-kintone lookup-table-kintone">' +
                '<thead class="lookup-thead-gaia">' + '<tr>' +
                //1列目見出し
                '<th>' + '<div><span class="recordlist-header-label-kintone">開始</span></div>' + '</th>' +
                //2列目見出し
                '<th>' + '<div><span class="recordlist-header-label-kintone">終了</span></div>' + '</th>' +
                //3列目見出し
                '<th>' + '<div><span class="recordlist-header-label-kintone"></span></div>' + '</th>' +
                '</tr>' + '</thead>' + '<tbody>' +
                '<tr id="lookuplist_1' + '" class="sansan-lookup-tr">' +
                //1列目：開始日付
                '<td class="lookup-cell-kintone">' +
                '<span><input type="text" size="11" id="start_date"></span>' + '</td>' +
                //2列目：終了日付
                '<td class="lookup-cell-kintone" >' +
                '<span><input type="text" size="11" id="end_date"></span>' + '</td>' +
                //3列目：OKボタン
                '<td class="lookup-cell-kintone">' +
                '<span><button class="button-simple-custom sansan-date-select" type="button">' +
                'OK</button></span>' + '</td>' + '</tr>' + '</tbody>' + '</table>';
            return result;
        },

        init: function() {
            $("#sansan-lookup-dialog").remove();
            if ($("#sansan_lookup_validator").size() > 0) {
                $("#sansan_lookup_validator").remove();
            }
            if ($("#sansan_lookup_validator_error").size() > 0) {
                $("#sansan_lookup_validator_error").remove();
            }
        },

        doSearch: function(dates) {
            Spin.showSpinner();
            this.init();
            this.getLookupList(dates);
        },

        doClear: function() {
            this.init();
            var record = kintone.app.record.get();
            for (var i = 0; C_COPYFIELD.length > i; i++) {
                if (C_COPYFIELD[i] !== "null") {
                    record["record"][C_COPYFIELD[i]]["value"] = "";
                }
            }
            kintone.app.record.set(record);
        },

        lookupHtml:
            '<div class="lookup-buttons" id="lookup_input_erea">' +
            '<button id="lookup_search_button" type="button">取得</button>' +
            '<button id="lookup_clear_button" type="button">クリア</button>' +
            '<button id="lookup_setting_button" type="button">期間</button>' +
            '</div>'
    };

    // [追加画面/編集画面]表示イベント
    kintone.events.on(EVENTS, function(event) {

        var $lookup = $(kintone.app.record.getSpaceElement(C_SPACEFIELD));
        $lookup.append($(Sansanlookup.lookupHtml));

        $("#lookup_search_button").click(function() {
            Sansanlookup.doSearch();
        });
        $("#lookup_clear_button").click(function() {
            Sansanlookup.doClear();
        });
        $("#lookup_setting_button").click(function() {
            Sansanlookup.init();
            Sansanlookup.showDateDialog(Sansanlookup.createDateListView());
        });
        return event;
    });
})(jQuery, kintone.$PLUGIN_ID);
