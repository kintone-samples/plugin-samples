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
    if (!CONFIG) { return false; }

    var TEXT_ROW_NUM = Number(CONFIG["text_row_number"]);
    var DATE_ROW_NUM = Number(CONFIG["date_row_number"]);

    for (var t = 1; t < TEXT_ROW_NUM + 1; t++) {
        CONFIG["text_row" + t] = JSON.parse(CONFIG["text_row" + t]);
    }
    for (var d = 1; d < DATE_ROW_NUM + 1; d++) {
        CONFIG["date_row" + d] = JSON.parse(CONFIG["date_row" + d]);
    }

    function changeFieldColor(el, color) {
        if (color) {
            el.style.color = color;
        }
    }

    function changeFieldBackgroundColor(el, backgroundcolor, event_type) {
        if (backgroundcolor) {
            el.style.backgroundColor = backgroundcolor;
        }
        if (event_type === "index") {
            el.style.borderBottom = "solid 1px #F5F5F5";
        }
    }

    function changeFieldFontSize(el, size) {
        if (size) {
            el.style.fontSize = size;
        } else {
            el.style.fontSize = "14px";
        }
    }

    function changeFieldStyle(el, font) {
        switch (font) {
            case "bold":
                el.style.fontWeight = font;
                el.style.textDecoration = "none";
                break;
            case "underline":
                el.style.fontWeight = "normal";
                el.style.textDecoration = font;
                break;
            case "line-through":
                el.style.fontWeight = "normal";
                el.style.textDecoration = font;
                break;
            case "":
                el.style.fontWeight = "normal";
                el.style.textDecoration = "none";
                break;
        }
    }

    function changeFieldElement(el, row_obj, event_type) {
        changeFieldColor(el, row_obj.targetcolor);
        changeFieldBackgroundColor(el, row_obj.targetbgcolor, event_type);
        changeFieldFontSize(el, row_obj.targetsize);
        changeFieldStyle(el, row_obj.targetfont);
    }

    function checkTextConditionFormat(field, value, type) {
        var field_value = "";
        var condition_value = "";

        // Change field value format
        if (field.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
            if (type === "match" || type === "unmatch") {
                field_value = field;
            } else {
                field_value = Number(field);
            }
        } else {
            field_value = field;
        }

        // Change condition value format
        if (value.match(/^[-]?[0-9]+(\.[0-9]+)?$/) !== null) {
            if (type === "match" || type === "unmatch") {
                condition_value = value;
            } else {
                condition_value = Number(value);
            }
        } else {
            condition_value = value;
        }

        switch (type) {
            case "match":
                if (field_value.indexOf(condition_value) !== -1) {
                    return true;
                }
                break;
            case "unmatch":
                if (field_value.indexOf(condition_value) === -1) {
                    return true;
                }
                break;
            case "==":
                if (field_value === condition_value) {
                    return true;
                }
                break;
            case "!=":
                if (field_value !== condition_value) {
                    return true;
                }
                break;
            case "<=":
                if (field_value <= condition_value) {
                    return true;
                }
                break;
            case "<":
                if (field_value < condition_value) {
                    return true;
                }
                break;
            case ">=":
                if (field_value >= condition_value) {
                    return true;
                }
                break;
            case ">":
                if (field_value > condition_value) {
                    return true;
                }
                break;
            default:
                return false;
        }
        return false;
    }

    function checkDateConditionFormat(field, value, condition_type, condition_type2) {

        if (!field) { return false; }

        //Change values format
        var num = Number(value);
        if (condition_type2 === "before") {
            num = -num;
        }

        var field_value = moment(field).format("YYYY-MM-DD 00:00");
        var condition_value = moment().add(num, "days").format("YYYY-MM-DD 00:00");
        var diff = moment(field_value).diff(moment(condition_value), "days");

        switch (condition_type) {
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

    function checkIndexConditionFormat(records) {
        var text_obj, date_obj, el_text, el_date, field_obj;

        for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
            text_obj = CONFIG["text_row" + ti];
            el_text = kintone.app.getFieldElements(text_obj.targetfield);
            if (!el_text) { continue; }

            for (var tn = 0; tn < el_text.length; tn++) {
                field_obj = records[tn][text_obj.field];
                if (field_obj.type === "CHECK_BOX" || field_obj.type === "MULTI_SELECT") {
                    if (field_obj.value.length === 0) {
                        field_obj.value[0] = "";
                    }
                    for (var i = 0; i < field_obj.value.length; i++) {
                        if (checkTextConditionFormat(field_obj.value[i], text_obj.value, text_obj.type)) {
                            changeFieldElement(el_text[tn], text_obj, "index");
                        }
                    }
                    continue;
                }
                if (checkTextConditionFormat(field_obj.value, text_obj.value, text_obj.type)) {
                    changeFieldElement(el_text[tn], text_obj, "index");
                }
            }
        }

        for (var di = 1; di <= DATE_ROW_NUM; di++) {
            date_obj = CONFIG["date_row" + di];
            el_date = kintone.app.getFieldElements(date_obj.targetfield);
            if (!el_date) { continue; }

            for (var dn = 0; dn < el_date.length; dn++) {
                field_obj = records[dn][date_obj.field];
                if (checkDateConditionFormat(field_obj.value, date_obj.value, date_obj.type, date_obj.type2)) {
                    changeFieldElement(el_date[dn], date_obj, "index");
                }
            }
        }
    }

    function checkDetailConditionFormat(record) {
        var text_obj, date_obj, el_text, el_date, field_obj;

        for (var ti = 1; ti <= TEXT_ROW_NUM; ti++) {
            text_obj = CONFIG["text_row" + ti];
            el_text = kintone.app.record.getFieldElement(text_obj.targetfield);
            if (!el_text) { continue; }

            field_obj = record[text_obj.field];
            if (field_obj.type === "CHECK_BOX" || field_obj.type === "MULTI_SELECT") {
                if (field_obj.value.length === 0) {
                    field_obj.value[0] = "";
                }
                for (var i = 0; i < field_obj.value.length; i++) {
                    if (checkTextConditionFormat(field_obj.value[i], text_obj.value, text_obj.type)) {
                        changeFieldElement(el_text, text_obj, "detail");
                    }
                }
                continue;
            }
            if (checkTextConditionFormat(field_obj.value, text_obj.value, text_obj.type)) {
                changeFieldElement(el_text, text_obj, "detail");
            }
        }

        for (var di = 1; di <= DATE_ROW_NUM; di++) {
            date_obj = CONFIG["date_row" + di];
            el_date = kintone.app.record.getFieldElement(date_obj.targetfield);
            if (!el_date) { continue; }

            field_obj = record[date_obj.field];
            if (checkDateConditionFormat(field_obj.value, date_obj.value, date_obj.type, date_obj.type2)) {
                changeFieldElement(el_date, date_obj, "detail");
            }
        }
    }

    kintone.events.on("app.record.index.show", function(event) {
        if (event.records.length <= 0) { return; }
        checkIndexConditionFormat(event.records);
        return;
    });
    kintone.events.on("app.record.detail.show", function(event) {
        if (!event.record) { return; }
        checkDetailConditionFormat(event.record);
        return;
    });
})(jQuery, kintone.$PLUGIN_ID);
