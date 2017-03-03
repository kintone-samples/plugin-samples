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

    $(document).ready(function() {
        var terms = {
            'ja': {
                'sansan_apikey_title': 'Sansan API Key',
                'sansan_apikey_desc': 'Sansan の管理画面で発行した、API Keyを入力してください。',
                'sansan_function_title': '使用機能',
                'sansan_function_desc': '本プラグインで使用する機能にチェックを入れてください。',
                'sansan_function_lookup_desc': 'ルックアップ機能[レコード追加/編集画面]',
                'sansan_function_postrecords_desc': 'レコード一括登録機能[レコード一覧画面]',
                'sansan_function_upsertrecords_desc': 'レコード一括登録時のUpsert機能[レコード一覧画面]',
                'sansan_lookup_title': 'ルックアップ機能設定項目',
                'sansan_spacefield_title': '検索ボタンを配置するスペース:',
                'sansan_spacefield_desc': '検索ボタンを配置するスペース: ここで指定したスペースフィールドに、「取得」「クリア」「期間」の枠なしボタンを配置します。',
                'sansan_keyfield_title': '検索キーとなるkintoneのフィールド：',
                'sansan_keyfield_desc': '検索キーとなるkintoneのフィールド: ここで選んだフィールドをもとに、Sansan に検索リクエストを送信します。',
                'sansan_originalfield_title': 'コピー元となるSansanのフィールド：',
                'sansan_originalfield_desc': '検索キーフィールドの値に、この Sansan フィールドが該当した場合、検索結果を返します。',
                'sansan_originalfield_option1': '会社名',
                'sansan_originalfield_option2': '氏名',
                'sansan_originalfield_option3': 'メールアドレス',
                'sansan_originalfield_option4': '電話番号',
                'sansan_originalfield_option5': '携帯番号',
                'sansan_upsert_title': 'レコード一括登録時のUpsert機能設定項目',
                'sansan_upsert_desc': 'Upsert機能で使用するキーフィールドを選択します。重複禁止が設定された文字列一行フィールドのみ選択できます。',
                'sansan_copy_title': 'コピー先フィールド',
                'sansan_copy_desc': '取得先のフィールドを選択してください。',
                'sansan_copy_cardid_desc': '名刺ID：',
                'sansan_copy_companyid_desc': '会社ID：',
                'sansan_copy_userid_desc': '人物ID：',
                'sansan_copy_exchangedate_desc': '名刺交換日：',
                'sansan_copy_registeredtime_desc': '名刺登録日：',
                'sansan_copy_ownerid_desc': '名刺所有者ID：',
                'sansan_copy_ownername_desc': '名刺所有者名：',
                'sansan_copy_username_desc': '氏名：',
                'sansan_copy_usernamereading_desc': '氏名カナ：',
                'sansan_copy_departmentname_desc': '部署名：',
                'sansan_copy_title_desc': '役職名：',
                'sansan_copy_email_desc': 'E-mail：',
                'sansan_copy_mobile_desc': '携帯：',
                'sansan_copy_companyname_desc': '会社名：',
                'sansan_copy_postalcode_desc': '郵便番号：',
                'sansan_copy_address_desc': '住所：',
                'sansan_copy_tel_desc': 'TEL：',
                'sansan_copy_secondtel_desc': 'TEL2：',
                'sansan_copy_fax_desc': 'FAX：',
                'sansan_copy_url_desc': 'URL：',
                'sansan_copy_memo_desc': 'メモ：',
                'error': 'エラー: ',
                'sansan_plugin_submit_title': '     保存   ',
                'sansan_plugin_cancel_title': '  キャンセル   ',
                'required_field': '必須項目が入力されていません。',
                'required_check': '値を正しく入力してください。'
            },
            'en': {
                'sansan_apikey_title': 'Sansan API Key',
                'sansan_apikey_desc': '',
                'sansan_function_title': 'Use function',
                'sansan_function_desc': '',
                'sansan_function_lookup_desc': 'Lookup Function[Create/Edit Event]',
                'sansan_function_postrecords_desc': 'Post Records Function[Index Event]',
                'sansan_function_upsertrecords_desc': 'Upsett Records Function[Index Event]',
                'sansan_lookup_title': 'Lookup Function',
                'sansan_spacefield_title': 'Search button display field',
                'sansan_spacefield_desc': 'The "Lookup" "Clear" and "Time range" buttons' +
                                            ' will be placed in the "Blank space" field' +
                                            ' that is selected in the options here.',
                'sansan_keyfield_title': 'kintone Key Field',
                'sansan_keyfield_desc': 'The value of the selected field will be used' +
                                        ' for the search request to Sansan.',
                'sansan_originalfield_title': 'Sansan Key Field',
                'sansan_originalfield_desc': 'The search request will give back results when' +
                                            ' the kintone Key Field value matches' +
                                            ' the Sansan key field value selected in the options here.',
                'sansan_originalfield_option1': 'Company Name',
                'sansan_originalfield_option2': 'Name',
                'sansan_originalfield_option3': 'Email',
                'sansan_originalfield_option4': 'Tel',
                'sansan_originalfield_option5': 'Mobile',
                'sansan_upsert_title': 'Upsert Records Function',
                'sansan_upsert_desc': '',
                'sansan_copy_title': 'Field Mappings',
                'sansan_copy_cardid_desc': 'CardID：',
                'sansan_copy_companyid_desc': 'CompanyID：',
                'sansan_copy_userid_desc': 'PersonID：',
                'sansan_copy_exchangedate_desc': 'ExchangeDate：',
                'sansan_copy_registeredtime_desc': 'RegisteredDate：',
                'sansan_copy_ownerid_desc': 'OwnerID：',
                'sansan_copy_ownername_desc': 'OwnerName：',
                'sansan_copy_username_desc': 'Name：',
                'sansan_copy_usernamereading_desc': 'NameReading：',
                'sansan_copy_departmentname_desc': 'DepartmentName：',
                'sansan_copy_title_desc': 'Title：',
                'sansan_copy_email_desc': 'E-mail：',
                'sansan_copy_mobile_desc': 'Mobile：',
                'sansan_copy_companyname_desc': 'CompanyName：',
                'sansan_copy_postalcode_desc': 'PostalCode：',
                'sansan_copy_address_desc': 'Address：',
                'sansan_copy_tel_desc': 'TEL：',
                'sansan_copy_secondtel_desc': 'secondTel：',
                'sansan_copy_fax_desc': 'FAX：',
                'sansan_copy_url_desc': 'URL：',
                'sansan_copy_memo_desc': 'Note：',
                'error': 'Error: ',
                'sansan_plugin_submit_title': '     Save   ',
                'sansan_plugin_cancel_title': '  Cancel   ',
                'required_field': 'Required field is empty.',
                'required_check': ''
            }
        };

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#sansan-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#sansan-plugin').html(tmpl.render({'terms': i18n}));

        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        //アップデート互換性対応
        function checkUpdateValue(str) {
            var value = str;
            if (value === undefined) {
                value = "null";
            }
            return value;
        }

        function setDefault() {

            var conf = kintone.plugin.app.getConfig(PLUGIN_ID);

            //既に値が設定されている場合はフィールドに値を設定する
            if (Object.keys(conf).length !== 0) {
                $('#sansan_api_code').val(checkUpdateValue(conf['sansanapikey']));
                $('#sansan-checkbox input[value="' +
                    checkUpdateValue(conf['sansan_lookup_flg']) +
                    '"]').prop("checked", true);
                $('#sansan-checkbox input[value="' +
                    checkUpdateValue(conf['sansan_postrecords_flg']) +
                    '"]').prop("checked", true);
                $('#sansan-checkbox input[value="' +
                    checkUpdateValue(conf['sansan_upsertrecords_flg']) +
                    '"]').prop("checked", true);
                $("#sansan_spacefield_code").val(checkUpdateValue(conf['spacefield']));
                $("#sansan_keyfield_code").val(checkUpdateValue(conf['keyfield']));
                $("#sansan_originalfield_code").val(checkUpdateValue(conf['originalfield']));
                $("#sansan_upsertkeyfield_code").val(checkUpdateValue(conf['upsertkeyfield']));
                $("#sansan_copy_cardid_code").val(checkUpdateValue(conf['copy_cardid']));
                $("#sansan_copy_companyid_code").val(checkUpdateValue(conf['copy_companyid']));
                $("#sansan_copy_userid_code").val(checkUpdateValue(conf['copy_userid']));
                $("#sansan_copy_exchangedate_code").val(checkUpdateValue(conf['copy_exchangedate']));
                $("#sansan_copy_registeredtime_code").val(checkUpdateValue(conf['copy_registeredtime']));
                $("#sansan_copy_ownerid_code").val(checkUpdateValue(conf['copy_ownerid']));
                $("#sansan_copy_ownername_code").val(checkUpdateValue(conf['copy_ownername']));
                $("#sansan_copy_username_code").val(checkUpdateValue(conf['copy_username']));
                $("#sansan_copy_usernamereading_code").val(checkUpdateValue(conf['copy_usernamereading']));
                $("#sansan_copy_departmentname_code").val(checkUpdateValue(conf['copy_departmentname']));
                $("#sansan_copy_title_code").val(checkUpdateValue(conf['copy_title']));
                $("#sansan_copy_email_code").val(checkUpdateValue(conf['copy_email']));
                $("#sansan_copy_mobile_code").val(checkUpdateValue(conf['copy_mobile']));
                $("#sansan_copy_companyname_code").val(checkUpdateValue(conf['copy_companyname']));
                $("#sansan_copy_postalcode_code").val(checkUpdateValue(conf['copy_postalcode']));
                $("#sansan_copy_address_code").val(checkUpdateValue(conf['copy_address']));
                $("#sansan_copy_tel_code").val(checkUpdateValue(conf['copy_tel']));
                $("#sansan_copy_secondtel_code").val(checkUpdateValue(conf['copy_secondtel']));
                $("#sansan_copy_fax_code").val(checkUpdateValue(conf['copy_fax']));
                $("#sansan_copy_url_code").val(checkUpdateValue(conf['copy_url']));
                $("#sansan_copy_memo_code").val(checkUpdateValue(conf['copy_memo']));
            }
        }

        function setDropdown() {
            // キーフィールド選択肢作成
            kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()},
            function(resp) {
                for (var i = 0; i < resp.properties.length; i++) {
                    var prop = resp.properties[i];
                    var $appendhtml;
                    switch (prop.type) {
                        case 'SINGLE_LINE_TEXT':
                            $appendhtml = $('<option value = ' + '\"' +
                            escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                            $('.sansan-copy-text').append($appendhtml);
                            if (prop.unique === "true") {
                                $('.sansan-copy-text-unique').append($appendhtml);
                            }
                            break;

                        case 'MULTI_LINE_TEXT':
                            $appendhtml = $('<option value = ' + '\"' +
                            escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                            $('.sansan-copy-textbox').append($appendhtml);
                            break;

                        case 'DATE':
                        case 'DATETIME':
                            $appendhtml = $('<option value = ' + '\"' +
                            escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                            $('.sansan-copy-date').append($appendhtml);
                            break;

                        case 'LINK':
                            if (prop.protocol === "MAIL") {
                                $appendhtml = $('<option value = ' + '\"' +
                                escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                                $('.sansan-copy-mail').append($appendhtml);

                            } else if (prop.protocol === "CALL") {
                                $appendhtml = $('<option value = ' + '\"' +
                                escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                                $('.sansan-copy-call').append($appendhtml);
                            } else if (prop.protocol === "WEB") {
                                $appendhtml = $('<option value = ' + '\"' +
                                escapeHtml(prop.code) + '\">' + escapeHtml(prop.label) + '</option>');
                                $('.sansan-copy-web').append($appendhtml);
                            }
                            break;

                        case 'SPACER':
                            if (prop.elementId !== "") {
                                $appendhtml = $('<option value = ' + '\"' +
                                escapeHtml(prop.elementId) + '\">' + escapeHtml(prop.elementId) + '</option>');
                                $('#sansan_spacefield_code').append($appendhtml);
                            }
                            break;
                    }
                }
                setDefault();
            });
        }

        //「保存する」ボタン押下時に入力情報を設定する
        $('#sansan_plugin_submit').click(function() {
            var config = {};
            var header = {
                'X-Sansan-Api-Key': $('#sansan_api_code').val()
            };
            var lookup_flg = "";
            var postrecords_flg = "";
            var upsertrecords_flg = "";

            if ($('#sansan-checkbox input[id="sansan-checkbox-lookup"]:checked')[0]) {
                lookup_flg = $('#sansan-checkbox input[id="sansan-checkbox-lookup"]:checked')[0].value;
            }
            if ($('#sansan-checkbox input[id="sansan-checkbox-postrecords"]:checked')[0]) {
                postrecords_flg = $('#sansan-checkbox input[id="sansan-checkbox-postrecords"]:checked')[0].value;
            }
            if ($('#sansan-checkbox input[id="sansan-checkbox-upsertrecords"]:checked')[0]) {
                upsertrecords_flg = $('#sansan-checkbox input[id="sansan-checkbox-upsertrecords"]:checked')[0].value;
            }

            //Upsert機能の設定画面項目チェック
            if ((upsertrecords_flg !== "" && $("#sansan_upsertkeyfield_code").val() === "null") ||
                (upsertrecords_flg === "" && $("#sansan_upsertkeyfield_code").val() !== "null")) {
                swal('Error!', 'レコード一括登録時のUpsert機能を利用する場合は\n' +
                    '使用機能の「レコード一括登録時のUpsert機能」にチェックを入れ、\n' +
                    '「レコード一括登録時のUpsert機能設定項目」で使用するフィールドを選択してください。', 'error');
                return false;
            }

            // 設定文書の値を返す
            config['sansanapikey'] = $('#sansan_api_code').val();
            config['sansan_lookup_flg'] = lookup_flg;
            config['sansan_postrecords_flg'] = postrecords_flg;
            config['sansan_upsertrecords_flg'] = upsertrecords_flg;
            config['spacefield'] = $("#sansan_spacefield_code").val();
            config['keyfield'] = $("#sansan_keyfield_code").val();
            config['originalfield'] = $("#sansan_originalfield_code").val();
            config['upsertkeyfield'] = $("#sansan_upsertkeyfield_code").val();
            config['copy_cardid'] = $('#sansan_copy_cardid_code').val();
            config['copy_companyid'] = $('#sansan_copy_companyid_code').val();
            config['copy_userid'] = $('#sansan_copy_userid_code').val();
            config['copy_exchangedate'] = $('#sansan_copy_exchangedate_code').val();
            config['copy_registeredtime'] = $('#sansan_copy_registeredtime_code').val();
            config['copy_ownerid'] = $('#sansan_copy_ownerid_code').val();
            config['copy_ownername'] = $('#sansan_copy_ownername_code').val();
            config['copy_username'] = $('#sansan_copy_username_code').val();
            config['copy_usernamereading'] = $('#sansan_copy_usernamereading_code').val();
            config['copy_departmentname'] = $('#sansan_copy_departmentname_code').val();
            config['copy_title'] = $('#sansan_copy_title_code').val();
            config['copy_email'] = $('#sansan_copy_email_code').val();
            config['copy_mobile'] = $('#sansan_copy_mobile_code').val();
            config['copy_companyname'] = $('#sansan_copy_companyname_code').val();
            config['copy_postalcode'] = $('#sansan_copy_postalcode_code').val();
            config['copy_address'] = $('#sansan_copy_address_code').val();
            config['copy_tel'] = $('#sansan_copy_tel_code').val();
            config['copy_secondtel'] = $('#sansan_copy_secondtel_code').val();
            config['copy_fax'] = $('#sansan_copy_fax_code').val();
            config['copy_url'] = $('#sansan_copy_url_code').val();
            config['copy_memo'] = $('#sansan_copy_memo_code').val();
            kintone.plugin.app.setProxyConfig("https://api.sansan.com/", "GET", header, {}, function(resp) {
                kintone.plugin.app.setConfig(config);
            });
        });

        //「キャンセル」ボタン押下時の処理
        $('#sansan_plugin_cancel').click(function() {
            history.back();
        });

        setDropdown();
    });
})(jQuery, kintone.$PLUGIN_ID);
