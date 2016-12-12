/*
 * New Condition Format plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);

    //設定値読み込み
    if (!CONFIG) {
        return false;
    }

    var BODY_TEXT = JSON.parse(CONFIG["body_text"]);
    var BODY_DATE = JSON.parse(CONFIG["body_date"]);
    var MAX_LINE = Number(CONFIG["line_number"]);

    function changeStyle(el, color, backgroundcolor, size) {
        if (el) {
            if (color) {
                el.style.color = color;
            }
            if (backgroundcolor) {
                el.style.backgroundColor = backgroundcolor;
            }
            if (size) {
                el.style.fontSize = size;
            } else {
                el.style.fontSize = "14px";
            }
        }
    }

    //条件チェック
    function checkTextFormat(field, value, type) {
        var field_text = "";
        var value_text = "";

        //フィールドの値が数値のとき、数値に変換して比較。
        if (field.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
            if (type === "match" || type === "unmatch") {
                field_text = field;
            } else {
                field_text = Number(field);
            }
        } else {
            field_text = field;
        }

        //条件値が数値のとき、数値に変換して比較。
        if (value.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
            if (type === "match" || type === "unmatch") {
                value_text = value;
            } else {
                value_text = Number(value);
            }
        } else {
            value_text = value;
        }

        switch (type) {
            case "match":
                if (field_text.indexOf(value_text) !== -1) {
                    return true;
                }
                break;
            case "unmatch":
                if (field_text.indexOf(value_text) === -1) {
                    return true;
                }
                break;
            case "==":
                if (field_text === value_text) {
                    return true;
                }
                break;
            case "!=":
                if (field_text !== value_text) {
                    return true;
                }
                break;
            case "<=":
                if (field_text <= value_text) {
                    return true;
                }
                break;
            case "<":
                if (field_text < value_text) {
                    return true;
                }
                break;
            case ">=":
                if (field_text >= value_text) {
                    return true;
                }
                break;
            case ">":
                if (field_text > value_text) {
                    return true;
                }
                break;
            default:
                return false;
        }
        return false;
    }
    function checkDateFormat(field, value, type) {

        if (!field) {
            return false;
        }
        var num = Number(value);//入力日数
        var field_date = moment(field).format("YYYY-MM-DD 00:00"); //対象フィールドの日付
        var value_date = moment().add(num, "days").format("YYYY-MM-DD 00:00");//条件値 = 今日の日付 + (入力日数)
        var diff = moment(field_date).diff(moment(value_date), "days");//(対象フィールドの日付-条件値）

        switch (type) {
            case "==":
                if (diff === 0) {
                    return true;
                }
                break;
            case "!=":
                if (diff !== 0) {
                    return true;
                }
                break;
            case "<=":
                if (diff <= 0) {
                    return true;
                }
                break;
            case "<":
                if (diff < 0) {
                    return true;
                }
                break;
            case ">=":
                if (diff >= 0) {
                    return true;
                }
                break;
            case ">":
                if (diff > 0) {
                    return true;
                }
                break;
            default:
                return false;
        }
        return false;
    }

    function changeStatusCode(record, string) {
        if (string === "status") {
            var fieldcode = Object.keys(record);
            for (var n in fieldcode) {
                if (record[fieldcode[n]]["type"] === "STATUS") {
                    return fieldcode[n];
                }
            }
        }
        return string;
    }

    //条件書式値取得
    function getTextFormatValues(tm) {
        return {
            fieldText: BODY_TEXT["cfield_text_" + tm]["value"],//書式条件フィールド
            typeText: BODY_TEXT["ctype_text_" + tm]["value"],//条件式
            valueText: BODY_TEXT["cvalue_text_" + tm]["value"],//条件値
            targetFieldText: BODY_TEXT["tfield_text_" + tm]["value"],//書式編集対象フィールド
            targetColorText: BODY_TEXT["tcolor_text_" + tm]["value"],//文字色
            targetBackgroundColorText: BODY_TEXT["tbgcolor_text_" + tm]["value"],//背景色
            targetSizeText: BODY_TEXT["tsize_text_" + tm]["value"]//サイズ
        };
    }
    function getDateFormatValues(dm) {
        return {
            fieldDate: BODY_DATE["cfield_date_" + dm]["value"],//書式条件フィールド
            typeDate: BODY_DATE["ctype_date_" + dm]["value"],//条件式
            valueDate: BODY_DATE["cvalue_date_" + dm]["value"],//条件値
            targetFieldDate: BODY_DATE["tfield_date_" + dm]["value"],//書式編集対象フィールド
            targetColorDate: BODY_DATE["tcolor_date_" + dm]["value"],//文字色
            targetBackgroundColorDate: BODY_DATE["tbgcolor_date_" + dm]["value"],//背景色
            targetSizeDate: BODY_DATE["tsize_date_" + dm]["value"]//サイズ
        };
    }

    //レコード一覧画面 条件チェック及び書式変更
    function setIndexFormat(event) {
        var record = [];
        var t = [];
        var d = [];
        for (var m = 1; m < MAX_LINE + 1; m++) {
            if (BODY_TEXT["cfield_text_" + m]["value"] !== "") {
                t.push(getTextFormatValues(m));
            }
            if (BODY_DATE["cfield_date_" + m]["value"] !== "") {
                d.push(getDateFormatValues(m));
            }
        }
        //ステータスコードチェック
        for (var st = 0; st < t.length; st++) {
            t[st].targetFieldText = changeStatusCode(event.records[0], t[st].targetFieldText);
            t[st].fieldText = changeStatusCode(event.records[0], t[st].fieldText);
        }
        for (var sd = 0; sd < d.length; sd++) {
            d[sd].targetFieldDate = changeStatusCode(event.records[0], d[sd].targetFieldDate);
        }

        //文字条件書式
        for (var ti2 = 0; ti2 < t.length; ti2++) {
            var el_text2 = kintone.app.getFieldElements(t[ti2].targetFieldText);
            if (!el_text2) {
                continue;
            }
            for (var tn = 0; tn < el_text2.length; tn++) {
                record = event.records[tn];
                var text2_value = record[t[ti2].fieldText]["value"];
                if (t[ti2].fieldText === "status") {
                    text2_value = record[changeStatusCode(t[ti2].fieldText)]["value"];
                }
                //チェックボックス、複数選択の判別
                if (Array.isArray(text2_value)) {
                    for (var a = 0; a < text2_value.length; a++) {
                        if (checkTextFormat(text2_value[a], t[ti2].valueText, t[ti2].typeText)) {
                            //書式変更
                            changeStyle(el_text2[tn], t[ti2].targetColorText,
                            t[ti2].targetBackgroundColorText, t[ti2].targetSizeText);
                            break;
                        }
                    }
                } else if (checkTextFormat(text2_value, t[ti2].valueText, t[ti2].typeText)) {
                    //書式変更
                    changeStyle(el_text2[tn], t[ti2].targetColorText,
                    t[ti2].targetBackgroundColorText, t[ti2].targetSizeText);
                }
            }
        }

        //日付条件書式
        for (var di2 = 0; di2 < d.length; di2++) {
            var el_date2 = kintone.app.getFieldElements(d[di2].targetFieldDate);
            if (!el_date2) {
                continue;
            }
            for (var dn = 0; dn < el_date2.length; dn++) {
                record = event.records[dn];
                if (checkDateFormat(record[d[di2].fieldDate]["value"],
                    d[di2].valueDate, d[di2].typeDate)) {
                    //書式変更
                    changeStyle(el_date2[dn], d[di2].targetColorDate,
                    d[di2].targetBackgroundColorDate, d[di2].targetSizeDate);
                }
            }
        }
    }
    //レコード詳細画面 条件チェック及び書式変更
    function setDetailFormat(event) {
        var record = event.record;
        var t = [];
        var d = [];
        for (var m = 1; m < MAX_LINE + 1; m++) {
            if (BODY_TEXT["cfield_text_" + m]["value"] !== "") {
                t.push(getTextFormatValues(m));
            }
            if (BODY_DATE["cfield_date_" + m]["value"] !== "") {
                d.push(getDateFormatValues(m));
            }
        }
        //ステータスコードチェック
        for (var st = 0; st < t.length; st++) {
            t[st].targetFieldText = changeStatusCode(event.record, t[st].targetFieldText);
            t[st].fieldText = changeStatusCode(event.record, t[st].fieldText);
        }
        for (var sd = 0; sd < d.length; sd++) {
            d[sd].targetFieldDate = changeStatusCode(event.record, d[sd].targetFieldDate);
        }

        //文字条件書式
        for (var ti = 0; ti < t.length; ti++) {
            var el_text = kintone.app.record.getFieldElement(t[ti].targetFieldText);
            if (!el_text) {
                continue;
            }
            var text_value = record[t[ti].fieldText]["value"];
            if (Array.isArray(text_value)) {
                for (var a = 0; a < text_value.length; a++) {
                    if (checkTextFormat(text_value[a], t[ti].valueText, t[ti].typeText)) {
                        //書式変更
                        changeStyle(el_text, t[ti].targetColorText,
                        t[ti].targetBackgroundColorText, t[ti].targetSizeText);
                        break;
                    }
                }
            } else if (checkTextFormat(text_value, t[ti].valueText, t[ti].typeText)) {
                //書式変更
                changeStyle(el_text, t[ti].targetColorText, t[ti].targetBackgroundColorText, t[ti].targetSizeText);
            }
        }

        //日付条件書式
        for (var di = 0; di < d.length; di++) {
            if (checkDateFormat(record[d[di].fieldDate]["value"], d[di].valueDate, d[di].typeDate)) {
                //書式変更
                var el_date = kintone.app.record.getFieldElement(d[di].targetFieldDate);
                if (!el_date) {
                    continue;
                }
                changeStyle(el_date, d[di].targetColorDate, d[di].targetBackgroundColorDate, d[di].targetSizeDate);
            }
        }
    }

    //レコード一覧表示イベント
    kintone.events.on("app.record.index.show", function(event) {
        if (event.records.length > 0) {
            setIndexFormat(event);
        }
        return event;
    });
    //レコード詳細表示イベント
    kintone.events.on("app.record.detail.show", function(event) {
        setDetailFormat(event);
        return event;
    });
})(jQuery, kintone.$PLUGIN_ID);
