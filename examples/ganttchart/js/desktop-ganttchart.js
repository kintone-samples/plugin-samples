/*
 * Gantt chart display of sample program
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {

    "use strict";

    // To HTML escape
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Date conversion for Gantt.
    function convertDateTime(str) {
        var dt;
        if (str !== "") {
            dt = '/Date(' + (new Date(str)).getTime() + ')/';
        } else {
            dt = "";
        }
        return dt;
    }

    var GANTT_NAME, GANTT_DESC, GANTT_FROM, GANTT_TO, GANTT_SCALL;
    var GANTT_LABEL, GANTT_COLOR;
    var GANTT_RED, GANTT_ORANGE, GANTT_GREEN, GANTT_BLUE, GANTT_YELLOW, GANTT_GRAY;

    // Set plugin
    function setPlugin() {
        var conf;
        // Use the plug-in.
        if (PLUGIN_ID) {
            conf = kintone.plugin.app.getConfig(PLUGIN_ID);
            if (conf) {
                GANTT_NAME = conf['ganttchartTitle'];
                GANTT_DESC = conf['ganttchartDesc'];
                GANTT_FROM = conf['ganttchartFrom'];
                GANTT_TO = conf['ganttchartTo'];
                GANTT_SCALL = conf['ganttchartScall'];
                GANTT_COLOR = conf['ganttchartColor'];
                GANTT_LABEL = conf['ganttchartTitle'];
                GANTT_NAME = conf['ganttchartTitle'];
                GANTT_RED = conf['ganttchartColor_red'];
                GANTT_ORANGE = conf['ganttchartColor_orange'];
                GANTT_GREEN = conf['ganttchartColor_green'];
                GANTT_BLUE = conf['ganttchartColor_blue'];
                GANTT_YELLOW = conf['ganttchartColor_yellow'];
                GANTT_GRAY = conf['ganttchartColor_gray'];
            }

        // Set when utilized in JavaScript read without using a plug-in.
        } else {
            GANTT_NAME = "To_Do";
            GANTT_DESC = "Details";
            GANTT_FROM = "From";
            GANTT_TO = "To";
            GANTT_LABEL = "To_Do";
            GANTT_SCALL = "days"; // days,weeks,months
            GANTT_COLOR = "Priority";
            GANTT_RED = "A";
            GANTT_ORANGE = "B";
            GANTT_GREEN = "C";
            GANTT_BLUE = "D";
            GANTT_YELLOW = "E";
            GANTT_GRAY = "";
        }
    }

    // Record list of events.
    kintone.events.on('app.record.index.show', function(event) {

        var GANTT_MONTHS, GANTT_DOW, GANTT_WAIT = "";
        var records = event.records;
        var data = [];

        // Set plugin
        setPlugin();

        // Don't display when there is no record.
        if (records.length === 0) {
            return;
        }
        var elSpace = kintone.app.getHeaderSpaceElement();

        // I will adjust the style depending on the version of the design
        var uiVer = kintone.getUiVersion();
        switch (uiVer) {
            case 1:
                elSpace.style.marginLeft = '28px';
                elSpace.style.marginRight = '28px';
                elSpace.style.border = 'solid 1px #ccc';
                break;
            default:
                elSpace.style.marginLeft = '15px';
                elSpace.style.marginRight = '15px';
                elSpace.style.border = 'solid 1px #ccc';
                break;
        }

        // I create an element of Gantt chart.
        var elGantt = document.getElementById('gantt');
        if (elGantt === null) {
            elGantt = document.createElement('div');
            elGantt.id = 'gantt';
            elSpace.appendChild(elGantt);
        }

        // To switch the moon, the day of the week, depending on the login user's Locale.
        var user = kintone.getLoginUser();
        switch (user['language']) {
            case "ja":
                GANTT_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                GANTT_DOW = ['日', '月', '火', '水', '木', '金', '土'];
                GANTT_WAIT = '表示するまでお待ちください。';
                break;
            case "zh":
                GANTT_MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                GANTT_DOW = ['日', '一', '二', '三', '四', '五', '六'];
                GANTT_WAIT = '请等待显示屏';
                break;
            default:
                GANTT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                GANTT_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                GANTT_WAIT = 'Please Wait...';
                break;
        }

        // Set the record.
        for (var i = 0; i < records.length; i++) {

            var colorGantt = "ganttGray";
            var arrayRed = GANTT_RED.split(",");
            var arrayOrange = GANTT_ORANGE.split(",");
            var arrayGreen = GANTT_GREEN.split(",");
            var arrayBlue = GANTT_BLUE.split(",");
            var arrayYellow = GANTT_YELLOW.split(",");
            var arrayGray = GANTT_GRAY.split(",");

            var colorValue = records[i][GANTT_COLOR]['value'];
            if (colorValue === "") {
                colorGantt = "ganttGray";
            } else if (arrayRed.indexOf(colorValue) >= 0) {
                colorGantt = "ganttRed";
            } else if (arrayOrange.indexOf(colorValue) >= 0) {
                colorGantt = "ganttOrange";
            } else if (arrayGreen.indexOf(colorValue) >= 0) {
                colorGantt = "ganttGreen";
            } else if (arrayBlue.indexOf(colorValue) >= 0) {
                colorGantt = "ganttBlue";
            } else if (arrayYellow.indexOf(colorValue) >= 0) {
                colorGantt = "ganttYellow";
            } else if (arrayGray.indexOf(colorValue) >= 0) {
                colorGantt = "ganttGray";
            } else {
                colorGantt = "ganttGray";
            }

            var descGantt = "<b>" + escapeHtml(records[i][GANTT_NAME]['value']) + "</b>";
            if (records[i][GANTT_FROM]['value']) {
                descGantt += "<br/>" + "From: " + escapeHtml(records[i][GANTT_FROM]['value']);
            }
            if (records[i][GANTT_TO]['value']) {
                descGantt += "<br/>" + "To: " + escapeHtml(records[i][GANTT_TO]['value']);
            }
            if (records[i][GANTT_COLOR]['value']) {
                descGantt += "<br/>" + escapeHtml(records[i][GANTT_COLOR]['value']);
            }

            var obj = {
                id: escapeHtml(records[i]['$id']['value']),
                name: GANTT_NAME ? escapeHtml(records[i][GANTT_NAME]['value']) : '',
                desc: GANTT_DESC ? escapeHtml(records[i][GANTT_DESC]['value']) : '',
                values: [{
                    from: convertDateTime(records[i][GANTT_FROM]['value']),
                    to: convertDateTime(records[i][GANTT_TO]['value']),
                    desc: descGantt,
                    label: GANTT_LABEL ? escapeHtml(records[i][GANTT_LABEL]['value']) : '',
                    customClass: escapeHtml(colorGantt)
                }]
            };

            data.push(obj);
        }

        // Set in Gantt object.
        $(elGantt).gantt({
            source: data,
            navigate: "scroll",
            scale: GANTT_SCALL,
            maxScale: "months",
            minScale: "days",
            months: GANTT_MONTHS,
            dow: GANTT_DOW,
            left: "70px",
            itemsPerPage: 100,
            waitText: GANTT_WAIT,
            scrollToToday: true
        });
    });

})(jQuery, kintone.$PLUGIN_ID);
