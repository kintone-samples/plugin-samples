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

    if (!CONFIG) {
        return false;
    }
    var TEXT_ROW_NUM = Number(CONFIG["text_row_number"]);
    var DATE_ROW_NUM = Number(CONFIG["date_row_number"]);
    for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
        CONFIG["text_row" + t] = JSON.parse(CONFIG["text_row" + t]);
    }
    for (var d = 1; d < DATE_ROW_NUM + 1; d++) {
        CONFIG["date_row" + d] = JSON.parse(CONFIG["date_row" + d]);
    }

    function changeColor(el, color) {
        if (color) {
            el.style.color = color;
        }
    }
    function changeBackgroundColor(el, backgroundcolor, type) {
        if (backgroundcolor) {
            el.style.backgroundColor = backgroundcolor;
        }
        if (type === "index") {
            el.style.borderBottom = "solid 1px #F5F5F5";
        }
    }
    function changeFontSize(el, size) {
        if (size) {
            el.style.fontSize = size;
        } else {
            el.style.fontSize = "14px";
        }
    }
    function changeFont(el, font) {
        switch (font) {
            case "bold":
                el.style.fontWeight = font;
                break;
            case "underline":
                el.style.textDecoration = font;
                break;
            case "line-through":
                el.style.textDecoration = font;
                break;
        }
    }

    function changeStyle(el, color, backgroundcolor, size, font, type) {
        if (el) {
            changeColor(el, color);
            changeBackgroundColor(el, backgroundcolor, type);
            changeFontSize(el, size);
            changeFont(el, font);
        }
    }

    function checkTextFormat(field, value, type) {
        var field_text = "";
        var value_text = "";

        if (field.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
            if (type === "match" || type === "unmatch") {
                field_text = field;
            } else {
                field_text = Number(field);
            }
        } else {
            field_text = field;
        }

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
    function checkDateFormat(field, value, type, type2) {

        if (!field) {
            return false;
        }
        var num = Number(value);
        if (type2 === "before") {
            num = -num;
        }
        var field_date = moment(field).format("YYYY-MM-DD 00:00");
        var value_date = moment().add(num, "days").format("YYYY-MM-DD 00:00");
        var diff = moment(field_date).diff(moment(value_date), "days");

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
        var status_code = "status_process_management";
        var fieldcode = Object.keys(record);
        for (var n in fieldcode) {
            if (!fieldcode.hasOwnProperty(n)) { continue; }

            if (record[fieldcode[n]]["type"] === "STATUS") {
                status_code = fieldcode[n];
                break;
            }
        }
        return status_code;
    }

    function setIndexFormat(event) {
        var record = [];

        //check status code
        for (var st = 1; st <= TEXT_ROW_NUM; st++) {
            if (CONFIG["text_row" + st].targetfield === "status_process_management") {
                CONFIG["text_row" + st].targetfield = changeStatusCode(event.records[0]);
            }
            if (CONFIG["text_row" + st].field === "status_process_management") {
                CONFIG["text_row" + st].field = changeStatusCode(event.records[0]);
            }
        }
        for (var sd = 1; sd <= DATE_ROW_NUM; sd++) {
            if (CONFIG["date_row" + sd].targetfield === "status_process_management") {
                CONFIG["date_row" + sd].targetfield = changeStatusCode(event.records[0]);
            }
        }

        //Text condition format
        for (var ti2 = 1; ti2 <= TEXT_ROW_NUM; ti2++) {
            var text_obj = CONFIG["text_row" + ti2];
            var el_text2 = kintone.app.getFieldElements(text_obj.targetfield);
            if (!el_text2) { continue; }

            for (var tn = 0; tn < el_text2.length; tn++) {
                record = event.records[tn];
                var text2_value = record[text_obj.field]["value"];
                if (text_obj.field === "status") {
                    text2_value = record[changeStatusCode(text_obj.field)]["value"];
                }
                if (Array.isArray(text2_value)) {
                    for (var a = 0; a < text2_value.length; a++) {
                        if (checkTextFormat(text2_value[a], text_obj.value, text_obj.type)) {
                            changeStyle(
                                el_text2[tn],
                                text_obj.targetcolor,
                                text_obj.targetbackgroundcolor,
                                text_obj.targetsize,
                                text_obj.targetfont,
                                "index"
                            );
                            break;
                        }
                    }
                } else if (checkTextFormat(text2_value, text_obj.value, text_obj.type)) {
                    changeStyle(
                        el_text2[tn],
                        text_obj.targetcolor,
                        text_obj.targetbackgroundcolor,
                        text_obj.targetsize,
                        text_obj.targetfont,
                        "index"
                    );
                }
            }
        }

        //Date condition format
        for (var di2 = 1; di2 <= DATE_ROW_NUM; di2++) {
            var date_obj = CONFIG["date_row" + di2];
            var el_date2 = kintone.app.getFieldElements(date_obj.targetfield);
            if (!el_date2) { continue; }

            for (var dn = 0; dn < el_date2.length; dn++) {
                record = event.records[dn];

                if (checkDateFormat(record[date_obj.field]["value"], date_obj.value, date_obj.type, date_obj.type2)) {
                    changeStyle(
                        el_date2[dn],
                        date_obj.targetcolor,
                        date_obj.targetbackgroundcolor,
                        date_obj.targetsize,
                        date_obj.targetfont,
                        "index"
                    );
                }
            }
        }
    }

    function setDetailFormat(event) {
        var record = event.record;

        //check status code
        for (var st = 1; st <= TEXT_ROW_NUM; st++) {
            if (CONFIG["text_row" + st].targetfield === "status_process_management") {
                CONFIG["text_row" + st].targetfield = changeStatusCode(event.record);
            }
            if (CONFIG["text_row" + st].field === "status_process_management") {
                CONFIG["text_row" + st].field = changeStatusCode(event.record);
            }
        }
        for (var sd = 1; sd <= DATE_ROW_NUM; sd++) {
            if (CONFIG["date_row" + sd].targetfield === "status_process_management") {
                CONFIG["date_row" + sd].targetfield = changeStatusCode(event.record);
            }
        }

        //Text condition format
        for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
            var text_obj = CONFIG["text_row" + ti];
            var el_text = kintone.app.record.getFieldElement(text_obj.targetfield);
            if (!el_text) { continue; }

            var text_value = record[text_obj.field]["value"];
            if (Array.isArray(text_value)) {
                for (var a = 0; a < text_value.length; a++) {
                    if (checkTextFormat(text_value[a], text_obj.value, text_obj.type)) {
                        changeStyle(
                            el_text,
                            text_obj.targetcolor,
                            text_obj.targetbackgroundcolor,
                            text_obj.targetsize,
                            text_obj.targetfont,
                            "detail"
                        );
                        break;
                    }
                }
            } else if (checkTextFormat(text_value, text_obj.value, text_obj.type)) {
                changeStyle(
                    el_text,
                    text_obj.targetcolor,
                    text_obj.targetbackgroundcolor,
                    text_obj.targetsize,
                    text_obj.targetfont,
                    "detail"
                );
            }
        }

        //Date condition format
        for (var di = 1; di <= DATE_ROW_NUM; di++) {
            var date_obj = CONFIG["date_row" + di];
            if (checkDateFormat(record[date_obj.field]["value"], date_obj.value, date_obj.type)) {
                var el_date = kintone.app.record.getFieldElement(date_obj.targetfield);
                if (!el_date) { continue; }

                changeStyle(
                    el_date,
                    date_obj.targetcolor,
                    date_obj.targetbackgroundcolor,
                    date_obj.targetsize,
                    date_obj.targetfont,
                    "detail"
                );
            }
        }
    }

    kintone.events.on("app.record.index.show", function(event) {
        if (event.records.length > 0) {
            setIndexFormat(event);
        }
        return event;
    });
    kintone.events.on("app.record.detail.show", function(event) {
        setDetailFormat(event);
        return event;
    });
})(jQuery, kintone.$PLUGIN_ID);
