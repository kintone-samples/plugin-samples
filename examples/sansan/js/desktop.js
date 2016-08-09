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

    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }
    var C_LOOKUP_FLG = CONFIG['sansan_lookup_flg'];             //ルックアップ機能ON/OFF
    var C_POSTRECORDS_FLG = CONFIG['sansan_postrecords_flg'];   //レコード一括登録機能ON/OFF
    var C_SPACEFIELD = CONFIG['spacefield'];                    //ボタンを配置するスペースフィールド
    var C_KEYFIELD = CONFIG['keyfield'];                        //kintoneでキーとするフィールド
    var C_ORIGINALFIELD = CONFIG['originalfield'];              //コピー元のSansanフィールド
    var C_COPYFIELD = {
        owner: CONFIG['copy_owner'],                            //名刺所有者名 → owner
        companyname: CONFIG['copy_companyname'],                //会社名 → companyName
        userid: CONFIG['copy_userid'],                          //人物ID → presonId
        username: CONFIG['copy_username'],                      //氏名 → lastName + firstName
        departmentname: CONFIG['copy_departmentname'],          //部署名 → departmentName
        title: CONFIG['copy_title'],                            //役職 → title
        address: CONFIG['copy_address'],                        //住所 → prefecture + city + street + building
        email: CONFIG['copy_email'],                            //E-mail → email
        tel: CONFIG['copy_tel'],                                //Tel → tel
        mobile: CONFIG['copy_mobile'],                          //携帯 → mobile
        url: CONFIG['copy_url']                                 //URL → url
    };

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
        doSearch: function(dates) {
            window.sansanLib.Spin.showSpinner();
            this.init();
            this.getLookupList(dates);
        },
        doClear: function() {
            this.init();
            var record = kintone.app.record.get();
            for (var key in C_COPYFIELD) {
                if (C_COPYFIELD[key] !== 'null') {
                    record['record'][C_COPYFIELD[key]]['value'] = "";
                }
            }
            kintone.app.record.set(record);
        },

        detaillookupHtml:
            '<div class="lookup-buttons" id="lookup_input_area">' +
            '<button id="lookup_search_button" type="button">取得</button>' +
            '<button id="lookup_clear_button" type="button">クリア</button>' +
            '<button id="lookup_setting_button" type="button">期間</button>' +
            '</div>',
        getLookupList: function(dates) {

            Sansanlookup.searchSansanData(dates).then(function(sansan_data) {
                //Email値の重複チェック
                var sansan_records = window.sansanLib.clearOverlappedRecords(sansan_data);

                //Sansan取得データ数(0~5000件)チェック
                if (sansan_records.length === 0) {
                    var nodata_msg = '<div id="sansan_lookup_validator_error" class="input-error-custom">' +
                    '<span>データがありません。</span></div>';
                    Sansanlookup.lookUpMessage($(nodata_msg));
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_records.length === 1) {
                    //ルックアップ表示せずに取得
                    window.sansanLib.changeRecordsFormat(sansan_records);
                    window.sansanLib.Spin.hideSpinner();
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
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else {
                    //2~4999件の場合ルックアップ画面表示
                    window.sansanLib.changeRecordsFormat(sansan_records);
                    Sansanlookup.showLookupDialog(Sansanlookup.createLookupListView(sansan_records));
                }
            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                swal('Error!', 'Sansanデータの取得に失敗しました。\n' + error.message, 'error');
                return false;
            });
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
                if (JSON.parse(body[0]).hasMore === true) {
                    return Sansanlookup.searchSansanData(dates, offset + 100, allrecords);
                }
                return allrecords;
            }, function(error) {
                return Promise.reject(new Error(error.message));
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
                window.sansanLib.escapeHtml(sansan_record['companyName']) + '</span></div>' +
                //選択ボタンクリック時の取得値
                '<input class="sansan_lookup_owner" value="' +
                window.sansanLib.escapeHtml(sansan_record['owner']['name']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_companyname" value="' +
                window.sansanLib.escapeHtml(sansan_record['companyName']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_userid" value="' +
                window.sansanLib.escapeHtml(sansan_record["personId"]) + '" type="hidden">' +
                '<input class="sansan_lookup_username" value="' +
                window.sansanLib.escapeHtml(sansan_record["lastName"] + " " + sansan_record["firstName"]) +
                '" type="hidden">' +
                '<input class="sansan_lookup_departmentname" value="' +
                window.sansanLib.escapeHtml(sansan_record['departmentName']) + '" type="hidden">' +
                '<input class="sansan_lookup_title" value="' +
                window.sansanLib.escapeHtml(sansan_record['title']) + '" type="hidden">' +
                '<input class="sansan_lookup_address" value="' +
                window.sansanLib.escapeHtml(sansan_record["prefecture"] + sansan_record["city"] +
                            sansan_record["street"] + sansan_record["building"]) + '" type="hidden">' +
                '<input class="sansan_lookup_email" value="' + window.sansanLib.escapeHtml(sansan_record['email']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_tel" value="' + window.sansanLib.escapeHtml(sansan_record['tel']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_mobile" value="' + window.sansanLib.escapeHtml(sansan_record['mobile']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_url" value="' + window.sansanLib.escapeHtml(sansan_record['url']) +
                '" type="hidden">' + '</td>' +
                //3列目：氏名
                '<td>' + '<div class="line-cell-kintone"><span>' +
                window.sansanLib.escapeHtml(sansan_record['lastName'] + " " + sansan_record['firstName']) +
                '</span></div>' + '</td>' +
                //4列目：E-mail
                '<td>' + '<div class="line-cell-kintone"><span>' + window.sansanLib.escapeHtml(sansan_record['email']) +
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
        showLookupDialog: function(lookup_list) {
            window.sansanLib.Spin.hideSpinner();
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
                    キャンセル: function() {
                        $(this).dialog('close');
                    }
                }
            });
            $('#sansan-lookup-dialog').dialog('open');
            $(".sansan-lookup-select").click(function() {
                Sansanlookup.copyFieldParams(Sansanlookup.getElementParams($(this).parents(".sansan-lookup-tr")));
            });
        },

        //Sansanより取得したデータをフィールドへコピーする処理
        getRecordParams: function(lookup_record) {
            return {
                owner: lookup_record["owner"]["name"],
                companyname: lookup_record["companyName"],
                userid: lookup_record["personId"],
                username: lookup_record["lastName"] + lookup_record["firstName"],
                departmentname: lookup_record["departmentName"],
                title: lookup_record["title"],
                address: lookup_record["prefecture"] + lookup_record["city"] +
                        lookup_record["street"] + lookup_record["building"],
                email: lookup_record["email"],
                tel: lookup_record["tel"],
                mobile: lookup_record["mobile"],
                url: lookup_record["url"]
            };
        },
        getElementParams: function(el) {
            return {
                owner: el.find(".sansan_lookup_owner").val(),
                companyname: el.find(".sansan_lookup_companyname").val(),
                userid: el.find(".sansan_lookup_userid").val(),
                username: el.find(".sansan_lookup_username").val(),
                departmentname: el.find(".sansan_lookup_departmentname").val(),
                title: el.find(".sansan_lookup_title").val(),
                address: el.find(".sansan_lookup_address").val(),
                email: el.find(".sansan_lookup_email").val(),
                tel: el.find(".sansan_lookup_tel").val(),
                mobile: el.find(".sansan_lookup_mobile").val(),
                url: el.find(".sansan_lookup_url").val()
            };
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

            for (var key in params) {
                if (C_COPYFIELD[key] !== 'null') {
                    record['record'][C_COPYFIELD[key]]['value'] = params[key];
                }
            }

            kintone.app.record.set(record);
            var getdata_msg = '<div id="sansan_lookup_validator" class="validator-valid-custom">' +
                                '参照先からデータが取得されました。</div>';
            this.lookUpMessage($(getdata_msg));
            $("#sansan-lookup-dialog").dialog('close');
        },

        //期間指定処理
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
                    キャンセル: function() {
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
                dates[0] = moment(new Date(window.sansanLib.escapeHtml($("#start_date").val()))).format();
                dates[1] = moment(new Date(window.sansanLib.escapeHtml($("#end_date").val()))).format();
                if (Sansanlookup.checkDateValue(dates)) {
                    Sansanlookup.doSearch(dates);
                }
                $('#sansan-date-dialog').dialog('close');
                $('#sansan-date-dialog').remove();
            });
        },

        //メッセージ表示処理
        lookUpMessage: function($msg) {
            $("#lookup_input_area").append($msg);
        }
    };

    // [追加画面/編集画面]表示イベント
    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {
        if (C_LOOKUP_FLG !== 'lookup_on') {
            return;
        }
        var $lookup = $(kintone.app.record.getSpaceElement(C_SPACEFIELD));
        $lookup.append($(Sansanlookup.detaillookupHtml));

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
        return;
    });
