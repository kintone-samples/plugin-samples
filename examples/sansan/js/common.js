/*
 * Sansan plug-in common
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
    var C_ORIGINALFIELD = CONFIG['originalfield'];//コピー元のSansanフィールド

    //エスケープ
    function escapeHtml(htmlstr) {
        //nullチェック
        if (htmlstr === null) {
            return "";
        }
        try {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        } catch (e) {
            return htmlstr;
        }
    }

    //スピナー表示/非表示
    var Spin = {
        spinner: new Spinner({
            "lines": 13,
            "length": 28,
            "width": 14,
            "radius": 42,
            "scale": 1,
            "corners": 1,
            "color": "#FFF",
            "opacity": 0.25,
            "rotate": 0,
            "direction": 1,
            "speed": 1,
            "trail": 60,
            "fps": 20,
            "zIndex": 2e9,
            "className": "spinner",
            "top": "50%",
            "left": "50%",
            "shadow": false,
            "hwaccel": false,
            "position": "fixed"
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

    //設定値からコピー先のフィールドの値を取得
    function getConfigValues(config) {
        return {
            "cardid": config['copy_cardid'],                          //名刺ID → cardId
            "companyid": config['copy_companyid'],                    //会社ID → companyId
            "userid": config['copy_userid'],                          //人物ID → presonId
            "exchangedate": config['copy_exchangedate'],              //名刺交換日 → exchangeDate
            "registeredtime": config['copy_registeredtime'],          //名刺登録日時 → registeredTime
            "ownerid": config['copy_ownerid'],                        //名刺所有者ID → owner.id
            "ownername": config['copy_ownername'],                    //名刺所有者名 → owner.name
            "username": config['copy_username'],                      //氏名 → lastName + firstName
            "usernamereading": config['copy_usernamereading'],        //氏名カナ → lastNameReading + firstNameReading
            "departmentname": config['copy_departmentname'],          //部署名 → departmentName
            "title": config['copy_title'],                            //役職 → title
            "email": config['copy_email'],                            //E-mail → email
            "mobile": config['copy_mobile'],                          //携帯 → mobile
            "companyname": config['copy_companyname'],                //会社名 → companyName
            "postalcode": config['copy_postalcode'],                  //郵便番号 → postalCode
            "address": config['copy_address'],                        //住所 → address
            "tel": config['copy_tel'],                                //Tel → tel
            "secondtel": config['copy_secondtel'],                    //Tel2 → secondtel
            "fax": config['copy_fax'],                                //Fax → fax
            "url": config['copy_url'],                                //URL → url
            "memo": config['copy_memo']                               //メモ → memo
        };
    }

    var postRecords_dropdownHtml =
        '<div class="sansan-dropdown-select">' +
        '<select id="sansan_dropdown_code">' +
        '<option value="">--</option>' +
        '<option value="companyName">会社名</option>' +
        '<option value="name">氏名</option>' +
        '<option value="email">メールアドレス</option>' +
        '<option value="tel">電話番号</option>' +
        '<option value="mobile">携帯番号</option>' +
        '</select>' +
        '</div>';

    var postRecords_buttonsHtml =
        '<span id="lookup_input_index_area">' +
        '<input type="text" id="sansan_search_textbox">' +
        '<button class="postrecords-buttons" id="lookup_index_search_button" type="button">' +
        '<i class="fa fa-search"></i></button>' +
        '<button class="postrecords-buttons" id="lookup_index_tagsearch_button" type="button">' +
        '<i class="fa fa-tags"></i></button>' +
        '<button class="postrecords-buttons" id="lookup_index_datesearch_button" type="button">' +
        '<i class="fa fa-calendar"></i></button>' +
        '</span>';

    var lookupHtml =
        '<div class="lookup-buttons" id="lookup_input_area">' +
        '<button id="lookup_search_button" type="button">取得</button>' +
        '<button id="lookup_clear_button" type="button">クリア</button>' +
        '<button id="lookup_date_button" type="button">期間</button>' +
        '</div>';

    //Sansanから取得したデータのフォーマットを変更
    function checkNullParams(sansan_records) {
        for (var i = 0; sansan_records.length > i; i++) {
            var sansan_record = sansan_records[i];
            //会社名、氏名、Emailが全てnullの場合、リストに含めない。
            if (sansan_record['companyName'] === null && sansan_record['lastName'] === null &&
                sansan_record['firstName'] === null && sansan_record['email'] === null) {
                sansan_records.splice(i, 1);
                i += -1;
            }
        }
        return sansan_records;
    }

    function sortRecords(sansan_records, type, param1, param2) {
        var sort_records = sansan_records;
        switch (type) {
            case 'asc':
                //param1の値で昇順にソート。param1の値が同じ場合、param2の値で昇順にソート
                sort_records.sort(function(a, b) {
                    if (a[param1] < b[param1]) { return -1; }
                    if (a[param1] > b[param1]) { return 1; }
                    if (a[param2] < b[param2]) { return -1; }
                    if (a[param2] > b[param2]) { return 1; }
                    return 0;
                });
                break;

            case 'desc':
                //param1の値で降順にソート。param1の値が同じ場合、param2の値で降順にソート
                sort_records.sort(function(a, b) {
                    if (a[param1] < b[param1]) { return 1; }
                    if (a[param1] > b[param1]) { return -1; }
                    if (a[param2] < b[param2]) { return 1; }
                    if (a[param2] > b[param2]) { return -1; }
                    return 0;
                });
                break;
            default:
                break;
        }
        return sort_records;
    }

    //paramの値が重複したデータで名刺交換日の古いデータ(同じであれば名刺登録日時が古いデータ)を重複削除
    function deleteOverlappedRecords(sansan_records, param) {
        var obj = {};
        var list = [];
        var records = sortRecords(sansan_records, 'asc', 'exchangeDate', 'registeredTime');

        for (var k = 0; k < records.length; k++) {
            var param_value = records[k][param];
            if (param_value !== null) {
                obj[param_value] = records[k];
            } else {
                list.push(records[k]);
            }
        }
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) { continue; }
            list.push(obj[i]);
        }
        list = sortRecords(list, 'desc', 'registeredTime', 'exchangeDate');
        return list;
    }

    //リクエスト用のURL生成
    function createSansanURL(type, value, limit, offset) {
        var sansan_url = "https://api.sansan.com/v1.1/bizCards";
        switch (type) {
            //一括登録機能の条件指定検索の場合
            case "Postrecords_Condition":
                sansan_url += "/search" + "?range=all";
                if (value && $('#sansan_dropdown_code').val()) {
                    sansan_url += "&" + encodeURIComponent($('#sansan_dropdown_code').val()) +
                                    "=" + encodeURIComponent(value);
                }
                break;

            //ルックアップ機能の条件指定検索の場合
            case "Lookup_Condition":
                sansan_url += "/search" + "?range=all";
                if (value) {
                    sansan_url += "&" + encodeURIComponent(C_ORIGINALFIELD) + "=" + encodeURIComponent(value);
                }
                break;

            //タグ指定の場合
            case "Tag":
                sansan_url += "/search" + "?range=all";
                sansan_url += "&tagId=" + encodeURIComponent(value);
                break;

            //名刺登録日の期間指定の場合
            case "Registered_Date":
                sansan_url += "?range=all" + "&registeredFrom" + "=" + encodeURIComponent(value[0]) +
                                             "&registeredTo" + "=" + encodeURIComponent(value[1]);
                break;

            //名刺更新日の期間指定の場合
            case "Updated_Date":
                sansan_url += "?range=all" + "&registeredFrom" + "=" + encodeURIComponent("1900-01-01T00:00:00+09:00") +
                                             "&registeredTo" + "=" + encodeURIComponent("3000-01-01T00:00:00+09:00");
                sansan_url += "&updatedFrom" + "=" + encodeURIComponent(value[0]) +
                              "&updatedTo" + "=" + encodeURIComponent(value[1]);
                break;
            default:
                sansan_url += "/search" + "?range=all";
                break;
        }
        sansan_url += "&limit=" + encodeURIComponent(limit);
        sansan_url += "&offset=" + encodeURIComponent(offset);
        return sansan_url;
    }
    //ダイアログのHTML生成
    function createListViewHTML(type, sansan_records) {
        var result;
        var first_td_html = "";
        var first_th_html = "";
        var companylist = "";
        var count = 0;

        if (type === "Postrecords") {
            //1列目：チェックボックスボタン
            first_td_html = '<td class="lookup-cell-kintone">' +
                            '<span><input class="button-simple-custom sansan-lookup-select" type="checkbox">' +
                            '</span></td>';
        } else if (type === "Lookup") {
            //1列目：選択ボタン
            first_td_html = '<td class="lookup-cell-kintone">' +
                            '<span><button class="button-simple-custom sansan-lookup-select" type="button">' +
                            '選択</button></span></td>';
        }

        //Sansan検索結果のリストを作成
        for (var i = 0; sansan_records.length > i; i++) {
            var sansan_record = sansan_records[i];
            companylist +=
            '<tr id="lookuplist_' + i + '" class="sansan-lookup-tr">' +
            //1列目：ボタン
            first_td_html +
            //2列目：会社名
            '<td>' + '<div class="line-cell-kintone"><span>' +
            escapeHtml(sansan_record['companyName']) + '</span></div>' +

            //3列目：氏名
            '<td>' + '<div class="line-cell-kintone"><span>' +
            escapeHtml(sansan_record['lastName']) + " " + escapeHtml(sansan_record['firstName']) +
            '</span></div>' + '</td>' +
            //4列目：E-mail
            '<td>' + '<div class="line-cell-kintone"><span>' + escapeHtml(sansan_record['email']) +
            '</span></div>' + '</td>' +
            //取得値
            '<input class="sansan_lookup_cardid" value="' + escapeHtml(sansan_record['id']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_companyid" value="' + escapeHtml(sansan_record['companyId']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_userid" value="' + escapeHtml(sansan_record['personId']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_exchangedate" value="' + escapeHtml(sansan_record['exchangeDate']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_registeredtime" value="' + escapeHtml(sansan_record['registeredTime']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_ownerid" value="' + escapeHtml(sansan_record['owner']['id']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_ownername" value="' + escapeHtml(sansan_record['owner']['name']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_username" value="' + escapeHtml(sansan_record["lastName"]) +
            " " + escapeHtml(sansan_record["firstName"]) +
            '" type="hidden">' +
            '<input class="sansan_lookup_usernamereading" value="' + escapeHtml(sansan_record["lastNameReading"]) +
            " " + escapeHtml(sansan_record["firstNameReading"]) +
            '" type="hidden">' +
            '<input class="sansan_lookup_departmentname" value="' + escapeHtml(sansan_record['departmentName']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_title" value="' + escapeHtml(sansan_record['title']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_email" value="' + escapeHtml(sansan_record['email']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_mobile" value="' + escapeHtml(sansan_record['mobile']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_companyname" value="' + escapeHtml(sansan_record['companyName']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_postalcode" value="' + escapeHtml(sansan_record['postalCode']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_address" value="' + escapeHtml(sansan_record["address"]) +
            '" type="hidden">' +
            '<input class="sansan_lookup_tel" value="' + escapeHtml(sansan_record['tel']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_secondtel" value="' + escapeHtml(sansan_record['secondTel']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_fax" value="' + escapeHtml(sansan_record['fax']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_url" value="' + escapeHtml(sansan_record['url']) +
            '" type="hidden">' +
            '<input class="sansan_lookup_memo" value="' + escapeHtml(sansan_record['memo']) +
            '" type="hidden">' + '</td>' +
            '</tr>';

            count++;
        }

        if (type === "Postrecords") {
            //全件チェックボックス + 件数表示
            first_th_html = '<th><div><span>' +
                            '<input class="button-simple-custom" id="sansan-all-check" type="checkbox">' +
                            '</span><span class="recordlist-header-label-kintone">' +
                            count + '件' + '</span></div></th>';
        } else if (type === "Lookup") {
            //件数表示
            first_th_html = '<th><div><span class="recordlist-header-label-kintone">' +
                            count + '件' + '</span></div></th>';
        }

        result =
        '<table class="listTable-kintone lookup-table-kintone">' +
        '<thead class="lookup-thead-gaia">' + '<tr>' +
        //1列目見出し
        first_th_html +
        //2列目見出し
        '<th>' + '<div><span class="recordlist-header-label-kintone">会社名</span></div>' + '</th>' +
        //3列目見出し
        '<th>' + '<div><span class="recordlist-header-label-kintone">氏名</span></div>' + '</th>' +
        //4列目見出し
        '<th>' + '<div><span class="recordlist-header-label-kintone">E-mail</span></div>' + '</th>' +
        '</tr>' + '</thead>' + '<tbody>' + companylist + '</tbody>' + '</table>';

        return result;
    }
    //期間指定処理のHTML生成
    function createDateViewHTML() {
        var result;
        result =
            '<table class="listTable-kintone lookup-table-kintone">' +
            '<thead class="lookup-thead-gaia">' + '<tr>' +
            //1列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">開始</span></div>' + '</th>' +
            //2列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">終了</span></div>' + '</th>' +
            //3列目見出し
            '<th>' + '<div><span class="recordlist-header-label-kintone">' +
            '<div class="sansan-input-radio">' +
            '<span class="sansan-input-radio-item">' +
            '<input type="radio" name="sansan-date-radio" value="Registered_Date" id="radio-0" checked="">' +
            '<label for="radio-0">名刺登録日付</label></span>' +
            '<span class="sansan-input-radio-item">' +
            '<input type="radio" name="sansan-date-radio" value="Updated_Date" id="radio-1">' +
            '<label for="radio-1">名刺更新日付</label></span></div>' +
            '</span></div>' + '</th>' +
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
    }

    //ダイアログから値の取得
    function getElementParams(el) {
        return {
            "cardid": el.find(".sansan_lookup_cardid").val(),
            "companyid": el.find(".sansan_lookup_companyid").val(),
            "userid": el.find(".sansan_lookup_userid").val(),
            "exchangedate": el.find(".sansan_lookup_exchangedate").val(),
            "registeredtime": el.find(".sansan_lookup_registeredtime").val(),
            "ownerid": el.find(".sansan_lookup_ownerid").val(),
            "ownername": el.find(".sansan_lookup_ownername").val(),
            "username": el.find(".sansan_lookup_username").val(),
            "usernamereading": el.find(".sansan_lookup_usernamereading").val(),
            "departmentname": el.find(".sansan_lookup_departmentname").val(),
            "title": el.find(".sansan_lookup_title").val(),
            "email": el.find(".sansan_lookup_email").val(),
            "mobile": el.find(".sansan_lookup_mobile").val(),
            "companyname": el.find(".sansan_lookup_companyname").val(),
            "postalcode": el.find(".sansan_lookup_postalcode").val(),
            "address": el.find(".sansan_lookup_address").val(),
            "tel": el.find(".sansan_lookup_tel").val(),
            "secondtel": el.find(".sansan_lookup_secondtel").val(),
            "fax": el.find(".sansan_lookup_fax").val(),
            "url": el.find(".sansan_lookup_url").val(),
            "memo": el.find(".sansan_lookup_memo").val()
        };
    }

    window.sansanLib = window.sansanLib || {};
    window.sansanLib.escapeHtml = escapeHtml;
    window.sansanLib.Spin = Spin;
    window.sansanLib.getConfigValues = getConfigValues;
    window.sansanLib.postRecords_dropdownHtml = postRecords_dropdownHtml;
    window.sansanLib.postRecords_buttonsHtml = postRecords_buttonsHtml;
    window.sansanLib.lookupHtml = lookupHtml;
    window.sansanLib.checkNullParams = checkNullParams;
    window.sansanLib.sortRecords = sortRecords;
    window.sansanLib.deleteOverlappedRecords = deleteOverlappedRecords;
    window.sansanLib.createListViewHTML = createListViewHTML;
    window.sansanLib.createDateViewHTML = createDateViewHTML;
    window.sansanLib.createSansanURL = createSansanURL;
    window.sansanLib.getElementParams = getElementParams;

})(jQuery, kintone.$PLUGIN_ID);
