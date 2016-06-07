/*
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";
    //read config.
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    var titleField = config['titleField'];
    var kaisai = config['kaisaiDate'];
    var theDate = config['theDate'];
    kintone.events.on('app.record.create.show', function(event) {
        var record = event.record;
        if (record[titleField]['value']) {
            record[titleField]['value'] = "";
        }
        //set days.
        var myTbl = ["sun", "mon", "tue", "wed", "thr", "fri", "sat"];
        var myD = new Date();
        var myDay = myD.getDay();
        switch (theDate) {
            case "monday":
                //config of every monday.
                if (myTbl[myDay] === "tue") {
                    record[kaisai]['value'] = colorfulLib.calcMD(6);
                }else if (myTbl[myDay] === "wed") {
                    record[kaisai]['value'] = colorfulLib.calcMD(5);
                }else if (myTbl[myDay] === "thr") {
                    record[kaisai]['value'] = colorfulLib.calcMD(4);
                }else if (myTbl[myDay] === "fri") {
                    record[kaisai]['value'] = colorfulLib.calcMD(3);
                }else if (myTbl[myDay] === "sat") {
                    record[kaisai]['value'] = colorfulLib.calcMD(2);
                }else if (myTbl[myDay] === "sun") {
                    record[kaisai]['value'] = colorfulLib.calcMD(1);
                }
                break;
            case "tuesday":
                //config of every tuesday.
                if (myTbl[myDay] === "mon") {
                    record[kaisai]['value'] = colorfulLib.calcMD(1);
                }else if (myTbl[myDay] === "wed") {
                    record[kaisai]['value'] = colorfulLib.calcMD(6);
                }else if (myTbl[myDay] === "thr") {
                    record[kaisai]['value'] = colorfulLib.calcMD(5);
                }else if (myTbl[myDay] === "fri") {
                    record[kaisai]['value'] = colorfulLib.calcMD(4);
                }else if (myTbl[myDay] === "sat") {
                    record[kaisai]['value'] = colorfulLib.calcMD(3);
                }else if (myTbl[myDay] === "sun") {
                    record[kaisai]['value'] = colorfulLib.calcMD(2);
                }
                break;
            case "wednesday":
                //config of every wednesday.
                if (myTbl[myDay] === "mon") {
                    record[kaisai]['value'] = colorfulLib.calcMD(2);
                }else if (myTbl[myDay] === "tue") {
                    record[kaisai]['value'] = colorfulLib.calcMD(1);
                }else if (myTbl[myDay] === "thr") {
                    record[kaisai]['value'] = colorfulLib.calcMD(6);
                }else if (myTbl[myDay] === "fri") {
                    record[kaisai]['value'] = colorfulLib.calcMD(5);
                }else if (myTbl[myDay] === "sat") {
                    record[kaisai]['value'] = colorfulLib.calcMD(4);
                }else if (myTbl[myDay] === "sun") {
                    record[kaisai]['value'] = colorfulLib.calcMD(3);
                }
                break;
            case "thrsday":
                //config of every thursday.
                if (myTbl[myDay] === "mon") {
                    record[kaisai]['value'] = colorfulLib.calcMD(3);
                }else if (myTbl[myDay] === "tue") {
                    record[kaisai]['value'] = colorfulLib.calcMD(2);
                }else if (myTbl[myDay] === "wed") {
                    record[kaisai]['value'] = colorfulLib.calcMD(1);
                }else if (myTbl[myDay] === "fri") {
                    record[kaisai]['value'] = colorfulLib.calcMD(6);
                }else if (myTbl[myDay] === "sat") {
                    record[kaisai]['value'] = colorfulLib.calcMD(5);
                }else if (myTbl[myDay] === "sun") {
                    record[kaisai]['value'] = colorfulLib.calcMD(4);
                }
                break;
            case "friday":
                //config of every friday.
                if (myTbl[myDay] === "mon") {
                    record[kaisai]['value'] = colorfulLib.calcMD(4);
                }else if (myTbl[myDay] === "tue") {
                    record[kaisai]['value'] = colorfulLib.calcMD(3);
                }else if (myTbl[myDay] === "wed") {
                    record[kaisai]['value'] = colorfulLib.calcMD(2);
                }else if (myTbl[myDay] === "thr") {
                    record[kaisai]['value'] = colorfulLib.calcMD(1);
                }else if (myTbl[myDay] === "sat") {
                    record[kaisai]['value'] = colorfulLib.calcMD(6);
                }else if (myTbl[myDay] === "sun") {
                    record[kaisai]['value'] = colorfulLib.calcMD(5);
                }
                break;
            default:
                var dt = new Date();
                var today = dt.getFullYear() + "-" + colorfulLib.zeroformat((dt.getMonth() + 1), 2) + "-" + dt.getDate();
                record[kaisai]['value'] = today;
                break;
        }
        record[titleField]['disabled'] = true;
        return event;
    });
	//edit event.
    var editEvents = ['app.record.edit.show', 'app.record.index.edit.show'];
    kintone.events.on(editEvents, function(event) {
        var record = event.record;
        record[titleField]['disabled'] = true;
        return event;
    });
	//title change.
    var changeEvents = ['app.record.create.submit', 'app.record.edit.change.' + kaisai, 'app.record.create.change.' + kaisai, 'app.record.index.edit.change.' + kaisai];
    kintone.events.on(changeEvents, function(event) {
        var record = event.record;
        var user = kintone.getLoginUser();
        record[titleField]['value'] = record[kaisai]['value'] + " " + user['name'];
        return event;
    });
	//index show event.
    var indexEvents = ['app.record.index.show'];
    var viewNameLength = Object.keys(config).length - 6;
    kintone.events.on(indexEvents, function(event) {
            var records = event.records;
            var elDate = kintone.app.getFieldElements(kaisai);
            if (elDate) {
				// specify color.
                var colorType = ['#CCFFFF', '#FFFFCC', '#CCFFCC', '#F5F5DC', '#FFEEFF', '#CCFFFF', '#FFFFCC', '#CCFFCC', '#F5F5DC', '#FFEEFF'];
                for (var i = 0; i < elDate.length; i++) {
                    var date2 = records[i][kaisai]['value'].split('-');
                    var today = new Date(date2[0] + "/" + date2[1] + "/" + date2[2]);
                    var firstday = new Date(today.getFullYear(), 0, 1);
                    var fulldays = Math.floor((today.getTime() - firstday.getTime()) / (1000 * 86400));
                    var iWeek = Math.floor((fulldays - today.getDay() + 12) / 7);
                    iWeek = ('0' + iWeek).slice(-1);
                    elDate[i].previousSibling.style.backgroundColor = colorType[iWeek];
                    elDate[i].previousSibling.style.borderTop = "solid 1px #D8D8D8";
                    elDate[i].previousSibling.style.borderRight = "solid 1px #D8D8D8";
                    elDate[i].previousSibling.style.borderLeft = "solid 1px #D8D8D8";
                    elDate[i].style.backgroundColor = colorType[iWeek];
                    elDate[i].style.borderTop = "solid 1px #D8D8D8";
                    elDate[i].style.borderRight = "solid 1px #D8D8D8";
                    for (var j = 0; j < viewNameLength - 1; j++) {
                        var tempFiled = kintone.app.getFieldElements(config["viewName" + (j + 1)]);
                        tempFiled[i].nextSibling.style.backgroundColor = colorType[iWeek];
                        tempFiled[i].nextSibling.style.borderTop = "solid 1px #D8D8D8";
                        tempFiled[i].nextSibling.style.borderRight = "solid 1px #D8D8D8";
                        if (i === elDate.length - 1) {
                            elDate[i].previousSibling.style.borderBottom = "solid 1px #D8D8D8";
                            elDate[i].style.borderBottom = "solid 1px #D8D8D8";
                            tempFiled[i].style.borderBottom = "solid 1px #D8D8D8";
                            tempFiled[i].nextSibling.style.borderBottom = "solid 1px #D8D8D8";
                        }
                    }
                }
            } else {
                alert("このビューは「開催日」項目を配置する必要があります。");
            }
            return event;
        });
    var openEvents = ['app.record.detail.show'];
    kintone.events.on(openEvents, function(event) {
        for (var j = 0; j < viewNameLength; j++) {
            var elTemp = kintone.app.record.getFieldElement(config["viewName" + (j + 1)]);
            updateFocus(elTemp);
        }
        function updateFocus(el) {
            var elc = el.childNodes;
            var text;
            var textTrim;
            var key1;
            var key2;
            var hilightSt = config["highlightSt"];
            var hilightCo = config["highlightCo"];
            for (var i = 0; i < elc.length; i++) {
                text = elc[i].innerHTML;
                textTrim = text.replace(/ /g, "").replace(/　/g, "");
                key1 = textTrim.charAt(0);
                key2 = textTrim.charAt(textTrim.length - 1);
                if (key1 === hilightSt || key2 === hilightSt) {
                    elc[i].style.backgroundColor = hilightCo;
                }
            }
        }
    });
})(jQuery, kintone.$PLUGIN_ID);
