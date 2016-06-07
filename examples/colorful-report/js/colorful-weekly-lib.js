/*
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();
(function($) {
    "use strict";
    //more read util.
    function moreReadOpner(key) {
        var idno = key;
        var pc = ("PlagClose" + (idno));
        var po = ("PlagOpen" + (idno));
        if (document.getElementById(pc).style.display === 'none') {
            document.getElementById(pc).style.display = 'block';
            document.getElementById(po).style.display = 'none';
        }else {
            document.getElementById(pc).style.display = 'none';
            document.getElementById(po).style.display = 'block';
        }
        return false;
    }
    function moreReadCloser(key) {
        var idno = key;
        var pc = ('PlagClose' + (idno));
        var po = ('PlagOpen' + (idno));
        if (document.getElementById(pc).style.display === 'none') {
            document.getElementById(pc).style.display = 'block';
            document.getElementById(po).style.display = 'none';
        }else {
            document.getElementById(pc).style.display = 'none';
            document.getElementById(po).style.display = 'block';
        }
        return false;
    }
    //escape HTML.
    function escapeHtml(str) {
        str = str.replace(/&/g, '&amp;');
		str = str.replace(/</g, '&lt;');
		str = str.replace(/>/g, '&gt;');
		str = str.replace(/"/g, '&quot;');
		str = str.replace(/'/g, '&#39;');
        return str;
    }
    //change format.
    function zeroformat(v, n) {
        var vl = String(v).length;
        if (n > vl) {
            return (new Array((n - vl) + 1).join(0)) + v;
        } else {
            return v;
        }
    }
    //calculate days.
    function calcMD(n) {
        var nmsec = n * 1000 * 60 * 60 * 24;	//１日のミリ秒
        var msec = (new Date()).getTime();
        var dt = new Date(nmsec + msec);
        return dt.getFullYear() + "-" + zeroformat((dt.getMonth() + 1), 2) + "-" + zeroformat(dt.getDate(), 2);
    }
    window.colorfulLib = window.colorfulLib || {};
    window.colorfulLib.moreReadOpner = moreReadOpner;
    window.colorfulLib.moreReadCloser = moreReadCloser;
    window.colorfulLib.escapeHtml = escapeHtml;
    window.colorfulLib.zeroformat = zeroformat;
    window.colorfulLib.calcMD = calcMD;
})(jQuery);
