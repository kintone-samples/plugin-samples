/*
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();
(function($) {
    "use strict";
    //change format.
    function zeroformat(v, n) {
        var vl = String(v).length;
        if (n > vl) {
            return (new Array((n - vl) + 1).join(0)) + v;
        }
        return v;
    }
    //calculate days.
    function calcMD(n) {
        var nmsec = n * 1000 * 60 * 60 * 24;	//１日のミリ秒
        var msec = (new Date()).getTime();
        var dt = new Date(nmsec + msec);
        return dt.getFullYear() + "-" + zeroformat((dt.getMonth() + 1), 2) + "-" + zeroformat(dt.getDate(), 2);
    }
    function calcMonday(myTbl, myDay) {
        if (myTbl[myDay] === "tue") {
            return calcMD(6);
        }else if (myTbl[myDay] === "wed") {
            return calcMD(5);
        }else if (myTbl[myDay] === "thr") {
            return calcMD(4);
        }else if (myTbl[myDay] === "fri") {
            return calcMD(3);
        }else if (myTbl[myDay] === "sat") {
            return calcMD(2);
        }else if (myTbl[myDay] === "sun") {
            return calcMD(1);
        }else if (myTbl[myDay] === "mon") {
            return calcMD(0);
        }
    }
    function calcTuesday(myTbl, myDay) {
        if (myTbl[myDay] === "mon") {
            return calcMD(1);
        }else if (myTbl[myDay] === "tue") {
            return calcMD(0);
        }else if (myTbl[myDay] === "wed") {
            return calcMD(6);
        }else if (myTbl[myDay] === "thr") {
            return calcMD(5);
        }else if (myTbl[myDay] === "fri") {
            return calcMD(4);
        }else if (myTbl[myDay] === "sat") {
            return calcMD(3);
        }else if (myTbl[myDay] === "sun") {
            return calcMD(2);
        }
    }
    function calcWednesday(myTbl, myDay) {
        if (myTbl[myDay] === "mon") {
            return calcMD(2);
        }else if (myTbl[myDay] === "tue") {
            return calcMD(1);
        }else if (myTbl[myDay] === "wed") {
            return calcMD(0);
        }else if (myTbl[myDay] === "thr") {
            return calcMD(6);
        }else if (myTbl[myDay] === "fri") {
            return calcMD(5);
        }else if (myTbl[myDay] === "sat") {
            return calcMD(4);
        }else if (myTbl[myDay] === "sun") {
            return calcMD(3);
        }
    }
    function calcThursday(myTbl, myDay) {
        if (myTbl[myDay] === "mon") {
            return calcMD(3);
        }else if (myTbl[myDay] === "tue") {
            return calcMD(2);
        }else if (myTbl[myDay] === "wed") {
            return calcMD(1);
        }else if (myTbl[myDay] === "thr") {
            return calcMD(0);
        }else if (myTbl[myDay] === "fri") {
            return calcMD(6);
        }else if (myTbl[myDay] === "sat") {
            return calcMD(5);
        }else if (myTbl[myDay] === "sun") {
            return calcMD(4);
        }
    }
    function calcFriday(myTbl, myDay) {
        if (myTbl[myDay] === "mon") {
            return calcMD(4);
        }else if (myTbl[myDay] === "tue") {
            return calcMD(3);
        }else if (myTbl[myDay] === "wed") {
            return calcMD(2);
        }else if (myTbl[myDay] === "thr") {
            return calcMD(1);
        }else if (myTbl[myDay] === "fri") {
            return calcMD(0);
        }else if (myTbl[myDay] === "sat") {
            return calcMD(6);
        }else if (myTbl[myDay] === "sun") {
            return calcMD(5);
        }
    }
    window.colorfulLib = window.colorfulLib || {};
    window.colorfulLib.calcMonday = calcMonday;
    window.colorfulLib.calcTuesday = calcTuesday;
    window.colorfulLib.calcWednesday = calcWednesday;
    window.colorfulLib.calcThursday = calcThursday;
    window.colorfulLib.calcFriday = calcFriday;
})(jQuery);
