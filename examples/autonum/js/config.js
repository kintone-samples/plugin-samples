/*
 * Auto Number plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

(function(PLUGIN_ID) {
    "use strict";

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    //「日付形式」と「採番リセットタイミング」整合性チェック
    function checkResetTiming() {

        var dateformat	= $("select[name='dateselect']").val();
        switch (dateformat) {

            case "YYYYMMDD":
                $('#autonum-radio1').prop('disabled', false);
                $('#autonum-radio2').prop('disabled', false);
                $('#autonum-radio3').prop('disabled', false);
                return;

            case "YYYYMM":
                $('#autonum-radio1').prop('disabled', false);
                $('#autonum-radio2').prop('disabled', false);
                $('#autonum-radio3').prop('disabled', true);
                return;

            case "MMDD":
                $('#autonum-radio1').prop('disabled', true);
                $('#autonum-radio2').prop('disabled', false);
                $('#autonum-radio3').prop('disabled', false);
                return;

            case "YYYY":
                $('#autonum-radio1').prop('disabled', false);
                $('#autonum-radio2').prop('disabled', true);
                $('#autonum-radio3').prop('disabled', true);
                return;

            case "YY":
                $('#autonum-radio1').prop('disabled', false);
                $('#autonum-radio2').prop('disabled', true);
                $('#autonum-radio3').prop('disabled', true);
                return;

            case "null":
                $('#autonum-radio1').prop('disabled', true);
                $('#autonum-radio2').prop('disabled', true);
                $('#autonum-radio3').prop('disabled', true);
                return;

            default:
                return;
        }
    }

    //採番書式選択と
    function checkAutonumFormat() {

        var autonum_format	= $("select[name='select']").val();
        switch (autonum_format) {

            case "format1"://連番
                $("select[name='dateselect']").val(["null"]);
                $('#autonum-text').val("");
                $("select[name='dateselect']").prop('disabled', true);
                $('#autonum-text').prop('disabled', true);
                return;

            case "format2"://日付 + 連番
                $('#autonum-text').val("");
                $("select[name='dateselect']").prop('disabled', false);
                $('#autonum-text').prop('disabled', true);
                return;

            case "format3"://日付 + テキスト + 連番
                $("select[name='dateselect']").prop('disabled', false);
                $('#autonum-text').prop('disabled', false);
                return;

            case "format4"://テキスト + 連番
                $("select[name='dateselect']").val(["null"]);
                $("select[name='dateselect']").prop('disabled', true);
                $('#autonum-text').prop('disabled', false);
                return;

            case "format5"://テキスト + 日付 + 連番
                $("select[name='dateselect']").prop('disabled', false);
                $('#autonum-text').prop('disabled', false);
                return;

            case "null"://選択なしの場合
                $("select[name='dateselect']").val(["null"]);
                $('#autonum-text').val("");
                $("select[name='dateselect']").prop('disabled', true);
                $('#autonum-text').prop('disabled', true);
                return;

            default:
                return;
        }
    }

    function setDefault() {

        var conf = kintone.plugin.app.getConfig(PLUGIN_ID);

        //既に値が設定されている場合はフィールドに値を設定する
        if (Object.keys(conf).length !== 0) {
            $("select[name='autonum_select']").val(conf['autofield']);
            $("select[name='select']").val(conf['format']);
            $("select[name='dateselect']").val(conf['dateformat']);
            $("select[name='connectiveselect']").val(conf['connective']);
            $('#autonum-text').val(conf['text']);
            $('#autonum-image').val(conf['image']);
            $("input[name='radio']").val([conf['timing']]);
        }
        checkAutonumFormat();
        checkResetTiming();
    }

    function setDropdown() {
        // 自動採番フィールド選択肢作成
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()}, function(resp) {
            for (var i = 0; i < resp.properties.length; i++) {
                var prop = resp.properties[i];
                if (prop.type === 'SINGLE_LINE_TEXT') {
                    var option = $('<option/>');
                    option.attr('value', escapeHtml(prop.code));
                    option.text(escapeHtml(prop.label));
                    $('#autonum-fieldselect').append(option);
                }
            }
            setDefault();
        });
    }

    //プレビュー用の文字を作る関数 例：20151101-text-00001
    function format_image(selectformat) {

        var date = "";
        var text = $('#autonum-text').val();
        var number = "00001";
        var connective = "";
        var date_val = $("select[name='dateselect']").val();
        var connective_val = $("select[name='connectiveselect']").val();

        if (date_val !== "null") {
            date = moment().format(date_val);
        }
        if (connective_val !== "null") {
            connective = connective_val;
        }

        switch (selectformat) {
            case "format1":
                return (number);

            case "format2":
                return (date + connective + number);

            case "format3":
                return (date + connective + text + connective + number);

            case "format4":
                return (text + connective + number);

            case "format5":
                return (text + connective + date + connective + number);

            default:
                return "";
        }
    }

    //自動採番の書式を決める関数
    function format_type(selectformat) {

        switch (selectformat) {
            case "format1":
                return ["number", "", ""];

            case "format2":
                return ["date", "number", ""];

            case "format3":
                return ["date", "text", "number"];

            case "format4":
                return ["text", "number", ""];

            case "format5":
                return ["text", "date", "number"];

            default:
                return ["null", "", ""];
        }
    }

    // 採番書式選択、日付書式、テキスト設定が変更された場合、採番イメージを変更
    $('.formatselect,#autonum-dateformat,#autonum-connective,#autonum-text').change(function() {
        var format = format_image($("select[name='select']").val());
        $('#autonum-image').val(format);
    });

    // 採番書式選択が変更された場合、日付書式もしくはテキスト入力を非活性に変更。
    $('.formatselect').change(function() {
        checkAutonumFormat();
    });

    // 日付書式が変更された場合、一部のラジオボタンを非活性に変更。
    $('#autonum-dateformat').change(function() {
        checkResetTiming();
        $("input[name='radio']").val(["0"]);
    });

    //「保存する」ボタン押下時に入力情報を設定する
    $('#autonum-submit').click(function() {
        var config = [];
        var autofield = $("select[name='autonum_select']").val();
        var format = format_type($("select[name='select']").val());
        var image = $('#autonum-image').val();
        var text = $('#autonum-text').val();
        var dateformat = $("select[name='dateselect']").val();
        var timing = $("input[name='radio']:checked").val();
        var connective = $("select[name='connectiveselect']").val();

        //「自動採番フィールド」未入力チェック
        if (autofield === "null") {
            swal('Error!', '自動採番フィールドが選択されていません', 'error');
            return;
        }

        // 採番書籍選択未選択チェック
        if (format[0] === "null") {
            swal('Error!', '書式が選択されていません', 'error');
            return;
        }

        // 接続語未選択チェック
        if (connective === "null") {
            swal('Error!', '接続語が選択されていません', 'error');
            return;
        }

        //「書式」と「日付形式」未選択チェック
        if ((format[0] === "date" || format[1] === "date") && dateformat === "null") {
            swal('Error!', '日付形式を選択してください', 'error');
            return;
        }

        //「書式」と「テキスト設定」未入力チェック
        if ((format[0] === "text" || format[1] === "text") && text === "") {
            swal('Error!', 'テキスト設定が入力されていません', 'error');
            return;
        }

        //テキストに接続語(-, _)が含まれるときエラー
        if (text.match(/-|_/g) !== null) {
            swal('Error!', 'テキストに接続語(-, _)を\n入力することはできません', 'error');
            return;
        }

        //テキストにHTML特殊文字(&, <, >, ", ')が含まれるときエラー
        if (text.match(/&|<|>|"|'/g) !== null) {
            swal('Error!', 'テキストにHTML特殊文字(&, <, >, \", \')を\n入力することはできません', 'error');
            return;
        }

        // 設定文書の値を返す
        config['autofield'] = autofield;
        config['format'] = $("select[name='select']").val();
        config['format1'] = format[0];//date
        config['format2'] = format[1];//number
        config['format3'] = format[2];//textの何れかが入る。
        config['dateformat'] = dateformat;
        config['text'] = text;
        config['image'] = image;
        config['timing'] = timing;
        config['connective'] = connective;

        kintone.plugin.app.setConfig(config);
    });

    //「キャンセル」ボタン押下時の処理
    $('#autonum-cancel').click(function() {
        history.back();
    });
    setDropdown();

})(kintone.$PLUGIN_ID);