/*
*------------------------------------------------------------------------------------------
*レコード一覧画面の Sansan レコード一括登録 機能
*------------------------------------------------------------------------------------------
*/
    var SansanPostRecords = {
        init: function() {
            $("#sansan-lookup-dialog").remove();
        },
        doSearch: function(tagId) {
            window.sansanLib.Spin.showSpinner();
            this.init();
            this.getLookupList(tagId);
        },

        indexdropdownHtml:
            '<div class="sansan-dropdown-select">' +
            '<select id="sansan_dropdown_code">' +
            '<option value="">--</option>' +
            '<option value="companyName">会社名</option>' +
            '<option value="name">氏名</option>' +
            '<option value="email">メールアドレス</option>' +
            '<option value="tel">電話番号</option>' +
            '<option value="mobile">携帯番号</option>' +
            '</select>' +
            '</div>',
        indexlookupHtml:
            '<span id="lookup_input_index_area">' +
            '<input type="text" id="sansan_search_textbox">' +
            '<button class="postrecords-buttons" id="lookup_index_search_button" type="button">' +
            '<i class="fa fa-search"></i></button>' +
            '<button class="postrecords-buttons" id="lookup_index_tagsearch_button" type="button">' +
            '<i class="fa fa-tags"></i></button>' +
            '</span>',

        getLookupList: function(tagId) {

            SansanPostRecords.searchSansanData(tagId).then(function(sansan_data) {
                //Email値の重複チェック
                var sansan_records = window.sansanLib.clearOverlappedRecords(sansan_data);

                //Sansan取得データ数(0~5000件)チェック
                if (sansan_records.length === 0) {
                    var nodata_msg = '検索条件に一致する名刺データが見つかりませんでした。\n検索条件を変更してください。';
                    SansanPostRecords.postrecordsMessage(nodata_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_records.length > 0 && sansan_records.length < 5000) {
                    //1~4999件の場合ルックアップ画面表示
                    window.sansanLib.changeRecordsFormat(sansan_records);
                    SansanPostRecords.showLookupDialog(SansanPostRecords.createLookupListView(sansan_records));

                } else if (sansan_records.length >= 5000) {
                    //5000件以上の場合エラー
                    var find_msg = '5000件以上のレコードがヒットしました\n検索条件で絞り込んでください';
                    SansanPostRecords.postrecordsMessage(find_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;
                }
            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                swal('Error!', 'Sansanデータの取得に失敗しました。\n' + error.message, 'error');
                return false;
            });
        },
        searchSansanData: function(tagId, opt_offset, opt_records) {
            //Sansanよりデータ取得
            var offset = opt_offset || 0;
            var value = window.sansanLib.escapeHtml($('#sansan_search_textbox').val());
            var allrecords = opt_records || [];
            var url = "https://api.sansan.com/v1/bizCards";

            url += "/search" + "?range=all";
            if (value !== "" && $('#sansan_dropdown_code').val() !== "") {
                url += "&" + $('#sansan_dropdown_code').val() + "=" + encodeURIComponent(value);
            }
            if (tagId) {
                url += "&tagId=" + tagId;
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
                if (JSON.parse(body[0]).hasMore === true) {
                    return SansanPostRecords.searchSansanData(tagId, offset + 100, allrecords);
                }
                if (JSON.parse(body[0]).hasMore === false && allrecords[0] === null || allrecords.length === 0) {
                    return Promise.reject(new Error('検索条件に一致する名刺データが見つかりませんでした。\n検索条件を変更してください。'));
                }
                return allrecords;
            }, function(error) {
                return Promise.reject(new Error(error.message));
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
                //1列目：チェックボックスボタン
                '<td class="lookup-cell-kintone">' +
                '<span><input class="button-simple-custom sansan-lookup-select" type="checkbox" />' +
                '</span></td>' +
                //2列目：会社名
                '<td>' + '<div class="line-cell-kintone"><span>' +
                window.sansanLib.escapeHtml(sansan_record['companyName']) + '</span></div>' +
                //選択ボタンクリック時の取得値
                '<input class="sansan_lookup_owner" value="' +
                window.sansanLib.escapeHtml(sansan_record['owner']['name']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_companyname" value="' +
                window.sansanLib.escapeHtml(sansan_record['companyName']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_userid" value="' +
                window.sansanLib.escapeHtml(sansan_record["personId"]) + '" type="hidden">' +
                '<input class="sansan_lookup_username" value="' +
                window.sansanLib.escapeHtml(sansan_record["lastName"] + " " + sansan_record["firstName"]) +
                '" type="hidden">' +
                '<input class="sansan_lookup_departmentname" value="' +
                window.sansanLib.escapeHtml(sansan_record['departmentName']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_title" value="' +
                window.sansanLib.escapeHtml(sansan_record['title']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_address" value="' +
                window.sansanLib.escapeHtml(sansan_record["prefecture"] + sansan_record["city"] +
                            sansan_record["street"] + sansan_record["building"]) + '" type="hidden">' +
                '<input class="sansan_lookup_email" value="' + window.sansanLib.escapeHtml(sansan_record['email']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_tel" value="' + window.sansanLib.escapeHtml(sansan_record['tel']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_mobile" value="' + window.sansanLib.escapeHtml(sansan_record['mobile']) +
                '" type="hidden">' +
                '<input class="sansan_lookup_url" value="' + window.sansanLib.escapeHtml(sansan_record['url']) +
                '" type="hidden">' + '</td>' +
                //3列目：氏名
                '<td>' + '<div class="line-cell-kintone"><span>' +
                window.sansanLib.escapeHtml(sansan_record['lastName'] + " " + sansan_record['firstName']) +
                '</span></div>' + '</td>' +
                //4列目：E-mail
                '<td>' + '<div class="line-cell-kintone"><span>' + window.sansanLib.escapeHtml(sansan_record['email']) +
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
        showLookupDialog: function(lookup_list) {
            window.sansanLib.Spin.hideSpinner();
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
                    登録: function() {
                        SansanPostRecords.copyFieldParams();
                    },
                    キャンセル: function() {
                        $(this).dialog('close');
                    }
                }
            });
            $('#sansan-lookup-dialog').dialog('open');
        },

        //Sansanより取得したデータをフィールドへコピーする処理
        getElementParams: function(el) {
            return {
                owner: el.find(".sansan_lookup_owner").val(),
                companyname: el.find(".sansan_lookup_companyname").val(),
                userid: el.find(".sansan_lookup_userid").val(),
                username: el.find(".sansan_lookup_username").val(),
                departmentname: el.find(".sansan_lookup_departmentname").val(),
                title: el.find(".sansan_lookup_title").val(),
                address: el.find(".sansan_lookup_address").val(),
                email: el.find(".sansan_lookup_email").val(),
                tel: el.find(".sansan_lookup_tel").val(),
                mobile: el.find(".sansan_lookup_mobile").val(),
                url: el.find(".sansan_lookup_url").val()
            };
        },
        copyFieldParams: function() {
            var records = [];
            $('.sansan-lookup-select:checked').each(function(i, el) {
                var params = SansanPostRecords.getElementParams($(el).parents(".sansan-lookup-tr"));

                var checkEmptyString = function(str) {
                    if (str && str !== "" && str !== "null") {
                        return str;
                    }
                    return "";
                };

                var copyvalue = [];
                var record = {};
                copyvalue.push(checkEmptyString(params.owner));
                copyvalue.push(checkEmptyString(params.companyname));
                copyvalue.push(checkEmptyString(params.username));
                copyvalue.push(checkEmptyString(params.departmentname));
                copyvalue.push(checkEmptyString(params.title));
                copyvalue.push(checkEmptyString(params.address));
                copyvalue.push(checkEmptyString(params.email));
                copyvalue.push(checkEmptyString(params.tel));
                copyvalue.push(checkEmptyString(params.mobile));

                for (var key in params) {
                    if (C_COPYFIELD[key] !== 'null') {
                        record[C_COPYFIELD[key]] = {"value": params[key]};
                    }
                }
                records.push(record);
            });

            if (records.length === 0) {
                swal(
                {
                    title: 'Error!',
                    text: '登録対象のレコードにチェックを入れてください。',
                    type: 'error'
                }, function() {
                    return false;
                });
            } else if (records.length > 100) {
                swal(
                {
                    title: 'Error!',
                    text: '登録対象のレコード件数が100件を超えています。',
                    type: 'error'
                }, function() {
                    return false;
                });
            } else {
                // Sansan データ登録
                kintone.api('/k/v1/records', 'POST', {app: kintone.app.getId(), records: records}).then(function(resp) {
                    swal(
                    {
                        title: 'Success',
                        text: resp.ids.length + '件のレコードの登録が完了しました。画面をリロードします。',
                        type: 'success'
                    }, function() {
                        location.reload(true);
                    });
                }, function(error) {
                    console.log(JSON.stringify(error, null, "  "));
                    swal('Error!', 'Sansanデータのレコード登録時にエラーが発生しました。\nエラーの詳細内容はコンソールログを確認してください。', 'error');
                });
            }
            $('#sansan-lookup-dialog').dialog('close');
        },

        //タグ検索処理
        getSansanTag: function(opt_offset, opt_tags) {
            //Sansanよりタグデータ取得
            var offset = opt_offset || 0;
            var alltags = opt_tags || [];
            var url = 'https://api.sansan.com/v1/tags?range=all' + '&type=shared';//共有タグのみを取得
            url += '&offset=' + offset;
            return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(body) {
                alltags = alltags.concat(JSON.parse(body[0]).data);
                if (JSON.parse(body[1]) !== 200) {
                    var error_message = JSON.parse(body[0]).error[0].code;
                    if (JSON.parse(body[1]) === 429) {
                        error_message = 'リクエスト数が制限値を超えています。\n5分以上時間を置いてから再度取得してください。';
                    }
                    return Promise.reject(new Error(error_message));
                }
                //5000件以上は処理終了
                if (alltags.length >= 5000) {
                    return alltags;
                }
                if (JSON.parse(body[0]).hasMore === true) {
                    return SansanPostRecords.getSansanTag(offset + 100, alltags);
                }
                return alltags;
            }, function(error) {
                return Promise.reject(new Error(error.message));
            });
        },
        getLookupTagList: function() {
            window.sansanLib.Spin.showSpinner();
            SansanPostRecords.getSansanTag().then(function(sansan_tags) {
                //Sansan取得データ数(0~5000件)チェック
                if (sansan_tags.length === 0) {
                    var nodata_msg = 'データがありません。';
                    SansanPostRecords.postrecordsMessage(nodata_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_tags.length > 0 && sansan_tags.length < 5000) {
                    //1~4999件の場合ルックアップ画面表示
                    SansanPostRecords.showLookupTagDialog(SansanPostRecords.createLookupTagListView(sansan_tags));

                } else if (sansan_tags.length >= 5000) {
                    //5000件以上の場合エラー
                    var find_msg = '5000件以上のタグがヒットしました\n管理者にお問い合わせください';
                    SansanPostRecords.postrecordsMessage(find_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;
                }
            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                swal('Error!', 'Sansanデータの取得に失敗しました。\n' + error.message, 'error');
                return false;
            });
        },
        createLookupTagListView: function(sansan_tags) {
            var result;
            var taglist = "";
            var count = 0;
            //タグ名を昇順に並び替え
            sansan_tags.sort(function(val1, val2) {
                if (val1.name < val2.name) {
                    return -1;
                }
                return 1;
            });
            //Sansan検索結果のリストを作成
            for (var i = 0; sansan_tags.length > i; i++) {
                var sansan_tag = sansan_tags[i];
                taglist += '<tr id="lookuplist_' + i + '" class="sansan-lookup-tr">' +
                //1列目：選択ボタン
                '<td class="lookup-cell-kintone">' +
                '<span><button class="button-simple-custom sansan-lookup-select" type="button">' +
                '選択</button></span>' + '</td>' +
                //2列目：タグ
                '<td>' + '<div class="line-cell-kintone"><span>' +
                window.sansanLib.escapeHtml(sansan_tag['name']) + '</span></div>' +
                //選択ボタンクリック時の取得値
                '<input class="sansan_lookup_tagid" value="' +
                window.sansanLib.escapeHtml(sansan_tag['id']) +
                '" type="hidden">' + '</td>' + '</tr>';
                count++;
            }
            result =
            '<table class="listTable-kintone lookup-table-kintone">' +
            '<thead class="lookup-thead-gaia">' + '<tr>' +
            //1列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">' + count + '件' + '</span></div>' + '</th>' +
            //2列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">タグ名</span></div>' + '</th>' +
            '</tr>' + '</thead>' + '<tbody>' + taglist + '</tbody>' + '</table>';

            return result;
        },
        showLookupTagDialog: function(tag_list) {
            window.sansanLib.Spin.hideSpinner();
            //ダイアログの初期設定
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-tag-dialog');
            $date_dialog.html(tag_list);
            $date_dialog.dialog({
                title: 'タグ選択',
                autoOpen: false,
                width: 900,
                maxHeight: 700,
                show: 400,
                hide: 400,
                modal: true,
                buttons: {
                    キャンセル: function() {
                        $(this).dialog('close');
                        $(this).remove();
                    }
                }
            });
            $('#sansan-tag-dialog').dialog('open');
            $(".sansan-lookup-select").click(function() {
                var tagId = $(this).parents(".sansan-lookup-tr").find(".sansan_lookup_tagid").val();
                SansanPostRecords.doSearch(tagId);
                $('#sansan-tag-dialog').dialog('close');
                $('#sansan-tag-dialog').remove();
            });
        },
        //メッセージ表示処理
        postrecordsMessage: function(msg) {
            swal('Error!', 'Sansanデータの取得に失敗しました。\n' + msg, 'error');
        }
    };

    // [一覧画面]表示イベント
    kintone.events.on('app.record.index.show', function(event) {
        if (C_POSTRECORDS_FLG !== 'postrecords_on') {
            return;
        }
        if ($('#sansan_search_textbox')[0]) {
            return;
        }
        var $el = $(kintone.app.getHeaderMenuSpaceElement());
        $el.append($(SansanPostRecords.indexdropdownHtml));
        $el.append($(SansanPostRecords.indexlookupHtml));

        $("#lookup_index_search_button").click(function() {
            SansanPostRecords.doSearch();
        });
        $("#lookup_index_tagsearch_button").click(function() {
            SansanPostRecords.getLookupTagList();
        });
        return;
    });
})(jQuery, kintone.$PLUGIN_ID);
