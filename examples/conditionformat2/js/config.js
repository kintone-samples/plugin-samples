/*
 * New Condition Format plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var TEXT_ROW_NUM = Number(CONF["text_row_number"]);
    var DATE_ROW_NUM = Number(CONF["date_row_number"]);

    for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
        CONF["text_row" + t] = JSON.parse(CONF["text_row" + t]);
    }
    for (var d = 1; d < DATE_ROW_NUM + 1; d++) {
        CONF["date_row" + d] = JSON.parse(CONF["date_row" + d]);
    }

    $(document).ready(function() {
        var terms = {
            'ja': {
                'conditionformat_text_title': '文字条件書式',
                'conditionformat_date_title': '日付条件書式',
                'conditionformat_text_column1': '書式条件フィールド',
                'conditionformat_text_column2': '条件式',
                'conditionformat_text_column3': '条件値',
                'conditionformat_text_column4': '書式変更フィールド',
                'conditionformat_text_column5': '文字色',
                'conditionformat_text_column6': '背景色',
                'conditionformat_text_column7': '文字サイズ',
                'conditionformat_text_column8': '文字装飾',
                'conditionformat_text_column1_option1': 'ステータス(プロセス管理)',
                'conditionformat_text_column2_option1': '条件値を含む',
                'conditionformat_text_column2_option2': '条件値を含まない',
                'conditionformat_text_column2_option3': '=(等しい)',
                'conditionformat_text_column2_option4': '≠(等しくない)',
                'conditionformat_text_column2_option5': '≦(以下)',
                'conditionformat_text_column2_option6': '<(より小さい)',
                'conditionformat_text_column2_option7': '≧(以上)',
                'conditionformat_text_column2_option8': '>(より大きい)',
                'conditionformat_text_column4_option1': 'ステータス(プロセス管理)',
                'conditionformat_text_column7_option1': '変更なし',
                'conditionformat_text_column7_option2': '小さい',
                'conditionformat_text_column7_option3': 'やや小さい',
                'conditionformat_text_column7_option4': 'やや大きい',
                'conditionformat_text_column7_option5': '大きい',
                'conditionformat_text_column8_option1': '変更なし',
                'conditionformat_text_column8_option2': '太字',
                'conditionformat_text_column8_option3': '下線',
                'conditionformat_text_column8_option4': '打ち消し線',
                'conditionformat_date_column1': '書式条件フィールド',
                'conditionformat_date_column2': '条件式',
                'conditionformat_date_column3': '条件値',
                'conditionformat_date_column4': '書式変更フィールド',
                'conditionformat_date_column5': '文字色',
                'conditionformat_date_column6': '背景色',
                'conditionformat_date_column7': '文字サイズ',
                'conditionformat_date_column8': '文字装飾',
                'conditionformat_date_column2_desc1': '今日から',
                'conditionformat_date_column2_desc2': '日',
                'conditionformat_date_column2_option1': '=(等しい)',
                'conditionformat_date_column2_option2': '≠(等しくない)',
                'conditionformat_date_column2_option3': '≦(以前)',
                'conditionformat_date_column2_option4': '<(より前)',
                'conditionformat_date_column2_option5': '≧(以後)',
                'conditionformat_date_column2_option6': '>(より後)',
                'conditionformat_date_column3_option1': '前',
                'conditionformat_date_column3_option2': '後',
                'conditionformat_date_column4_option1': 'ステータス(プロセス管理)',
                'conditionformat_date_column7_option1': '変更なし',
                'conditionformat_date_column7_option2': '小さい',
                'conditionformat_date_column7_option3': 'やや小さい',
                'conditionformat_date_column7_option4': 'やや大きい',
                'conditionformat_date_column7_option5': '大きい',
                'conditionformat_date_column8_option1': '変更なし',
                'conditionformat_date_column8_option2': '太字',
                'conditionformat_date_column8_option3': '下線',
                'conditionformat_date_column8_option4': '打ち消し線',
                'plugin_submit': '     保存   ',
                'plugin_cancel': '  キャンセル   ',
                'required_field': '必須項目が入力されていません。'
            },
            'en': {
                'conditionformat_text_title': 'Text Format Conditions',
                'conditionformat_date_title': 'Date Format Conditions',
                'conditionformat_text_column1': 'Field (condition)',
                'conditionformat_text_column2': 'Condition',
                'conditionformat_text_column3': 'Value',
                'conditionformat_text_column4': 'Field (target)',
                'conditionformat_text_column5': 'Font Color',
                'conditionformat_text_column6': 'Background Color',
                'conditionformat_text_column7': 'Font Size',
                'conditionformat_text_column8': 'Style',
                'conditionformat_text_column1_option1': 'Status(Process Management)',
                'conditionformat_text_column2_option1': 'includes',
                'conditionformat_text_column2_option2': 'doesn\'t include',
                'conditionformat_text_column2_option3': '=',
                'conditionformat_text_column2_option4': '≠',
                'conditionformat_text_column2_option5': '≦',
                'conditionformat_text_column2_option6': '<',
                'conditionformat_text_column2_option7': '≧',
                'conditionformat_text_column2_option8': '>',
                'conditionformat_text_column4_option1': 'Status(Process Management)',
                'conditionformat_text_column7_option1': 'Normal',
                'conditionformat_text_column7_option2': 'Very Small',
                'conditionformat_text_column7_option3': 'Small',
                'conditionformat_text_column7_option4': 'Large',
                'conditionformat_text_column7_option5': 'Very Large',
                'conditionformat_text_column8_option1': 'Normal',
                'conditionformat_text_column8_option2': 'Bold',
                'conditionformat_text_column8_option3': 'Underline',
                'conditionformat_text_column8_option4': 'Strikethrough',
                'conditionformat_date_column1': 'Field (condition)',
                'conditionformat_date_column2': 'Condition',
                'conditionformat_date_column3': 'Value',
                'conditionformat_date_column4': 'Field (target)',
                'conditionformat_date_column5': 'Font Color',
                'conditionformat_date_column6': 'Background Color',
                'conditionformat_date_column7': 'Font Size',
                'conditionformat_date_column8': 'Style',
                'conditionformat_date_column2_desc1': '',
                'conditionformat_date_column2_desc2': 'days',
                'conditionformat_date_column2_option1': '=',
                'conditionformat_date_column2_option2': '≠',
                'conditionformat_date_column2_option3': '≦',
                'conditionformat_date_column2_option4': '<',
                'conditionformat_date_column2_option5': '≧',
                'conditionformat_date_column2_option6': '>',
                'conditionformat_date_column3_option1': 'before today',
                'conditionformat_date_column3_option2': 'after today',
                'conditionformat_date_column4_option1': 'Status(Process Management)',
                'conditionformat_date_column7_option1': 'Normal',
                'conditionformat_date_column7_option2': 'Very Small',
                'conditionformat_date_column7_option3': 'Small',
                'conditionformat_date_column7_option4': 'Large',
                'conditionformat_date_column7_option5': 'Very Large',
                'conditionformat_date_column8_option1': 'Normal',
                'conditionformat_date_column8_option2': 'Bold',
                'conditionformat_date_column8_option3': 'Underline',
                'conditionformat_date_column8_option4': 'Strikethrough',
                'plugin_submit': '     Save   ',
                'plugin_cancel': '  Cancel   ',
                'required_field': 'Required field is empty.'
            },
            'zh': {
                'conditionformat_text_title': '文字条件格式',
                'conditionformat_date_title': '日期条件格式',
                'conditionformat_text_column1': '条件字段',
                'conditionformat_text_column2': '条件公式',
                'conditionformat_text_column3': '条件值',
                'conditionformat_text_column4': '要更改格式的字段',
                'conditionformat_text_column5': '字体颜色',
                'conditionformat_text_column6': '背景色',
                'conditionformat_text_column7': '文字大小',
                'conditionformat_text_column8': '字体装饰',
                'conditionformat_text_column1_option1': '状态(流程管理)',
                'conditionformat_text_column2_option1': '包含条件值',
                'conditionformat_text_column2_option2': '不包含条件值',
                'conditionformat_text_column2_option3': '=(等于)',
                'conditionformat_text_column2_option4': '≠(不等于)',
                'conditionformat_text_column2_option5': '≦(小于或等于)',
                'conditionformat_text_column2_option6': '<(小于)',
                'conditionformat_text_column2_option7': '≧(大于或等于)',
                'conditionformat_text_column2_option8': '>(大于)',
                'conditionformat_text_column4_option1': '状态(流程管理)',
                'conditionformat_text_column7_option1': '不更改',
                'conditionformat_text_column7_option2': '小',
                'conditionformat_text_column7_option3': '稍小',
                'conditionformat_text_column7_option4': '稍大',
                'conditionformat_text_column7_option5': '大',
                'conditionformat_text_column8_option1': '不更改',
                'conditionformat_text_column8_option2': '粗体',
                'conditionformat_text_column8_option3': '下划线',
                'conditionformat_text_column8_option4': '删除线',
                'conditionformat_date_column1': '条件字段',
                'conditionformat_date_column2': '条件公式',
                'conditionformat_date_column3': '条件值',
                'conditionformat_date_column4': '要更改格式的字段',
                'conditionformat_date_column5': '字体颜色',
                'conditionformat_date_column6': '背景色',
                'conditionformat_date_column7': '字体大小',
                'conditionformat_date_column8': '字体装饰',
                'conditionformat_date_column2_desc1': '今日起',
                'conditionformat_date_column2_desc2': '天',
                'conditionformat_date_column2_option1': '=(等于)',
                'conditionformat_date_column2_option2': '≠(不等于)',
                'conditionformat_date_column2_option3': '≦(以前)',
                'conditionformat_date_column2_option4': '<(早于)',
                'conditionformat_date_column2_option5': '≧(以后)',
                'conditionformat_date_column2_option6': '>(晚于)',
                'conditionformat_date_column3_option1': '前',
                'conditionformat_date_column3_option2': '后',
                'conditionformat_date_column4_option1': '状态(流程管理)',
                'conditionformat_date_column7_option1': '不更改',
                'conditionformat_date_column7_option2': '小',
                'conditionformat_date_column7_option3': '稍小',
                'conditionformat_date_column7_option4': '稍大',
                'conditionformat_date_column7_option5': '大',
                'conditionformat_date_column8_option1': '不更改',
                'conditionformat_date_column8_option2': '粗体',
                'conditionformat_date_column8_option3': '下划线',
                'conditionformat_date_column8_option4': '删除线',
                'plugin_submit': '     保存   ',
                'plugin_cancel': '  取消   ',
                'required_field': '有必填项未填写。'
            }
        };

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#conditionformat-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#conditionformat-plugin').html(tmpl.render({'terms': i18n}));

        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        }

        function checkRowNumber() {
            if ($("#conditionformat-plugin-text-tbody > tr").length === 2) {
                $("#conditionformat-plugin-text-tbody > tr .removeList").eq(1).hide();
            } else {
                $("#conditionformat-plugin-text-tbody > tr .removeList").eq(1).show();
            }

            if ($("#conditionformat-plugin-date-tbody > tr").length === 2) {
                $("#conditionformat-plugin-date-tbody > tr .removeList").eq(1).hide();
            } else {
                $("#conditionformat-plugin-date-tbody > tr .removeList").eq(1).show();
            }
        }

        function setDefault() {
            if (TEXT_ROW_NUM > 0) {
                for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
                    $("#conditionformat-plugin-text-tbody > tr").eq(0).clone(true).insertAfter(
                        $("#conditionformat-plugin-text-tbody > tr").eq(ti - 1)
                    );
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column1").
                        val(CONF["text_row" + ti]['field']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column2").
                        val(CONF["text_row" + ti]['type']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column3").
                        val(CONF["text_row" + ti]['value']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column4").
                        val(CONF["text_row" + ti]['targetfield']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column5").
                        val(CONF["text_row" + ti]['targetcolor']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column6").
                        val(CONF["text_row" + ti]['targetbackgroundcolor']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column7").
                        val(CONF["text_row" + ti]['targetsize']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column8").
                        val(CONF["text_row" + ti]['targetfont']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column5")[0].
                        setAttribute("style", "color:" + CONF["text_row" + ti]['targetcolor']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column6")[0].
                        setAttribute("style", "color:" + CONF["text_row" + ti]['targetbackgroundcolor']);
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column5").
                        parent('div').find('i')[0].setAttribute(
                            "style", "border-bottom-color:" + CONF["text_row" + ti]['targetcolor']
                    );
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ti + ") .conditionformat-plugin-column6").
                        parent('div').find('i')[0].setAttribute(
                            "style", "border-bottom-color:" + CONF["text_row" + ti]['targetbackgroundcolor']
                    );
                }
            } else {
                // Insert Row
                $("#conditionformat-plugin-text-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#conditionformat-plugin-text-tbody > tr")
                ).eq(0);
            }

            if (DATE_ROW_NUM > 0) {
                for (var di = 1; di <= DATE_ROW_NUM; di++) {
                    $("#conditionformat-plugin-date-tbody > tr").eq(0).clone(true).insertAfter(
                        $("#conditionformat-plugin-date-tbody > tr").eq(di - 1)
                    );
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column1").
                        val(CONF["date_row" + di]['field']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column2").
                        val(CONF["date_row" + di]['type']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column3").
                        val(CONF["date_row" + di]['value']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column3-select2").
                        val(CONF["date_row" + di]['type2']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column4").
                        val(CONF["date_row" + di]['targetfield']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column5").
                        val(CONF["date_row" + di]['targetcolor']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column6").
                        val(CONF["date_row" + di]['targetbackgroundcolor']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column7").
                        val(CONF["date_row" + di]['targetsize']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column8").
                        val(CONF["date_row" + di]['targetfont']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column5")[0].
                        setAttribute("style", "color:" + CONF["date_row" + di]['targetcolor']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column6")[0].
                        setAttribute("style", "color:" + CONF["date_row" + di]['targetbackgroundcolor']);
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column5").
                        parent('div').find('i')[0].setAttribute(
                            "style", "border-bottom-color:" + CONF["date_row" + di]['targetcolor']
                    );
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + di + ") .conditionformat-plugin-column6").
                        parent('div').find('i')[0].setAttribute(
                            "style", "border-bottom-color:" + CONF["date_row" + di]['targetbackgroundcolor']
                    );
                }
            } else {
                // Insert Row
                $("#conditionformat-plugin-date-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#conditionformat-plugin-date-tbody > tr")
                ).eq(0);
            }
            checkRowNumber();
        }

        function setDropdown() {
            var param = {"app": kintone.app.getId()};
            kintone.api(kintone.api.url("/k/v1/preview/app/form/fields", true), "GET", param, function(resp) {
                for (var key in resp.properties) {
                    if (!resp.properties.hasOwnProperty(key)) { continue; }
                    var prop = resp.properties[key];
                    var $option = $("<option>");

                    switch (prop.type) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "CALC":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "RECORD_NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "CHECK_BOX":
                        case "MULTI_SELECT":
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#conditionformat-plugin-text-tbody > tr:eq(0) .conditionformat-plugin-column1").
                                append($option.clone());
                            $("#conditionformat-plugin-text-tbody > tr:eq(0) .conditionformat-plugin-column4").
                                append($option.clone());
                            $("#conditionformat-plugin-date-tbody > tr:eq(0) .conditionformat-plugin-column4").
                                append($option.clone());
                            break;

                        case "DATE":
                        case "DATETIME":
                        case "CREATED_TIME":
                        case "UPDATED_TIME":
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#conditionformat-plugin-text-tbody > tr:eq(0) .conditionformat-plugin-column1").
                                append($option.clone());
                            $("#conditionformat-plugin-date-tbody > tr:eq(0) .conditionformat-plugin-column4").
                                append($option.clone());
                            $("#conditionformat-plugin-date-tbody > tr:eq(0) .conditionformat-plugin-column1").
                                append($option.clone());
                            break;

                        default :
                            break;
                    }
                }
                setDefault();
            });
        }

        function showErrorMessages(type, error_num, row_num) {
            var user_lang = kintone.getLoginUser().language;
            var messages = {
                'ja': {
                    'text': {
                        "1": "文字条件書式の" + row_num + "行目の必須入力項目を入力してください",
                        "2": "文字条件書式の" + row_num + "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "3": "文字条件書式の" + row_num + "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "4": "文字条件書式の" + row_num + "行目の条件値または色に\n" +
                                "HTML特殊文字(&, <, >, \", \')を入力することはできません",
                        "5": "文字条件書式の" + row_num + "行目に「ステータス(プロセス管理)」を追加するには\n" +
                                "プロセス管理の設定を有効にしてください"
                    },
                    'date': {
                        "1": "日付条件書式の" + row_num + "行目の必須入力項目を入力してください",
                        "2": "日付条件書式の" + row_num + "行目の条件値には\n半角数字を入力してください",
                        "3": "日付条件書式の" + row_num + "行目の条件値には\n整数を入力してください",
                        "4": "日付条件書式の" + row_num + "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "5": "日付条件書式の" + row_num + "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "6": "日付条件書式の" + row_num + "行目の条件値または色に\nHTML特殊文字(&, <, >, \", \')を入力することはできません",
                        "7": "日付条件書式の" + row_num + "行目に「ステータス(プロセス管理)」を追加するには\nプロセス管理の設定を有効にしてください"
                    }
                },
                'en': {
                    'text': {
                        "1": "Required fields for Text Format Conditions row " + row_num + " are empty.",
                        "2": "Input \"#000000 ~ #FFFFFF\" for Font Color in Text Format Conditions row " + row_num + ".",
                        "3": "Input \"#000000 ~ #FFFFFF\" for Background Color in Text Format Conditions row " + row_num + ".",
                        "4": "Text Format Conditions row " + row_num + " includes HTML Characters.",
                        "5": "Text Format Conditions row " + row_num + " includes Status(Process Management)." +
                                " Please enable this app's process management feature to include it in the condition."
                    },
                    'date': {
                        "1": "Required fields for Date Format Conditions row " + row_num + " are empty.",
                        "2": "Input integers for Value of Date Format Conditions row " + row_num + ".",
                        "3": "Input integers for Value of Date Format Conditions row " + row_num + ".",
                        "4": "Input \"#000000 ~ #FFFFFF\" for Font Color of Date Format Conditions row " + row_num + ".",
                        "5": "Input \"#000000 ~ #FFFFFF\" for Background Color of Date Format Conditions row " + row_num + ".",
                        "6": "Date Format Conditions row " + row_num + " includes HTML Characters.",
                        "7": "Date Format Conditions row " + row_num + " includes Status(Process Management)." +
                                " Please enable this app's process management feature to include it in the condition."
                    }
                },
                'zh': {
                    'text': {
                        "1": "文字条件格式的第" + row_num + "行有必填项未填写",
                        "2": "文字条件格式的第" + row_num + "行的字体颜色框中\n请输入颜色代码[#000000-#FFFFFF]",
                        "3": "文字条件格式的第" + row_num + "行的背景色框中\n请输入颜色代码[#000000-#FFFFFF]",
                        "4": "文字条件格式的第" + row_num + "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", \')",
                        "5": "文字条件格式的第" + row_num + "行要指定[状态(流程管理)]的话\n请先启用流程管理"
                    },
                    'date': {
                        "1": "日期条件格式的第" + row_num + "行有必填项未填写",
                        "2": "日期条件格式的第" + row_num + "行的条件值\n仅可输入半角数字",
                        "3": "日期条件格式的第" + row_num + "行的条件值\n仅可输入整数",
                        "4": "日期条件格式的第" + row_num + "行的字体颜色\n请输入颜色代码[#000000-#FFFFFF]",
                        "5": "日期条件格式的第" + row_num + "行的背景色\n请输入颜色代码[#000000-#FFFFFF]",
                        "6": "日期条件格式的第" + row_num + "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", \')",
                        "7": "日期条件格式的第" + row_num + "行要指定[状态(流程管理)]的话\n请先启用流程管理"
                    }
                }
            };
            alert(messages[user_lang][type][error_num]);
        }

        function getValues(type, num) {
            switch (type) {
                case "text":
                    return {
                        "field": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column1").val(),
                        "type": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column2").val(),
                        "value": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column3").val(),
                        "targetfield": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column4").val(),
                        "targetcolor": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column5").val(),
                        "targetbackgroundcolor": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column6").val(),
                        "targetsize": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column7").val(),
                        "targetfont": $("#conditionformat-plugin-text-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column8").val()
                    };
                case "date":
                    return {
                        "field": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column1").val(),
                        "type": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column2").val(),
                        "value": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column3").val(),
                        "type2": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column3-select2").val(),
                        "targetfield": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column4").val(),
                        "targetcolor": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column5").val(),
                        "targetbackgroundcolor": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column6").val(),
                        "targetsize": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column7").val(),
                        "targetfont": $("#conditionformat-plugin-date-tbody > tr:eq(" + num +
                                ") .conditionformat-plugin-column8").val()
                    };
                default:
                    return "";
            }
        }
        function checkTextValues(config, pm_type) {
            var text_row_num = $("#conditionformat-plugin-text-tbody > tr").length - 1;
            for (var ct = 1; ct <= text_row_num; ct++) {
                var text = getValues("text", ct);
                if (text.field === "" && text.type === "" && text.targetfield === "") {
                    $("#conditionformat-plugin-text-tbody > tr:eq(" + ct + ")").remove();
                    text_row_num = text_row_num - 1;
                    ct--;
                    continue;
                }

                if ((text.field === "" || text.type === "" || text.targetfield === "") &&
                    !(text.field === "" && text.type === "" && text.targetfield === "")) {
                    showErrorMessages("text", "1", ct);
                    return false;
                }

                if (text.targetcolor.slice(0, 1) !== "#") {
                    showErrorMessages("text", "2", ct);
                    return false;
                }

                if (text.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetcolor !== "#000000") {
                        showErrorMessages("text", "2", ct);
                        return false;
                    }
                }

                if (text.targetbackgroundcolor.slice(0, 1) !== "#") {
                    showErrorMessages("text", "3", ct);
                    return false;
                }

                if (text.targetbackgroundcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetbackgroundcolor !== "#") {
                        showErrorMessages("text", "3", ct);
                        return false;
                    }
                }
                if (text.value.match(/\&|<|\>|\"|\'/g) !== null ||
                    text.targetcolor.match(/\&|<|\>|\"|\'/g) !== null ||
                    text.targetbackgroundcolor.match(/\&|<|\>|\"|\'/g) !== null) {
                    showErrorMessages("text", "4", ct);
                    return false;
                }
                if (!pm_type &&
                    (text.field === "status_process_management" || text.targetfield === "status_process_management")) {
                    showErrorMessages("text", "5", ct);
                    return false;
                }
                config["text_row" + ct] = JSON.stringify(text);
            }
            config["text_row_number"] = String(text_row_num);
            return config;
        }

        function checkDateValues(config, pm_type) {
            var date_row_num = $("#conditionformat-plugin-date-tbody > tr").length - 1;
            for (var cd = 1; cd <= date_row_num; cd++) {
                var date = getValues("date", cd);
                if (date.field === "" && date.type === "" && date.targetfield === "") {
                    $("#conditionformat-plugin-date-tbody > tr:eq(" + cd + ")").remove();
                    date_row_num = date_row_num - 1;
                    cd--;
                    continue;
                }
                if ((date.field === "" || date.type === "" || date.targetfield === "") &&
                    !(date.field === "" && date.type === "" && date.targetfield === "")) {
                    showErrorMessages("date", "1", cd);
                    return false;
                }
                if (isNaN(date.value)) {
                    showErrorMessages("date", "2", cd);
                    return false;
                }
                if (date.value.indexOf(".") > -1) {
                    showErrorMessages("date", "3", cd);
                    return false;
                }
                if (date.targetcolor.slice(0, 1) !== "#") {
                    showErrorMessages("date", "4", cd);
                    return false;
                }
                if (date.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetcolor !== "#000000") {
                        showErrorMessages("date", "4", cd);
                        return false;
                    }
                }
                if (date.targetbackgroundcolor.slice(0, 1) !== "#") {
                    showErrorMessages("date", "5", cd);
                    return false;
                }
                if (date.targetbackgroundcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetbackgroundcolor !== "#") {
                        showErrorMessages("date", "5", cd);
                        return false;
                    }
                }
                if (date.value.match(/\&|<|\>|\"|\'/g) !== null ||
                    date.targetcolor.match(/\&|<|\>|\"|\'/g) !== null ||
                    date.targetbackgroundcolor.match(/\&|<|\>|\"|\'/g) !== null) {
                    showErrorMessages("date", "6", cd);
                    return false;
                }
                if (!pm_type && date.targetfield === "status_process_management") {
                    showErrorMessages("date", "7", cd);
                    return false;
                }
                config["date_row" + cd] = JSON.stringify(getValues("date", cd));
            }
            config["date_row_number"] = String(date_row_num);
            return config;
        }

        function checkValues(pm_type) {
            var config = {};
            config = checkTextValues(config, pm_type);
            if (!config) { return; }

            config = checkDateValues(config, pm_type);
            if (!config) { return; }

            //SaveConfig
            kintone.plugin.app.setConfig(config);
        }

        //Change color
        $(".conditionformat-plugin-column5").change(function() {
            $(this)[0].setAttribute("style", "color:" + $(this).val());
            $(this).parent('div').find('i')[0].setAttribute("style", "border-bottom-color:" + $(this).val());
            return true;
        });

        //Change backgroundcolor
        $(".conditionformat-plugin-column6").change(function() {
            $(this)[0].setAttribute("style", "background-color:" + $(this).val());
            $(this).parent('div').find('i')[0].setAttribute("style", "border-bottom-color:" + $(this).val());
            return true;
        });

        //Change color
        $(".conditionformat-plugin-column5-color").change(function() {
            var color_code = $(this).parent('div').find('input[type="color"]').val();
            var $el = $(this).parent('div').find('input[type="text"]');
            $el.val(color_code);
            $el[0].setAttribute("style", "color:" + color_code);
            $(this).parent('div').find('i')[0].setAttribute("style", "border-bottom-color:" + color_code);
            return true;
        });

        //Change color
        $(".conditionformat-plugin-column6-color").change(function() {
            var color_code = $(this).parent('div').find('input[type="color"]').val();
            var $el = $(this).parent('div').find('input[type="text"]');
            $el.val(color_code);
            $el[0].setAttribute("style", "background-color:" + color_code);
            $(this).parent('div').find('i')[0].setAttribute("style", "border-bottom-color:" + color_code);
            return true;
        });

        //Color picker
        $(".color-paint-brush").click(function() {
            $($(this).parents('td')[0]).find('input[type="color"]').click();
        });

        //Add Row
        $("#conditionformat-plugin-text-tbody .addList").click(function() {
            $("#conditionformat-plugin-text-tbody > tr").eq(0).clone(true).insertAfter(
                $(this).parent().parent()
            );
            checkRowNumber();
        });

        $("#conditionformat-plugin-date-tbody .addList").click(function() {
            $("#conditionformat-plugin-date-tbody > tr").eq(0).clone(true).insertAfter(
                $(this).parent().parent()
            );
            checkRowNumber();
        });

        // Remove Row
        $(".removeList").click(function() {
            $(this).parent().parent().remove();
            checkRowNumber();
        });

        //Save
        $("#conditionformat-submit").click(function() {
            var param2 = {"app": kintone.app.getId()};
            kintone.api(kintone.api.url("/k/v1/preview/app/status", true), "GET", param2, function(resp) {
                checkValues(resp.enable);
            });
        });

        //Cancel
        $("#conditionformat-cancel").click(function() {
            window.history.back();
        });
        setDropdown();
    });
})(jQuery, kintone.$PLUGIN_ID);
