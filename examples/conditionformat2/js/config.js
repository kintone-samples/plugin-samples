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
                'cf_text_title': '文字条件書式',
                'cf_date_title': '日付条件書式',
                'cf_text_column1': '書式条件フィールド',
                'cf_text_column2': '条件式',
                'cf_text_column3': '条件値',
                'cf_text_column4': '書式変更フィールド',
                'cf_text_column5': '文字色',
                'cf_text_column6': '背景色',
                'cf_text_column7': '文字サイズ',
                'cf_text_column8': '文字装飾',
                'cf_status_option': 'ステータス(プロセス管理)',
                'cf_text_column2_option1': '条件値を含む',
                'cf_text_column2_option2': '条件値を含まない',
                'cf_text_column2_option3': '=(等しい)',
                'cf_text_column2_option4': '≠(等しくない)',
                'cf_text_column2_option5': '≦(以下)',
                'cf_text_column2_option6': '<(より小さい)',
                'cf_text_column2_option7': '≧(以上)',
                'cf_text_column2_option8': '>(より大きい)',
                'cf_text_column7_option1': '変更なし',
                'cf_text_column7_option2': '小さい',
                'cf_text_column7_option3': 'やや小さい',
                'cf_text_column7_option4': 'やや大きい',
                'cf_text_column7_option5': '大きい',
                'cf_text_column8_option1': '変更なし',
                'cf_text_column8_option2': '太字',
                'cf_text_column8_option3': '下線',
                'cf_text_column8_option4': '打ち消し線',
                'cf_date_column1': '書式条件フィールド',
                'cf_date_column2': '条件式',
                'cf_date_column3': '条件値',
                'cf_date_column4': '書式変更フィールド',
                'cf_date_column5': '文字色',
                'cf_date_column6': '背景色',
                'cf_date_column7': '文字サイズ',
                'cf_date_column8': '文字装飾',
                'cf_date_column2_desc1': '今日から',
                'cf_date_column2_desc2': '日',
                'cf_date_column2_option1': '=(等しい)',
                'cf_date_column2_option2': '≠(等しくない)',
                'cf_date_column2_option3': '≦(以前)',
                'cf_date_column2_option4': '<(より前)',
                'cf_date_column2_option5': '≧(以後)',
                'cf_date_column2_option6': '>(より後)',
                'cf_date_column3_option1': '前',
                'cf_date_column3_option2': '後',
                'cf_date_column7_option1': '変更なし',
                'cf_date_column7_option2': '小さい',
                'cf_date_column7_option3': 'やや小さい',
                'cf_date_column7_option4': 'やや大きい',
                'cf_date_column7_option5': '大きい',
                'cf_date_column8_option1': '変更なし',
                'cf_date_column8_option2': '太字',
                'cf_date_column8_option3': '下線',
                'cf_date_column8_option4': '打ち消し線',
                'cf_plugin_submit': '     保存   ',
                'cf_plugin_cancel': '  キャンセル   ',
                'cf_required_field': '必須項目が入力されていません。'
            },
            'en': {
                'cf_text_title': 'Text Format Conditions',
                'cf_date_title': 'Date Format Conditions',
                'cf_text_column1': 'Field with condition',
                'cf_text_column2': 'Condition',
                'cf_text_column3': 'Value',
                'cf_text_column4': 'Field to format',
                'cf_text_column5': 'Font Color',
                'cf_text_column6': 'Background Color',
                'cf_text_column7': 'Font Size',
                'cf_text_column8': 'Style',
                'cf_status_option': 'Status(Process Management)',
                'cf_text_column2_option1': 'includes',
                'cf_text_column2_option2': 'doesn\'t include',
                'cf_text_column2_option3': '= (equal to)',
                'cf_text_column2_option4': '≠ (doesn\'t equal)',
                'cf_text_column2_option5': '≦ (equal or less)',
                'cf_text_column2_option6': '< (less than)',
                'cf_text_column2_option7': '≧ (equal or greater)',
                'cf_text_column2_option8': '> (greater than)',
                'cf_text_column7_option1': 'Normal',
                'cf_text_column7_option2': 'Very Small',
                'cf_text_column7_option3': 'Small',
                'cf_text_column7_option4': 'Large',
                'cf_text_column7_option5': 'Very Large',
                'cf_text_column8_option1': 'Normal',
                'cf_text_column8_option2': 'Bold',
                'cf_text_column8_option3': 'Underline',
                'cf_text_column8_option4': 'Strikethrough',
                'cf_date_column1': 'Field with condition',
                'cf_date_column2': 'Condition',
                'cf_date_column3': 'Value',
                'cf_date_column4': 'Field to format',
                'cf_date_column5': 'Font Color',
                'cf_date_column6': 'Background Color',
                'cf_date_column7': 'Font Size',
                'cf_date_column8': 'Style',
                'cf_date_column2_desc1': '',
                'cf_date_column2_desc2': 'days',
                'cf_date_column2_option1': '= (equal to)',
                'cf_date_column2_option2': '≠ (doesn\'t equal)',
                'cf_date_column2_option3': '≦ (equal or less)',
                'cf_date_column2_option4': '< (less than)',
                'cf_date_column2_option5': '≧ (equal or greater)',
                'cf_date_column2_option6': '> (greater than)',
                'cf_date_column3_option1': 'before today',
                'cf_date_column3_option2': 'after today',
                'cf_date_column7_option1': 'Normal',
                'cf_date_column7_option2': 'Very Small',
                'cf_date_column7_option3': 'Small',
                'cf_date_column7_option4': 'Large',
                'cf_date_column7_option5': 'Very Large',
                'cf_date_column8_option1': 'Normal',
                'cf_date_column8_option2': 'Bold',
                'cf_date_column8_option3': 'Underline',
                'cf_date_column8_option4': 'Strikethrough',
                'cf_plugin_submit': '     Save   ',
                'cf_plugin_cancel': '  Cancel   ',
                'cf_required_field': 'Required field is empty.'
            },
            'zh': {
                'cf_text_title': '文字条件格式',
                'cf_date_title': '日期条件格式',
                'cf_text_column1': '条件字段',
                'cf_text_column2': '条件公式',
                'cf_text_column3': '条件值',
                'cf_text_column4': '要更改格式的字段',
                'cf_text_column5': '字体颜色',
                'cf_text_column6': '背景色',
                'cf_text_column7': '文字大小',
                'cf_text_column8': '字体装饰',
                'cf_status_option': '状态(流程管理)',
                'cf_text_column2_option1': '包含条件值',
                'cf_text_column2_option2': '不包含条件值',
                'cf_text_column2_option3': '=(等于)',
                'cf_text_column2_option4': '≠(不等于)',
                'cf_text_column2_option5': '≦(小于或等于)',
                'cf_text_column2_option6': '<(小于)',
                'cf_text_column2_option7': '≧(大于或等于)',
                'cf_text_column2_option8': '>(大于)',
                'cf_text_column7_option1': '不更改',
                'cf_text_column7_option2': '小',
                'cf_text_column7_option3': '稍小',
                'cf_text_column7_option4': '稍大',
                'cf_text_column7_option5': '大',
                'cf_text_column8_option1': '不更改',
                'cf_text_column8_option2': '粗体',
                'cf_text_column8_option3': '下划线',
                'cf_text_column8_option4': '删除线',
                'cf_date_column1': '条件字段',
                'cf_date_column2': '条件公式',
                'cf_date_column3': '条件值',
                'cf_date_column4': '要更改格式的字段',
                'cf_date_column5': '字体颜色',
                'cf_date_column6': '背景色',
                'cf_date_column7': '字体大小',
                'cf_date_column8': '字体装饰',
                'cf_date_column2_desc1': '今日起',
                'cf_date_column2_desc2': '天',
                'cf_date_column2_option1': '=(等于)',
                'cf_date_column2_option2': '≠(不等于)',
                'cf_date_column2_option3': '≦(以前)',
                'cf_date_column2_option4': '<(早于)',
                'cf_date_column2_option5': '≧(以后)',
                'cf_date_column2_option6': '>(晚于)',
                'cf_date_column3_option1': '前',
                'cf_date_column3_option2': '后',
                'cf_date_column7_option1': '不更改',
                'cf_date_column7_option2': '小',
                'cf_date_column7_option3': '稍小',
                'cf_date_column7_option4': '稍大',
                'cf_date_column7_option5': '大',
                'cf_date_column8_option1': '不更改',
                'cf_date_column8_option2': '粗体',
                'cf_date_column8_option3': '下划线',
                'cf_date_column8_option4': '删除线',
                'cf_plugin_submit': '     保存   ',
                'cf_plugin_cancel': '  取消   ',
                'cf_required_field': '有必填项未填写。'
            }
        };

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#cf-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#cf-plugin').html(tmpl.render({'terms': i18n}));

        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        }

        function checkRowNumber() {
            if ($("#cf-plugin-text-tbody > tr").length === 2) {
                $("#cf-plugin-text-tbody > tr .removeList").eq(1).hide();
            } else {
                $("#cf-plugin-text-tbody > tr .removeList").eq(1).show();
            }

            if ($("#cf-plugin-date-tbody > tr").length === 2) {
                $("#cf-plugin-date-tbody > tr .removeList").eq(1).hide();
            } else {
                $("#cf-plugin-date-tbody > tr .removeList").eq(1).show();
            }
        }

        function setTextDefault() {
            for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
                $("#cf-plugin-text-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#cf-plugin-text-tbody > tr").eq(ti - 1)
                );
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column1").val(CONF["text_row" + ti]['field']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column2").val(CONF["text_row" + ti]['type']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column3").val(CONF["text_row" + ti]['value']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column4").
                    val(CONF["text_row" + ti]['targetfield']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column5").
                    val(CONF["text_row" + ti]['targetcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column6").
                    val(CONF["text_row" + ti]['targetbgcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column7").
                    val(CONF["text_row" + ti]['targetsize']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column8").
                    val(CONF["text_row" + ti]['targetfont']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column5").
                    css("color", CONF["text_row" + ti]['targetcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column6").
                    css("background-color", CONF["text_row" + ti]['targetbgcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column5").
                    parent('div').find('i').css("border-bottom-color", CONF["text_row" + ti]['targetcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column6").
                    parent('div').find('i').css("border-bottom-color", CONF["text_row" + ti]['targetbgcolor']);
                $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column5-color").
                    val(CONF["text_row" + ti]['targetcolor']);
                if (CONF["text_row" + ti]['targetbgcolor'] !== "#") {
                    $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column6-color").
                        val(CONF["text_row" + ti]['targetbgcolor']);
                } else {
                    $("#cf-plugin-text-tbody > tr:eq(" + ti + ") .cf-plugin-column6-color").val('#808080');
                }
            }
        }

        function setDateDefault() {
            for (var di = 1; di <= DATE_ROW_NUM; di++) {
                $("#cf-plugin-date-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#cf-plugin-date-tbody > tr").eq(di - 1)
                );
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column1").val(CONF["date_row" + di]['field']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column2").val(CONF["date_row" + di]['type']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column3").val(CONF["date_row" + di]['value']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column3-select2").
                    val(CONF["date_row" + di]['type2']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column4").
                    val(CONF["date_row" + di]['targetfield']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column5").
                    val(CONF["date_row" + di]['targetcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column6").
                    val(CONF["date_row" + di]['targetbgcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column7").
                    val(CONF["date_row" + di]['targetsize']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column8").
                    val(CONF["date_row" + di]['targetfont']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column5").
                    css("color", CONF["date_row" + di]['targetcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column6").
                    css("background-color", CONF["date_row" + di]['targetbgcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column5").
                    parent('div').find('i').css("border-bottom-color", CONF["date_row" + di]['targetcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column6").
                    parent('div').find('i').css("border-bottom-color", CONF["date_row" + di]['targetbgcolor']);
                $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column5-color").
                    val(CONF["date_row" + di]['targetcolor']);
                if (CONF["date_row" + di]['targetbgcolor'] !== "#") {
                    $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column6-color").
                        val(CONF["date_row" + di]['targetbgcolor']);
                } else {
                    $("#cf-plugin-date-tbody > tr:eq(" + di + ") .cf-plugin-column6-color").val('#808080');
                }
            }

        }

        function setDefault() {
            if (TEXT_ROW_NUM > 0) {
                setTextDefault();
            } else {
                // Insert Row
                $("#cf-plugin-text-tbody > tr").eq(0).clone(true).insertAfter($("#cf-plugin-text-tbody > tr")).eq(0);
            }

            if (DATE_ROW_NUM > 0) {
                setDateDefault();
            } else {
                // Insert Row
                $("#cf-plugin-date-tbody > tr").eq(0).clone(true).insertAfter($("#cf-plugin-date-tbody > tr")).eq(0);
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
                            $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1").append($option.clone());
                            $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                            $("#cf-plugin-date-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                            break;

                        case "DATE":
                        case "DATETIME":
                        case "CREATED_TIME":
                        case "UPDATED_TIME":
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1").append($option.clone());
                            $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                            $("#cf-plugin-date-tbody > tr:eq(0) .cf-plugin-column1").append($option.clone());
                            $("#cf-plugin-date-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                            break;

                        case "STATUS":
                            if (prop.enabled) {
                                $option.attr("value", escapeHtml(prop.code));
                                $option.text(terms[lang]["cf_status_option"]);
                                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column1").append($option.clone());
                                $("#cf-plugin-text-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                                $("#cf-plugin-date-tbody > tr:eq(0) .cf-plugin-column4").append($option.clone());
                            }
                            break;
                        default :
                            break;
                    }
                }
                setDefault();
            });
        }

        //Change color
        $(".cf-plugin-column5").change(function() {
            $(this).css("color", $(this).val());
            $(this).parent('div').find('i').css("border-bottom-color", $(this).val());
            return true;
        });

        //Change backgroundcolor
        $(".cf-plugin-column6").change(function() {
            $(this).css("background-color", $(this).val());
            $(this).parent('div').find('i').css("border-bottom-color", $(this).val());
            return true;
        });

        //Change color
        $(".cf-plugin-column5-color").change(function() {
            var color_code = $(this).parent('div').find('input[type="color"]').val();
            var $el = $(this).parent('div').find('input[type="text"]');
            $el.val(color_code);
            $el.css("color", color_code);
            $(this).parent('div').find('i').css("border-bottom-color", $(this).val());
            return true;
        });

        //Change color
        $(".cf-plugin-column6-color").change(function() {
            var color_code = $(this).parent('div').find('input[type="color"]').val();
            var $el = $(this).parent('div').find('input[type="text"]');
            $el.val(color_code);
            $el.css('background-color', color_code);
            $(this).parent('div').find('i').css("border-bottom-color", $(this).val());
            return true;
        });

        //Color picker
        $(".color-paint-brush").click(function() {
            $($(this).parents('td')[0]).find('input[type="color"]').click();
        });

        //Add Row
        $("#cf-plugin-text-tbody .addList").click(function() {
            $("#cf-plugin-text-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
            checkRowNumber();
        });

        $("#cf-plugin-date-tbody .addList").click(function() {
            $("#cf-plugin-date-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
            checkRowNumber();
        });

        // Remove Row
        $(".removeList").click(function() {
            $(this).parent('td').parent('tr').remove();
            checkRowNumber();
        });

        function createErrorMessage(type, error_num, row_num) {
            var user_lang = kintone.getLoginUser().language;
            var error_messages = {
                'ja': {
                    'text': {
                        "1": "文字条件書式の" + row_num + "行目の必須入力項目を入力してください",
                        "2": "文字条件書式の" + row_num + "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "3": "文字条件書式の" + row_num + "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "4": "文字条件書式の" + row_num + "行目の条件値または色に\n" + "HTML特殊文字(&, <, >, \", ')を入力することはできません"
                    },
                    'date': {
                        "1": "日付条件書式の" + row_num + "行目の必須入力項目を入力してください",
                        "2": "日付条件書式の" + row_num + "行目の条件値には\n半角数字を入力してください",
                        "3": "日付条件書式の" + row_num + "行目の条件値には\n整数を入力してください",
                        "4": "日付条件書式の" + row_num + "行目の文字色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "5": "日付条件書式の" + row_num + "行目の背景色には\nカラーコード「#000000-#FFFFFF」を入力してください",
                        "6": "日付条件書式の" + row_num + "行目の条件値または色に\nHTML特殊文字(&, <, >, \", ')を入力することはできません"
                    }
                },
                'en': {
                    'text': {
                        "1": "Required fields for Text Format Conditions row " + row_num + " are empty.",
                        "2": "Input \"#000000 ~ #FFFFFF\" for Font Color in Text Format Conditions row " +
                                row_num + ".",
                        "3": "Input \"#000000 ~ #FFFFFF\" for Background Color in Text Format Conditions row " +
                                row_num + ".",
                        "4": "Text Format Conditions row " + row_num + " includes HTML Characters."
                    },
                    'date': {
                        "1": "Required fields for Date Format Conditions row " + row_num + " are empty.",
                        "2": "Input integers for Value of Date Format Conditions row " + row_num + ".",
                        "3": "Input integers for Value of Date Format Conditions row " + row_num + ".",
                        "4": "Input \"#000000 ~ #FFFFFF\" for Font Color of Date Format Conditions row " +
                                row_num + ".",
                        "5": "Input \"#000000 ~ #FFFFFF\" for Background Color of Date Format Conditions row " +
                                row_num + ".",
                        "6": "Date Format Conditions row " + row_num + " includes HTML Characters."
                    }
                },
                'zh': {
                    'text': {
                        "1": "文字条件格式的第" + row_num + "行有必填项未填写",
                        "2": "文字条件格式的第" + row_num + "行的字体颜色框中\n请输入颜色代码[#000000-#FFFFFF]",
                        "3": "文字条件格式的第" + row_num + "行的背景色框中\n请输入颜色代码[#000000-#FFFFFF]",
                        "4": "文字条件格式的第" + row_num + "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", ')"
                    },
                    'date': {
                        "1": "日期条件格式的第" + row_num + "行有必填项未填写",
                        "2": "日期条件格式的第" + row_num + "行的条件值\n仅可输入半角数字",
                        "3": "日期条件格式的第" + row_num + "行的条件值\n仅可输入整数",
                        "4": "日期条件格式的第" + row_num + "行的字体颜色\n请输入颜色代码[#000000-#FFFFFF]",
                        "5": "日期条件格式的第" + row_num + "行的背景色\n请输入颜色代码[#000000-#FFFFFF]",
                        "6": "日期条件格式的第" + row_num + "行的条件值或颜色不可输入\nHTML特殊符号(&, <, >, \", ')"
                    }
                }
            };
            return error_messages[user_lang][type][error_num];
        }

        function checkConfigTextValues(config) {
            var text_row_num = Number(config["text_row_number"]);
            for (var ct = 1; ct <= text_row_num; ct++) {
                var text = JSON.parse(config["text_row" + ct]);
                if (!text.field || !text.type || !text.targetfield) {
                    throw new Error(createErrorMessage("text", "1", ct));
                }

                if (text.targetcolor.slice(0, 1) !== "#") {
                    throw new Error(createErrorMessage("text", "2", ct));
                }

                if (text.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetcolor !== "#000000") {
                        throw new Error(createErrorMessage("text", "2", ct));
                    }
                }

                if (text.targetbgcolor.slice(0, 1) !== "#") {
                    throw new Error(createErrorMessage("text", "3", ct));
                }

                if (text.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (text.targetbgcolor !== "#") {
                        throw new Error(createErrorMessage("text", "3", ct));
                    }
                }
                if (text.value.match(/&|<|>|"|'/g) !== null ||
                    text.targetcolor.match(/&|<|>|"|'/g) !== null ||
                    text.targetbgcolor.match(/&|<|>|"|'/g) !== null) {
                    throw new Error(createErrorMessage("text", "4", ct));
                }
            }
        }

        function checkConfigDateValues(config) {
            var date_row_num = Number(config["date_row_number"]);
            for (var cd = 1; cd <= date_row_num; cd++) {
                var date = JSON.parse(config["date_row" + cd]);
                if (!date.field || !date.type || !date.targetfield || !date.value) {
                    throw new Error(createErrorMessage("date", "1", cd));
                }
                if (isNaN(date.value)) {
                    throw new Error(createErrorMessage("date", "2", cd));
                }
                if (date.value.indexOf(".") > -1) {
                    throw new Error(createErrorMessage("date", "3", cd));
                }
                if (date.targetcolor.slice(0, 1) !== "#") {
                    throw new Error(createErrorMessage("date", "4", cd));
                }
                if (date.targetcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetcolor !== "#000000") {
                        throw new Error(createErrorMessage("date", "4", cd));
                    }
                }
                if (date.targetbgcolor.slice(0, 1) !== "#") {
                    throw new Error(createErrorMessage("date", "5", cd));
                }
                if (date.targetbgcolor.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                    if (date.targetbgcolor !== "#") {
                        throw new Error(createErrorMessage("date", "5", cd));
                    }
                }
                if (date.value.match(/&|<|>|"|'/g) !== null ||
                    date.targetcolor.match(/&|<|>|"|'/g) !== null ||
                    date.targetbgcolor.match(/&|<|>|"|'/g) !== null) {
                    throw new Error(createErrorMessage("date", "6", cd));
                }
            }
        }

        function getValues(type, num) {
            switch (type) {
                case "text":
                    return {
                        "field": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column1").val(),
                        "type": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column2").val(),
                        "value": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column3").val().toString(),
                        "targetfield": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column4").val(),
                        "targetcolor": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column5").val(),
                        "targetbgcolor": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column6").val(),
                        "targetsize": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column7").val(),
                        "targetfont": $("#cf-plugin-text-tbody > tr:eq(" + num + ") .cf-plugin-column8").val()
                    };
                case "date":
                    return {
                        "field": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column1").val(),
                        "type": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column2").val(),
                        "value": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column3").val().toString(),
                        "type2": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column3-select2").val(),
                        "targetfield": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column4").val(),
                        "targetcolor": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column5").val(),
                        "targetbgcolor": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column6").val(),
                        "targetsize": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column7").val(),
                        "targetfont": $("#cf-plugin-date-tbody > tr:eq(" + num + ") .cf-plugin-column8").val()
                    };
                default:
                    return "";
            }
        }

        function createConfig() {
            var config = {};
            var text_row_num = $("#cf-plugin-text-tbody > tr").length - 1;
            for (var ct = 1; ct <= text_row_num; ct++) {
                var text = getValues("text", ct);
                if (text.field === "" && text.type === "" && text.targetfield === "") {
                    //Remove unnecessary row
                    $("#cf-plugin-text-tbody > tr:eq(" + ct + ")").remove();
                    text_row_num = text_row_num - 1;
                    ct--;
                    continue;
                }
                config["text_row" + ct] = JSON.stringify(text);
            }
            config["text_row_number"] = String(text_row_num);
            var date_row_num = $("#cf-plugin-date-tbody > tr").length - 1;
            for (var cd = 1; cd <= date_row_num; cd++) {
                var date = getValues("date", cd);
                if (date.field === "" && date.type === "" && date.targetfield === "") {
                    //Remove unnecessary row
                    $("#cf-plugin-date-tbody > tr:eq(" + cd + ")").remove();
                    date_row_num = date_row_num - 1;
                    cd--;
                    continue;
                }
                config["date_row" + cd] = JSON.stringify(getValues("date", cd));
            }
            config["date_row_number"] = String(date_row_num);
            return config;
        }

        //Save
        $("#cf-submit").click(function() {
            try {
                var config = createConfig();
                checkConfigTextValues(config);
                checkConfigDateValues(config);
                kintone.plugin.app.setConfig(config);
            } catch (error) {
                alert(error.message);
            }
        });

        //Cancel
        $("#cf-cancel").click(function() {
            window.history.back();
        });
        setDropdown();
    });
})(jQuery, kintone.$PLUGIN_ID);
