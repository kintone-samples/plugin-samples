/*
 * Sansan plug-in Lookup
 * Copyright (c) 2016 Cybozu
 *
 * create by masaya chikamoto
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }
    var C_LOOKUP_FLG = CONFIG['sansan_lookup_flg'];             //ルックアップ機能ON/OFF
    if (C_LOOKUP_FLG !== 'lookup_on') {
        return false;
    }
    var C_SPACEFIELD = CONFIG['spacefield'];                    //ボタンを配置するスペースフィールド
    var C_KEYFIELD = CONFIG['keyfield'];                        //kintoneでキーとするフィールド
    var C_COPYFIELDS = window.sansanLib.getConfigValues(CONFIG); //コピー先のフィールド

/*
*------------------------------------------------------------------------------------------
*レコード詳細画面の Sansan ルックアップ機能
*------------------------------------------------------------------------------------------
*/
    var Sansanlookup = {
        //初期処理
        init: function() {
            $("#sansan-lookup-dialog").remove();
            if ($("#sansan_lookup_validator").size() > 0) {
                $("#sansan_lookup_validator").remove();
            }
            if ($("#sansan_lookup_validator_error").size() > 0) {
                $("#sansan_lookup_validator_error").remove();
            }
        },
        doSearch: function(type, value) {
            window.sansanLib.Spin.showSpinner();
            this.init();
            this.getLookupList(type, value);
        },
        doClear: function() {
            this.init();
            var record = kintone.app.record.get();
            for (var key in C_COPYFIELDS) {
                if (C_COPYFIELDS[key] !== 'null') {
                    record['record'][C_COPYFIELDS[key]]['value'] = "";
                }
            }
            kintone.app.record.set(record);
        },
        getLookupList: function(type, value) {

            Sansanlookup.searchSansanData(type, value).then(function(sansan_data) {

                //Emailの重複チェック
                var sansan_records = window.sansanLib.deleteOverlappedRecords(sansan_data, 'email');

                //Sansan取得データ数(0~5000件)チェック
                if (sansan_records.length === 0) {
                    var nodata_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                    '<span>データがありません。</span></div>';
                    Sansanlookup.lookUpMessage($(nodata_msg));
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_records.length === 1) {
                    //ルックアップ表示せずに取得
                    window.sansanLib.Spin.hideSpinner();
                    Sansanlookup.copyFieldParams(Sansanlookup.getRecordParams(sansan_records[0]));
                } else if (sansan_records.length >= 5000) {
                    //5000件以上の場合エラー
                    var find_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                    '<span>5000件以上のレコードがヒットしました<br>検索条件で絞り込んでください</span></div>';
                    Sansanlookup.lookUpMessage($(find_msg));
                    window.sansanLib.Spin.hideSpinner();
                    return false;
                } else {
                    //2~4999件の場合ルックアップ画面表示
                    window.sansanLib.checkNullParams(sansan_records);
                    var listview_html = window.sansanLib.createListViewHTML("Lookup", sansan_records);
                    Sansanlookup.showLookupDialog(listview_html);
                }
            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                swal('Error!', 'Sansanデータの取得に失敗しました。\n' + error.message, 'error');
                return false;
            });
        },
        searchSansanData: function(type, value, opt_offset, opt_records) {
            //Sansanよりデータ取得
            var limit = 300;
            var offset = opt_offset || 0;
            var allrecords = opt_records || [];
            var url = window.sansanLib.createSansanURL(type, value, limit, offset);
            return kintone.plugin.app.proxy(PLUGIN_ID, url, "GET", {}, {}).then(function(body) {
                allrecords = allrecords.concat(JSON.parse(body[0]).data);
                if (JSON.parse(body[1]) !== 200) {
                    var error_message = JSON.parse(body[0]).error[0].code;
                    if (JSON.parse(body[1]) === 429) {
                        error_message = "リクエスト数が制限値を超えています。\n5分以上時間を置いてから再度取得してください。";
                    }
                    return kintone.Promise.reject(new Error(error_message));
                }

                //5000件以上は処理終了
                if (allrecords.length >= 5000) {
                    return allrecords;
                }
                if (JSON.parse(body[0]).hasMore === true) {
                    return Sansanlookup.searchSansanData(type, value, offset + limit, allrecords);
                }
                return allrecords;
            }, function(error) {
                return kintone.Promise.reject(new Error(error.message));
            });
        },
        showLookupDialog: function(lookup_list) {
            window.sansanLib.Spin.hideSpinner();
            //ダイアログの初期設定
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-lookup-dialog');
            $date_dialog.html(lookup_list);
            $date_dialog.dialog({
                "title": 'Sansan検索結果',
                "autoOpen": false,
                "width": 900,
                "maxHeight": 700,
                "show": 400,
                "hide": 400,
                "modal": true,
                "buttons": {
                    "キャンセル": function() {
                        $(this).dialog('close');
                    }
                }
            });
            $('#sansan-lookup-dialog').dialog('open');
            $(".sansan-lookup-select").click(function() {
                var params = window.sansanLib.getElementParams($(this).parents(".sansan-lookup-tr"));
                Sansanlookup.copyFieldParams(params);
            });
        },

        //Sansanより取得したデータをフィールドへコピーする処理
        getRecordParams: function(lookup_record) {
            return {
                "cardid": window.sansanLib.escapeHtml(lookup_record["id"]),
                "companyid": window.sansanLib.escapeHtml(lookup_record["companyId"]),
                "userid": window.sansanLib.escapeHtml(lookup_record["personId"]),
                "exchangedate": window.sansanLib.escapeHtml(lookup_record["exchangeDate"]),
                "registeredtime": window.sansanLib.escapeHtml(lookup_record["registeredTime"]),
                "ownerid": window.sansanLib.escapeHtml(lookup_record["owner"]["id"]),
                "ownername": window.sansanLib.escapeHtml(lookup_record["owner"]["name"]),
                "username": window.sansanLib.escapeHtml(lookup_record["lastName"]) +
                            window.sansanLib.escapeHtml(lookup_record["firstName"]),
                "usernamereading": window.sansanLib.escapeHtml(lookup_record["lastNameReading"]) +
                                window.sansanLib.escapeHtml(lookup_record["firstNameReading"]),
                "departmentname": window.sansanLib.escapeHtml(lookup_record["departmentName"]),
                "title": window.sansanLib.escapeHtml(lookup_record["title"]),
                "email": window.sansanLib.escapeHtml(lookup_record["email"]),
                "mobile": window.sansanLib.escapeHtml(lookup_record["mobile"]),
                "companyname": window.sansanLib.escapeHtml(lookup_record["companyName"]),
                "postalcode": window.sansanLib.escapeHtml(lookup_record["postalCode"]),
                "address": window.sansanLib.escapeHtml(lookup_record["address"]),
                "tel": window.sansanLib.escapeHtml(lookup_record["tel"]),
                "secondtel": window.sansanLib.escapeHtml(lookup_record["secondTel"]),
                "fax": window.sansanLib.escapeHtml(lookup_record["fax"]),
                "url": window.sansanLib.escapeHtml(lookup_record["url"]),
                "memo": window.sansanLib.escapeHtml(lookup_record["memo"])
            };
        },

        copyFieldParams: function(params) {

            var record = kintone.app.record.get();
            for (var key in params) {
                if (!params.hasOwnProperty(key)) { continue; }
                if (C_COPYFIELDS[key] !== 'null') {
                    record['record'][C_COPYFIELDS[key]]['value'] = params[key];
                }
            }
            kintone.app.record.set(record);
            var getdata_msg = '<div id="sansan_lookup_validator" class="validator-valid-custom">' +
                                '参照先からデータが取得されました。</div>';
            this.lookUpMessage($(getdata_msg));
            $("#sansan-lookup-dialog").dialog('close');
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
        showDateDialog: function(date_list) {

            //ダイアログの初期設定
            var dates = [];
            var date_type = "";
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-date-dialog');
            $date_dialog.html(date_list);
            $date_dialog.dialog({
                "title": '検索期間設定',
                "autoOpen": false,
                "width": 600,
                "maxHeight": 700,
                "show": 400,
                "hide": 400,
                "modal": true,
                "buttons": {
                    "キャンセル": function() {
                        $(this).dialog('close');
                        $(this).remove();
                    }
                }
            });
            $(function() {
                $('#start_date').datepicker({"dateFormat": "yy/mm/dd", "changeMonth": "true", "changeYear": "true" });
                $('#end_date').datepicker({"dateFormat": "yy/mm/dd", "changeMonth": "true", "changeYear": "true" });
            });
            $('#sansan-date-dialog').dialog('open');
            $('.sansan-date-select').click(function() {
                dates[0] = moment(new Date(window.sansanLib.escapeHtml($("#start_date").val()))).format();
                dates[1] = moment(new Date(window.sansanLib.escapeHtml($("#end_date").val()))).format();
                date_type = $("input[name='sansan-date-radio']:checked").val();
                if (Sansanlookup.checkDateValue(dates)) {
                    Sansanlookup.doSearch(date_type, dates);
                    $('#sansan-date-dialog').dialog('close');
                    $('#sansan-date-dialog').remove();
                }
            });
        },

        //メッセージ表示処理
        lookUpMessage: function($msg) {
            $("#lookup_input_area").append($msg);
        }
    };

    // [追加画面/編集画面]表示イベント
    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {
        var $lookup = $(kintone.app.record.getSpaceElement(C_SPACEFIELD));
        $lookup.append($(window.sansanLib.lookupHtml));

        $("#lookup_search_button").click(function() {
            var record = kintone.app.record.get();
            Sansanlookup.doSearch("Lookup_Condition", record['record'][C_KEYFIELD]['value']);
        });
        $("#lookup_clear_button").click(function() {
            Sansanlookup.doClear();
        });
        $("#lookup_date_button").click(function() {
            Sansanlookup.init();
            var dateview_html = window.sansanLib.createDateViewHTML();
            Sansanlookup.showDateDialog(dateview_html);
        });
        return;
    });
})(jQuery, kintone.$PLUGIN_ID);
