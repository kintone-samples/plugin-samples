/*
 * textConnect Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';

    // プラグインIDの設定
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    function decodeSpace(htmlstr) {
        return htmlstr.replace(/&nbsp;/g, ' ').replace(/&emsp;/g, '　');
    }

    function setDefault() {
        if (CONF) {
            for (var i = 1; i < 16; i++) {
                $('#select' + i).val(CONF['select' + i]);
            }

            // 旧プラグインから設定を引き継ぐ
            if (CONF.hasOwnProperty('line_number')) {
                $('#copyfield1').val(CONF.copyfield);
                if (CONF.copyfield !== '') {
                    $('#between1').val(decodeSpace(CONF.between));
                } else {
                    $('#between1').val(CONF.between);
                }
            } else {
                $('#copyfield1').val(CONF.copyfield1);
                $('#copyfield2').val(CONF.copyfield2);
                $('#copyfield3').val(CONF.copyfield3);
                for (var y = 1; y < 4; y++) {
                    if (CONF['copyfield' + y] !== '') {
                        $('#between' + y).val(decodeSpace(CONF['between' + y]));
                    } else {
                        $('#between' + y).val(CONF['between' + y]);
                    }
                }
            }
        }
    }

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
    }

    function encodeSpace(htmlstr1) {
        return htmlstr1.replace(/\u0020/g, '&nbsp;').replace(/\u3000/g, '&emsp;');
    }


    function setDropdown() {
        // フォーム設計情報を取得し、選択ボックスに代入する
        var url = kintone.api.url('/k/v1/preview/app/form/fields', true);
        kintone.api(url, 'GET', {'app': kintone.app.getId()}, function(resp) {
            var $option = $('<option>');
            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {continue; }
                var prop = resp.properties[key];

                switch (prop.type) {
                    // 文字列1行の時と文字列複数行を結合フィールドと保存フィールドに適用
                    case 'SINGLE_LINE_TEXT':
                    case 'MULTI_LINE_TEXT':
                        for (var m = 1; m < 16; m++) {
                            $option.attr('value', escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $('#select' + m).append($option.clone());
                        }
                        $('#copyfield1').append($option.clone());
                        $('#copyfield2').append($option.clone());
                        $('#copyfield3').append($option.clone());

                        break;
                    // リッチエディタの時は保存フィールドのみに適用
                    case 'RICH_TEXT':
                        for (var l = 1; l < 16; l++) {
                            $option.attr('value', escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                        }
                        $('#copyfield1').append($option.clone());
                        $('#copyfield2').append($option.clone());
                        $('#copyfield3').append($option.clone());
                        break;

                    // このパターンの時は結合フィールドのみに適用
                    case 'DATETIME':
                    case 'NUMBER':
                    case 'RADIO_BUTTON':
                    case 'CHECK_BOX':
                    case 'MULTI_SELECT':
                    case 'DROP_DOWN':
                    case 'DATE':
                    case 'TIME':
                    case 'LINK':
                    case 'USER_SELECT':
                    case 'ORGANIZATION_SELECT':
                    case 'GROUP_SELECT':
                        for (var n = 1; n < 16; n++) {
                            $option.attr('value', escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $('#select' + n).append($option.clone());
                        }
                        break;

                    default :
                        break;
                }
            }
            setDefault();
        });
    }

    function checkValues() {
        // 必須項目のチェック、
        for (var b = 1; b < 6; b++) {
            if ($('#select' + b).val() !== '' && $('#copyfield1').val() === '') {
                swal('Error!', '「結合された文字列を表示する項目」は必須です。', 'error');
                return false;
            }
        }
        for (var c = 6; c < 11; c++) {
            if ($('#select' + c).val() !== '' && $('#copyfield2').val() === '') {
                swal('Error!', '「結合された文字列を表示する項目」は必須です。', 'error');
                return false;
            }
        }
        for (var d = 11; d < 16; d++) {
            if ($('#select' + d).val() !== '' && $('#copyfield3').val() === '') {
                swal('Error!', '「結合された文字列を表示する項目」は必須です。', 'error');
                return false;
            }
        }
        return true;
    }

    // 「保存する」ボタン押下時に入力情報を設定する
    $('#submit').click(function() {
        var config = [];
        for (var i = 1; i < 16; i++) {
            config['select' + i] = $('#select' + i).val();
        }
        config['copyfield1'] = $('#copyfield1').val();
        config['copyfield2'] = $('#copyfield2').val();
        config['copyfield3'] = $('#copyfield3').val();
        config['between1'] = encodeSpace($('#between1').val());
        config['between2'] = encodeSpace($('#between2').val());
        config['between3'] = encodeSpace($('#between3').val());

        if (checkValues()) {
            kintone.plugin.app.setConfig(config);
        }
    });

    // 「キャンセル」ボタン押下時の処理
    $('#cancel').click(function() {
        window.history.back();
    });

    setDropdown();
})(jQuery, kintone.$PLUGIN_ID);
