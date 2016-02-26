/*
 * Condition Format plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    // 秘密鍵の設定
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
    var MAX_LINE = 10;//行数指定

    $(function() {
        // ツールチップ機能を適用
        $(".conditionformat-plugin-tooltip").tooltip();
    });

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function setDefault() {
        //既に値が設定されている場合はフィールドに値を設定する
        if (CONF["body_text"]) {
            var body_text = JSON.parse(CONF["body_text"]);
            var body_date = JSON.parse(CONF["body_date"]);

            for (var bm = 1; bm < MAX_LINE + 1; bm++) {
                $("#conditionformat-cfield_text_" + bm).val(body_text["cfield_text_" + bm]["value"]);
                $("#conditionformat-ctype_text_" + bm).val(body_text["ctype_text_" + bm]["value"]);
                $("#conditionformat-cvalue_text_" + bm).val(body_text["cvalue_text_" + bm]["value"]);
                $("#conditionformat-tfield_text_" + bm).val(body_text["tfield_text_" + bm]["value"]);
                $("#conditionformat-tcolor_text_" + bm).val(body_text["tcolor_text_" + bm]["value"]);
                $("#conditionformat-tsize_text_" + bm).val(body_text["tsize_text_" + bm]["value"]);
                $("#conditionformat-tcolor_text_" + bm)[0].
                setAttribute("style", "color:" + body_text["tcolor_text_" + bm]["value"]);

                $("#conditionformat-cfield_date_" + bm).val(body_date["cfield_date_" + bm]["value"]);
                $("#conditionformat-ctype_date_" + bm).val(body_date["ctype_date_" + bm]["value"]);
                $("#conditionformat-cvalue_date_" + bm).val(body_date["cvalue_date_" + bm]["value"]);
                $("#conditionformat-tfield_date_" + bm).val(body_date["tfield_date_" + bm]["value"]);
                $("#conditionformat-tcolor_date_" + bm).val(body_date["tcolor_date_" + bm]["value"]);
                $("#conditionformat-tsize_date_" + bm).val(body_date["tsize_date_" + bm]["value"]);
                $("#conditionformat-tcolor_date_" + bm)[0].
                setAttribute("style", "color:" + body_date["tcolor_date_" + bm]["value"]);
            }
        }
    }

    function setDropdown() {
        // フォーム設計情報を取得し、選択ボックスに代入する
        kintone.api(kintone.api.url("/k/v1/preview/form", true), "GET", {"app": kintone.app.getId()}, function(resp) {
            var $option_status = $("<option>");
            for (var st = 1; st < MAX_LINE + 1; st++) {
                $option_status.attr("value", "status");
                $option_status.text("ステータス");
                $("#conditionformat-cfield_text_" + st).append($option_status.clone());
                $("#conditionformat-tfield_text_" + st).append($option_status.clone());
                $("#conditionformat-tfield_date_" + st).append($option_status.clone());
            }
            for (var i = 0; i < resp.properties.length; i++) {
                var prop = resp.properties[i];
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

                        for (var tm = 1; tm < MAX_LINE + 1; tm++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#conditionformat-cfield_text_" + tm).append($option.clone());
                            $("#conditionformat-tfield_text_" + tm).append($option.clone());
                            $("#conditionformat-tfield_date_" + tm).append($option.clone());
                        }
                        break;

                    case "DATE":
                    case "DATETIME":
                    case "CREATED_TIME":
                    case "UPDATED_TIME":
                        for (var dm = 1; dm < MAX_LINE + 1; dm++) {
                            $option.attr("value", escapeHtml(prop.code));
                            $option.text(escapeHtml(prop.label));
                            $("#conditionformat-tfield_text_" + dm).append($option.clone());
                            $("#conditionformat-cfield_date_" + dm).append($option.clone());
                            $("#conditionformat-tfield_date_" + dm).append($option.clone());
                        }
                        break;

                    default :
                        break;
                }
            }
            setDefault();
        });
    }

    function saveConfig(val) {
        var config = [];
        var body_text = {};
        var body_date = {};
        for (var si = 0; si < MAX_LINE; si++) {
            var t = val[si].text;
            var d = val[si].date;
            var m = si + 1;

            body_text["cfield_text_" + m] = {"value": t.fieldText};
            body_text["ctype_text_" + m] = {"value": t.typeText};
            body_text["cvalue_text_" + m] = {"value": t.valueText};
            body_text["tfield_text_" + m] = {"value": t.targetFieldText};
            body_text["tcolor_text_" + m] = {"value": t.targetColorText};
            body_text["tsize_text_" + m] = {"value": t.targetSizeText};

            body_date["cfield_date_" + m] = {"value": d.fieldDate};
            body_date["ctype_date_" + m] = {"value": d.typeDate};
            body_date["cvalue_date_" + m] = {"value": d.valueDate};
            body_date["tfield_date_" + m] = {"value": d.targetFieldDate};
            body_date["tcolor_date_" + m] = {"value": d.targetColorDate};
            body_date["tsize_date_" + m] = {"value": d.targetSizeDate};
        }
        config["body_text"] = JSON.stringify(body_text);
        config["body_date"] = JSON.stringify(body_date);
        config["line_number"] = String(MAX_LINE);

        kintone.plugin.app.setConfig(config);
    }

    function checkValues(val) {
        for (var ci = 0; ci < MAX_LINE; ci++) {
            var t = val[ci].text;
            var d = val[ci].date;

            //文字条件書式必須入力項目チェック
            if ((t.fieldText === "" || t.typeText === "" || t.valueText === "" || t.targetFieldText === "") &&
                !(t.fieldText === "" && t.typeText === "" && t.valueText === "" && t.targetFieldText === "")) {
                alert("文字条件書式の" + (ci + 1) + "行目の必須入力項目を\n入力してください");
                return false;
            }

            //日付条件書式必須入力項目チェック

            if ((d.fieldDate === "" || d.typeDate === "" || d.targetFieldDate === "") &&
                !(d.fieldDate === "" && d.typeDate === "" && d.targetFieldDate === "")) {
                alert("日付条件書式の" + (ci + 1) + "行目の必須入力項目を\n入力してください");
                return false;
            }

            //HTML特殊文字(&, <, >, ", ')が含まれるときエラー
            if (t.valueText.match(/\&|<|\>|\"|\'/g) !== null || t.targetColorText.match(/\&|<|\>|\"|\'/g) !== null ||
                d.valueDate.match(/\&|<|\>|\"|\'/g) !== null || d.targetColorDate.match(/\&|<|\>|\"|\'/g) !== null) {
                alert("条件値または色にHTML特殊文字(&, <, >, \", \')を\n入力することはできません");
                return false;
            }

            //日付条件書式の条件値に数値とマイナス以外が入力されているときエラー
            if (isNaN(d.valueDate)) {
                alert("日付条件書式の" + (ci + 1) + "行目の条件値には\n半角数字もしくは - (マイナス)を入力してください");
                return false;
            }

            //日付条件書式の条件値に.(小数点)を入力されているときエラー
            if (d.valueDate.indexOf(".") > -1) {
                alert("日付条件書式の" + (ci + 1) + "行目の条件値には\n整数を入力してください");
                return false;
            }

            //文字条件書式の色のはじめの文字が#でなければエラー
            if (t.targetColorText.slice(0, 1) !== "#") {
                alert("文字条件書式の" + (ci + 1) + "行目の色には\n「#000000-#FFFFFF」を入力してください");
                return false;
            }

            //日付条件書式の色のはじめの文字が#でなければエラー
            if (d.targetColorDate.slice(0, 1) !== "#") {
                alert("日付条件書式の" + (ci + 1) + "行目の色には\n「#000000-#FFFFFF」を入力してください");
                return false;
            }

            //文字条件書式の色に#000000-#FFFFFF以外が入力されているときエラー
            if (t.targetColorText.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                if (t.targetColorText !== "#000000") {
                    alert("文字条件書式の" + (ci + 1) + "行目の色には\nカラーコード「#000000-#FFFFFF」を入力してください");
                    return false;
                }
            }

            //日付条件書式の色に#000000-#FFFFFF以外が入力されているときエラー
            if (d.targetColorDate.slice(1, 7).match(/[0-9A-Fa-f]{6}/) === null) {
                if (d.targetColorDate !== "#000000") {
                    alert("日付条件書式の" + (ci + 1) + "行目の色には\nカラーコード「#000000-#FFFFFF」を入力してください");
                    return false;
                }
            }
        }
        return true;
    }

    //入力した値を取得。
    function getValues(m) {
        return {
            text: {
                fieldText: $("#conditionformat-cfield_text_" + m).val(),
                typeText: $("#conditionformat-ctype_text_" + m).val(),
                valueText: $("#conditionformat-cvalue_text_" + m).val(),
                targetFieldText: $("#conditionformat-tfield_text_" + m).val(),
                targetColorText: $("#conditionformat-tcolor_text_" + m).val(),
                targetSizeText: $("#conditionformat-tsize_text_" + m).val()
            },
            date: {
                fieldDate: $("#conditionformat-cfield_date_" + m).val(),
                typeDate: $("#conditionformat-ctype_date_" + m).val(),
                valueDate: $("#conditionformat-cvalue_date_" + m).val(),
                targetFieldDate: $("#conditionformat-tfield_date_" + m).val(),
                targetColorDate: $("#conditionformat-tcolor_date_" + m).val(),
                targetSizeDate: $("#conditionformat-tsize_date_" + m).val()
            }
        };
    }

    //色変更。
    $(".conditionformat-color").change(function() {
        var $el = $(this).parents("tr");
        $($el[0]).find(".conditionformat-color");
        $($el[0]).find(".conditionformat-color")[0].setAttribute("style", "color:" + $(this).val());
        return true;
    });

    //クリアボタン押下時に押下された行を初期値にする。
    $(".conditionformat-clear-buttons").click(function() {
        var $el = $(this).parents("tr");
        $($el[0]).find("select").val("");
        $($el[0]).find(".conditionformat-cvalue").val("");
        $($el[0]).find(".conditionformat-cvalue-date").val("0");
        $($el[0]).find(".conditionformat-color").val("#000000");
        $($el[0]).find(".conditionformat-color")[0].setAttribute("style", "color:" + "#000000");
    });

    //「保存する」ボタン押下時に入力情報を設定する
    $("#conditionformat-submit").click(function() {
        var vals = [];
        for (var gm = 1; gm < MAX_LINE + 1; gm++) {
            vals.push(getValues(gm));
        }
        if (checkValues(vals)) {
            saveConfig(vals);
        }
    });

    //「キャンセル」ボタン押下時の処理
    $("#conditionformat-cancel").click(function() {
        window.history.back();
    });

    setDropdown();
})(jQuery, kintone.$PLUGIN_ID);
