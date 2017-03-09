/*
 * Sansan plug-in PostRecords
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
    var C_POSTRECORDS_FLG = CONFIG['sansan_postrecords_flg'];   //レコード一括登録機能ON/OFF
    var C_UPSERTRECORDS_FLG = CONFIG['sansan_upsertrecords_flg'];//レコード一括登録時のUpsert機能ON/OFF
    if (C_POSTRECORDS_FLG !== 'postrecords_on') {
        return false;
    }

    var C_UPSERTKEYFIELD = CONFIG['upsertkeyfield'];            //Upsertキーとなるフィールド
    var C_COPYFIELDS = window.sansanLib.getConfigValues(CONFIG); //Sansanからコピーするフィールド

/*
*------------------------------------------------------------------------------------------
*レコード一覧画面の Sansan レコード一括登録 機能
*------------------------------------------------------------------------------------------
*/
    var SansanPostRecords = {

        init: function() {
            $('#sansan-lookup-dialog').remove();
        },
        doSearch: function(type, value) {
            window.sansanLib.Spin.showSpinner();
            this.init();
            this.getPostRecordsList(type, value);
        },

        getPostRecordsList: function(type, value) {

            SansanPostRecords.searchSansanData(type, value).then(function(sansan_data) {

                var msg = "";
                //Emailの重複チェック
                var sansan_records = window.sansanLib.deleteOverlappedRecords(sansan_data, 'email');

                //人物IDの重複チェック
                if (C_UPSERTRECORDS_FLG === "upsertrecords_on" && C_UPSERTKEYFIELD) {
                    sansan_records = window.sansanLib.deleteOverlappedRecords(sansan_records, 'personId');
                }

                //Sansan取得データ数チェック
                if (sansan_records.length === 0) {
                    msg = '検索条件に一致する名刺データが見つかりませんでした。\n検索条件を変更してください。';
                    SansanPostRecords.postRecordsMessage('search_error', msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_records.length >= 5000) {
                    //5000件以上の場合エラー
                    msg = '5000件以上のレコードがヒットしました\n検索条件で絞り込んでください';
                    SansanPostRecords.postRecordsMessage('search_error', msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;
                }

                //1~4999件の場合ルックアップ画面表示
                window.sansanLib.checkNullParams(sansan_records);
                var listview_html = window.sansanLib.createListViewHTML("Postrecords", sansan_records);
                SansanPostRecords.showPostRecordsDialog(listview_html);

            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                SansanPostRecords.postRecordsMessage('search_error', error.message);
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
                    return SansanPostRecords.searchSansanData(type, value, offset + limit, allrecords);
                }
                if (JSON.parse(body[0]).hasMore === false && allrecords[0] === null || allrecords.length === 0) {
                    return kintone.Promise.reject(new Error('検索条件に一致する名刺データが見つかりませんでした。\n検索条件を変更してください。'));
                }
                return allrecords;
            }, function(error) {
                return kintone.Promise.reject(new Error(error));
            });
        },
        showPostRecordsDialog: function(lookup_list) {
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
                    "登録": function() {
                        window.sansanLib.Spin.showSpinner();
                        SansanPostRecords.postCheckedRecords();
                    },
                    "キャンセル": function() {
                        $(this).dialog('close');
                    }
                }
            });
            $("#sansan-all-check").on('change', function() {
                $('input[type=checkbox]').prop('checked', this.checked);
            });
            $('#sansan-lookup-dialog').dialog('open');
        },

        postCheckedRecords: function() {
            var records = SansanPostRecords.getCheckedElementsParams();
            if (records.length === 0) {
                window.sansanLib.Spin.hideSpinner();
                SansanPostRecords.postRecordsMessage('post_error', '登録対象のレコードにチェックを入れてください。');
                return false;

            } else if (records.length > 1000) {
                window.sansanLib.Spin.hideSpinner();
                SansanPostRecords.postRecordsMessage('post_error', '登録対象のレコード件数が1000件を超えています。');
                return false;
            }

            if (C_UPSERTRECORDS_FLG === 'upsertrecords_on') {
                SansanPostRecords.upsertRecords(kintone.app.getId(), records).then(
                    SansanPostRecords.upsertRecordsResp, function(error) {
                        window.sansanLib.Spin.hideSpinner();
                        console.log(JSON.stringify(error));
                        SansanPostRecords.postRecordsMessage('post_error', 'エラーの詳細内容はコンソールログを確認してください。');
                        return false;
                    });
            } else if (C_UPSERTRECORDS_FLG !== 'upsertrecords_on') {
                SansanPostRecords.postRecords(kintone.app.getId(), records).then(
                    SansanPostRecords.postRecordsResp, function(error) {
                        window.sansanLib.Spin.hideSpinner();
                        console.log(JSON.stringify(error));
                        SansanPostRecords.postRecordsMessage('upsert_error', 'エラーの詳細内容はコンソールログを確認してください。');
                        return false;
                    });
            }
        },
        getCheckedElementsParams: function() {
            var records = [];
            $('.sansan-lookup-select:checked').each(function() {
                var params = window.sansanLib.getElementParams($(this).parents(".sansan-lookup-tr"));
                var param = {};
                if (C_UPSERTRECORDS_FLG === 'upsertrecords_on') {
                    param = {"updateKey": {}, "record": {}};
                    param.updateKey = {
                        "field": C_UPSERTKEYFIELD,
                        "value": params['userid']
                    };
                    for (var key1 in params) {
                        if (!params.hasOwnProperty(key1)) { continue; }
                        if (C_COPYFIELDS[key1] !== 'null' && key1 !== 'userid') {
                            param.record[C_COPYFIELDS[key1]] = {"value": params[key1]};
                        }
                    }
                } else {
                    for (var key2 in params) {
                        if (!params.hasOwnProperty(key2)) { continue; }
                        if (C_COPYFIELDS[key2] !== 'null') {
                            param[C_COPYFIELDS[key2]] = {"value": params[key2]};
                        }
                    }
                }
                records.push(param);
            });
            return records;
        },
        //一括登録
        postRecords: function(appId, allRecords, opt_offset, opt_limit, opt_ids) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var response_ids = opt_ids || [];
            var params = {
                "app": appId,
                "records": allRecords.slice(offset, offset + limit)
            };
            return kintone.api('/k/v1/records', 'POST', params).then(function(resp) {
                response_ids = response_ids.concat(resp.ids);
                if (allRecords.slice(offset, offset + limit).length === limit) {
                    return SansanPostRecords.postRecords(appId, allRecords, offset + limit, limit, response_ids);
                }
                return response_ids;
            }, function(error) {
                return kintone.Promise.reject(error.message);
            });
        },
        //一括登録成功時のレスポンス
        postRecordsResp: function(ids) {
            window.sansanLib.Spin.hideSpinner();
            $('#sansan-lookup-dialog').dialog('close');
            var msg = ids.length + '件のレコードの登録が完了しました。画面をリロードします。';
            SansanPostRecords.postRecordsMessage('post_success', msg);
        },
        //一括登録時のUpsert処理
        upsertRecords: function(appId, allRecords) {
            var params = {
                "app": appId,
                "records": allRecords,
                "isGuest": false
            };
            return kintoneUtility.rest.upsertRecords(params).then(function(resp) {
                resp.results.postcount = 0;
                resp.results.putcount = 0;
                for (var r = 0; r < resp.results.length; r++) {
                    if (resp.results[r].hasOwnProperty("ids")) {
                        resp.results.postcount = resp.results.postcount + resp.results[r].ids.length;
                    }
                    if (resp.results[r].hasOwnProperty("records")) {
                        resp.results.putcount = resp.results.putcount + resp.results[r].records.length;
                    }
                }
                return resp.results;
            }, function(error) {
                return kintone.Promise.reject(error);
            });
        },
        //一括登録時のUpsert処理成功時のレスポンス
        upsertRecordsResp: function(resp) {
            window.sansanLib.Spin.hideSpinner();
            $('#sansan-lookup-dialog').dialog('close');
            var msg = resp.postcount + '件のレコードの登録が完了しました。\n' +
                        resp.putcount + '件のレコードの更新が完了しました。\n' +
                        '画面をリロードします。';
            SansanPostRecords.postRecordsMessage('post_success', msg);
        },
        //タグ検索処理
        getSansanTag: function(opt_offset, opt_tags) {
            //Sansanよりタグデータ取得
            var limit = 300;
            var offset = opt_offset || 0;
            var alltags = opt_tags || [];
            var url = 'https://api.sansan.com/v1.1/tags?range=all' + '&type=shared';//共有タグのみを取得
            url += '&offset=' + offset;
            url += "&limit=" + limit;
            return kintone.plugin.app.proxy(PLUGIN_ID, url, 'GET', {}, {}).then(function(body) {
                alltags = alltags.concat(JSON.parse(body[0]).data);
                if (JSON.parse(body[1]) !== 200) {
                    var error_message = JSON.parse(body[0]).error[0].code;
                    if (JSON.parse(body[1]) === 429) {
                        error_message = 'リクエスト数が制限値を超えています。\n5分以上時間を置いてから再度取得してください。';
                    }
                    return kintone.Promise.reject(new Error(error_message));
                }
                //3000件以上は処理終了
                if (alltags.length >= 3000) {
                    return alltags;
                }
                if (JSON.parse(body[0]).hasMore === true) {
                    return SansanPostRecords.getSansanTag(offset + limit, alltags);
                }
                return alltags;
            }, function(error) {
                return kintone.Promise.reject(new Error(error.message));
            });
        },
        getTagList: function() {
            window.sansanLib.Spin.showSpinner();
            SansanPostRecords.getSansanTag().then(function(sansan_tags) {
                //Sansan取得データ数(0~3000件)チェック
                if (sansan_tags.length === 0) {
                    var nodata_msg = 'データがありません。';
                    SansanPostRecords.postRecordsMessage('search_error', nodata_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;

                } else if (sansan_tags.length >= 3000) {
                    //3000件以上の場合エラー
                    var find_msg = '3000件以上のタグがヒットしました\n管理者にお問い合わせください';
                    SansanPostRecords.postRecordsMessage('search_error', find_msg);
                    window.sansanLib.Spin.hideSpinner();
                    return false;
                }
                SansanPostRecords.showTagListDialog(SansanPostRecords.createTagListView(sansan_tags));
            }).catch(function(error) {
                window.sansanLib.Spin.hideSpinner();
                SansanPostRecords.postRecordsMessage('search_error', error.message);
                return false;
            });
        },
        createTagListView: function(sansan_tags) {
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
        showTagListDialog: function(tag_list) {
            window.sansanLib.Spin.hideSpinner();
            //ダイアログの初期設定
            var $date_dialog = $('<div>');
            $date_dialog.attr('id', 'sansan-tag-dialog');
            $date_dialog.html(tag_list);
            $date_dialog.dialog({
                "title": 'タグ選択',
                "autoOpen": false,
                "width": 900,
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
            $(".sansan-lookup-select").click(function() {
                var tagId = $(this).parents(".sansan-lookup-tr").find(".sansan_lookup_tagid").val();
                SansanPostRecords.doSearch("Tag", tagId);
                $('#sansan-tag-dialog').dialog('close');
                $('#sansan-tag-dialog').remove();
            });
            $('#sansan-tag-dialog').dialog('open');
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
                $('#start_date').datepicker({"dateFormat": "yy/mm/dd", "changeMonth": "true", changeYear: "true" });
                $('#end_date').datepicker({"dateFormat": "yy/mm/dd", "changeMonth": "true", changeYear: "true" });
            });
            $('#sansan-date-dialog').dialog('open');
            $('.sansan-date-select').click(function() {
                dates[0] = moment(new Date(window.sansanLib.escapeHtml($("#start_date").val()))).format();
                dates[1] = moment(new Date(window.sansanLib.escapeHtml($("#end_date").val()))).format();
                date_type = $("input[name='sansan-date-radio']:checked").val();
                if (SansanPostRecords.checkDateValue(dates)) {
                    SansanPostRecords.doSearch(date_type, dates);
                    $('#sansan-date-dialog').dialog('close');
                    $('#sansan-date-dialog').remove();
                }
            });
        },
        checkDateValue: function(dates) {
            var date_msg = "";
            if (dates[0] && dates[1] && dates[0] > dates[1]) {
                date_msg = '開始期間を終了日付より前に設定してください。';
                SansanPostRecords.postRecordsMessage('search_error', date_msg);
                return false;
            }
            if (dates[0] === "Invalid date" || dates[1] === "Invalid date") {
                date_msg = '開始期間及び終了期間を設定してください。';
                SansanPostRecords.postRecordsMessage('search_error', date_msg);
                return false;
            }
            return true;
        },
        //メッセージ表示処理
        postRecordsMessage: function(type, msg) {
            switch (type) {
                case 'search_error':
                    swal('Error!', 'Sansanデータの取得に失敗しました。\n' + msg, 'error');
                    break;

                case 'post_error':
                    swal('Error!', 'Sansanデータの一括登録時にエラーが発生しました。\n' + msg, 'error');
                    break;

                case 'upsert_error':
                    swal('Error!', 'SansanデータのUpsert時にエラーが発生しました。\n' + msg, 'error');
                    break;

                case 'post_success':
                    swal({"title": 'Success', "text": msg, "type": 'success'}, function() {
                        location.reload(true);
                    });
                    break;

                default:
                    swal('Error!', msg, 'error');
                    break;
            }
        }
    };

    // [一覧画面]表示イベント
    kintone.events.on('app.record.index.show', function(event) {
        if ($('#sansan_search_textbox')[0]) {
            return;
        }
        var $el = $(kintone.app.getHeaderMenuSpaceElement());
        $el.append($(window.sansanLib.postRecords_dropdownHtml));
        $el.append($(window.sansanLib.postRecords_buttonsHtml));

        $("#lookup_index_search_button").click(function() {
            var textvalue = window.sansanLib.escapeHtml($('#sansan_search_textbox').val());

            SansanPostRecords.doSearch("Postrecords_Condition", textvalue);
        });
        $("#lookup_index_tagsearch_button").click(function() {
            SansanPostRecords.getTagList();
        });
        $("#lookup_index_datesearch_button").click(function() {
            var dateview_html = window.sansanLib.createDateViewHTML();
            SansanPostRecords.showDateDialog(dateview_html);
        });
        return;
    });
})(jQuery, kintone.$PLUGIN_ID);
