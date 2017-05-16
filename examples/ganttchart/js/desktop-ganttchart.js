/*
 * Gantt chart display of sample program
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
document.write('<script type="text/javascript" src="https://js.cybozu.com/jquery/2.1.3/jquery.min.js"></script>');

// ローディング画面を出す関数
function setLoading() {
    "use strict";
    var $body = $('body');
    $body.css('width', '100%');

    var $loading = $('<div>').attr('id', 'loading').attr('class', 'loading')
                .attr('style', 'width: 100%; height: 100%; position:absolute;' +
                        ' top:0; left:0; text-align:center; background-color:#666666; opacity:0.6; z-index: 10000;');
    var $div = $('<div>').attr('id', 'imgBox').attr('style', 'width: 100%; height: 100%;');
    var $img = $('<img>').attr('src', 'data:image/gif;base64,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');
    $loading.append($div.append($img));
    $body.append($loading);

    $('#imgBox').attr('style', 'margin-top: ' + Math.floor($('#loading').height() / 2) + 'px;');

    $body.css('position', 'fixed');
}

// ローディング画面を消す関数
function removeLoading() {
    "use strict";
    var $loading = $('.loading');
    $loading.remove();

    var $body = $('body');
    $body.css('position', '');
}

// ×ボタンでモーダルウィンドウを消すときの処理
function closeButton() {
    "use strict";
    $('#modal').fadeOut(250);
    $('#blackOut').remove();
    $('body').css('position', 'relative');
}

(function($, moment, PLUGIN_ID) {
    'use strict';


    //モーダルウィンドウの表示
    function createModalWindow(data) {

        var $body = $('body');
        $body.css('width', '100%');
        var $black = $('<div>').attr('id', 'blackOut').attr('style', 'width: 100%; height: 100%;' +
        'position:absolute; top:0; left:0; text-align:center; background-color:#666666; opacity:0.6; z-index: 10;');
        $body.append($black);
        $body.css('position', 'fixed');

        // モーダルウィンドウの基礎部分を作成
        var divid = "modal";

        var styleTag = {
            "tag": "style",
            "content": ["\ndiv#modal{\n\tposition: fixed;\n\ttop:0;\n\tz-index:11;\n\twidth: 100%;\n\theight: 100%;" +
            "\n\tbackground-color: transparent;}\ndiv#modal div#box-min{\n\tposition: relative;" +
            "\n\tbackground-color:#ffffff;\n\twidth:500px;height:400px;\n\tborder:2px solid #666666;" +
            "\n\tpadding:0 5px 0 5px;\n}\ndiv#box-min div.content{\n\t\n\toverflow: visible;\n}"]
        };

        // モーダルウィンドウのHTMLを格納
        var $weather = $('<div id=' + divid + ' class="box"><div id="box-min"><div id="header">' +
        '<h3>' + data.name + '　' + data.desc + '</h3>' +
        '</div><button type="button" class="sw-modal-close" onclick="closeButton()">×</button><div class="content">' +
        '<p>' + data.lang.plzEnterStartDate + '</p><input type="text" id="start" value="' +
        moment(data.start).format("YYYY/MM/DD") + '">' +
        '<p>' + data.lang.plzEnterEndDate + '</p>' +
        '<input type="text" name="end" id="end" value="' + moment(data.end).format("YYYY/MM/DD") + '">' +
        '<br><br><button id="goButton" class="gaia-ui-actionmenu-save">　' + data.lang.update + '　</button>' +
        '<a href="' + data.url + '" target="_blank">　　' + data.lang.detailPage + '</a></div></div></div>');

        $("#" + divid).remove();
        // モーダルウィンドウをHTMLに配置
        $("body").append($weather);

        var style = domFromObject(styleTag);
        $("#box-min").before(style);
        // モーダルウィンドウをセンターに
        adjustCenter();

        $("#start").datepicker();
        $("#end").datepicker();

        // 登録処理
        $('#goButton').click(function() {
            setLoading();

            var startDate = $("#start").datepicker('getDate');
            var endDate = $("#end").datepicker('getDate');

            if (!startDate || !endDate) {
                alert(data.lang.emptyAlert);
                removeLoading();
                return;
            }

            startDate = moment(startDate).format("YYYY-MM-DD");
            endDate = moment(endDate).format("YYYY-MM-DD");

            var confs = kintone.plugin.app.getConfig(PLUGIN_ID);
            var tableFlgs = false;
            if (confs.fieldNameColor.indexOf("[Table]") === 0) {
                tableFlgs = true;
            }
            if (tableFlgs) {
                for (var key2 in data.record) {
                    if (key2 !== "Table") {
                        delete data.record[key2];
                    }
                }

                for (var i = 0; i < data.record.Table.value.length; i++) {
                    if (data.record.Table.value[i].id === data.tableId) {
                        data.record.Table.value[i].value[data.GANTT_FROM].value = startDate;
                        data.record.Table.value[i].value[data.GANTT_TO].value = endDate;
                    }
                }
            } else {
                for (var key in data.record) {
                    if (key !== data.GANTT_FROM && key !== data.GANTT_TO) {
                        delete data.record[key];
                    }
                }
                data.record[data.GANTT_FROM].value = startDate;
                data.record[data.GANTT_TO].value = endDate;
            }
            var body = {
                "app": kintone.app.getId(),
                "id": data.recId,
                "record": data.record
            };

            kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
                location.reload();
            }, function() {
                alert(data.lang.authAlert);
                removeLoading();
            });
        });
    }

    // モーダルウィンドウをセンターに寄せる
    function adjustCenter() {
        var margin_top = ($(window).height() - $('#box-min').height()) / 2;
        var margin_left = ($(window).width() - $('#box-min').width()) / 2;
        $('#box-min').css({top: margin_top + "px", left: margin_left + "px"});
    }

    var domFromObject = function(obj, callback) {
        var i, r;
        if (['string', 'number'].indexOf(typeof obj) >= 0) {
            r = obj;
        } else if (obj instanceof Array) {
            r = [];
            for (i = 0; i < obj.length; i++) {
                r.push(domFromObject(obj[i]));
            }
        } else if (obj.constructor === Object) {
            var tag = obj.tag;
            var elm = document.createElement(tag);
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (callback) {
                        if (callback(i, elm, obj[i])) {
                            continue;
                        }
                    }
                    if (i === 'tag') {
                        continue;
                    }
                    var v;
                    if (i === 'content') {
                        v = domFromObject(obj[i]);
                        if (v instanceof Array) {
                            for (var j = 0; j < v.length; j++) {
                                var v2;
                                if (typeof v[j] === 'string') {
                                    v2 = document.createTextNode(v[j]);
                                } else {
                                    v2 = v[j];
                                }
                                elm.appendChild(v2);
                            }
                        } else if (v instanceof HTMLElement) {
                            elm.appendChild(v);
                        } else {
                            elm.innerHTML = v;
                        }

                    } else {
                        v = obj[i];
                        elm.setAttribute(i, v);
                    }
                }
            }
            r = elm;
        }
        return r;
    };

    var kintonePluginGranttChart = {
        lang: {
            ja: {
                months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                dow: ['日', '月', '火', '水', '木', '金', '土'],
                wait: '表示するまでお待ちください。',
                plzEnterStartDate: '開始日を入力して下さい。',
                plzEnterEndDate: '終了日を入力して下さい。',
                update: '更新',
                detailPage: '詳細画面へ',
                emptyAlert: '日付を入力してください。',
                authAlert: 'レコードを更新できませんでした。編集権限があるかご確認ください。'
            },
            en: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                wait: 'Please Wait...',
                plzEnterStartDate: 'Please input start date.',
                plzEnterEndDate: 'Please input end date.',
                update: 'Update',
                detailPage: 'Go to detail page',
                emptyAlert: 'Please input date field.',
                authAlert: 'The record could not be updated. Please check if you have edit permission.'
            },
            zh: {
                months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                dow: ['日', '一', '二', '三', '四', '五', '六'],
                wait: '请等待显示屏',
                plzEnterStartDate: '请输入开始日期。',
                plzEnterEndDate: '请输入结束日期。',
                update: '更新',
                detailPage: '进入详细页面',
                emptyAlert: '请输入日期',
                authAlert: '不能更新记录了。请确认是否有编辑权限。'
            }
        },
        settings: {
            lang: 'en',
            i18n: 'en',
            config: kintone.plugin.app.getConfig(PLUGIN_ID),
            quarter: {},
            element: {
                classColorGanttDefault: 'ganttGray',
                prefixColorGantt: 'kintone-plugin-gantt-'
            }
        },
        data: [],
        init: function() {
            var self = this;
            kintone.events.on('app.record.index.show', function(event) {
                if (!self.settings.config) {
                    return;
                }
                if (typeof self.settings.config.settingColors === "string") {
                    self.initSetting();
                }
                var ganttBox = self.uiCreateGanttBox();
                self.data = [];
                self.getRecordsData(event.records, ganttBox, function() {
                    //Put to jquery gantt and render
                    self.gantt(ganttBox);
                });
            });

            kintone.events.on('app.record.index.edit.submit.success', function(event) {
                window.location.reload();
            });
        },
        initSetting: function() {
            var self = this;
            this.settings.user = kintone.getLoginUser();
            this.settings.lang = this.settings.user['language'];
            this.settings.i18n = (this.settings.lang in this.lang) ? this.settings.lang : 'en';

            var settingColors = JSON.parse(this.settings.config.settingColors || '{}');
            //Check multi field corlor and overide settingColors
            this.settings.config.settingColors = {};
            for (var fieldColor in settingColors) {
                if (!settingColors.hasOwnProperty(fieldColor)) {
                    continue;
                }
                var fieldColorArray = fieldColor.split(',');
                fieldColorArray.forEach(function(item) {
                    var fieldColorOuput = item.trim();
                    self.settings.config.settingColors[fieldColorOuput] = settingColors[fieldColor];
                });
            }
        },
        getRecordsData: function(records, ganttBox, callbackFnc) {
            var self = this;
            var ganttStylesRecord = {};
            if (ganttBox.className === 'loaded') {
                return;
            }
            if (records.length === 0) {
                return;
            }
            var GANTT_COLOR = self.settings.config['ganttchartColor'] || '',
                GANTT_NAME = self.settings.config['ganttchartTitle'] || '',
                GANTT_DESC = self.settings.config['ganttchartDesc'] || '',
                GANTT_FROM = self.settings.config['ganttchartFrom'] || '',
                GANTT_TO = self.settings.config['ganttchartTo'] || '';

            // Set the record.
            var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
            var tableFlg = false;
            if (conf.fieldNameColor.indexOf("[Table]") === 0) {
                tableFlg = true;
            }
            if (tableFlg) {
                for (var i2 = 0; i2 < records.length; i2++) {
                    var subTable = records[i2].Table.value;

                    for (var j = 0; j < subTable.length; j++) {
                        var colorGantt = self.settings.element.classColorGanttDefault;
                        var descGantt = '<b>' + self.escapeHtml(records[i2][GANTT_NAME].value) + '</b>';

                        var deskFlg = true;
                        if (subTable[j].value[GANTT_DESC]) {
                            if (subTable[j].value[GANTT_DESC].value === "") {
                                deskFlg = false;
                            }
                            descGantt += '<div>' +
                                self.escapeHtml(subTable[j].value[GANTT_DESC]['value']) +
                                '</div>';
                        } else {
                            deskFlg = false;
                        }

                        var colorValue = subTable[j].value[GANTT_COLOR]['value'] || '';
                        if (colorValue && self.settings.config.settingColors[colorValue]) {
                            var styleRecordClass = self.settings.element.prefixColorGantt + 'class-' + i2 + '-' + j;
                            colorGantt = styleRecordClass;
                            ganttStylesRecord[styleRecordClass] = self.settings.config.settingColors[colorValue];
                        }

                        if (subTable[j].value[GANTT_FROM]['value']) {
                            descGantt += '<div>' + conf.fieldNameFrom.slice(conf.fieldNameFrom.indexOf("[Table]") + 7) +
                                ': ' + self.escapeHtml
                                (self.convertDateTimeWithTimezone(subTable[j].value[GANTT_FROM]['value'])) +
                                '</div>';
                        }
                        if (subTable[j].value[GANTT_TO]['value']) {
                            descGantt += '<div>' + conf.fieldNameTo.slice(conf.fieldNameTo.indexOf("[Table]") + 7) +
                                ': ' + self.escapeHtml
                                (self.convertDateTimeWithTimezone(subTable[j].value[GANTT_TO]['value'])) +
                                '</div>';
                        }
                        if (subTable[j].value[GANTT_COLOR]['value']) {
                            descGantt += conf.fieldNameColor.slice(conf.fieldNameColor.indexOf("[Table]") + 7) +
                            ': ' + self.escapeHtml(subTable[j].value[GANTT_COLOR]['value']);
                        }

                        var ganttRecordData = {
                            id: self.escapeHtml(records[i2]['$id'].value),
                            name: (j !== 0) ? '' : self.escapeHtml(records[i2][GANTT_NAME].value),
                            desc: subTable[j].value[GANTT_DESC] ? self.escapeHtml
                            (subTable[j].value[GANTT_DESC].value) : '',
                            values: [{
                                from: self.convertDateTime(subTable[j].value[GANTT_FROM].value),
                                to: self.convertDateTime(subTable[j].value[GANTT_TO].value),
                                desc: descGantt,
                                label: deskFlg ? self.escapeHtml(subTable[j].value[GANTT_DESC].value)
                                : self.escapeHtml(records[i2][GANTT_NAME].value),
                                customClass: self.escapeHtml(colorGantt),
                                dataObj: {
                                    'url': '/k/' + kintone.app.getId() + '/show#record=' + records[i2]['$id']['value'],
                                    'name': records[i2][GANTT_NAME].value,
                                    'desc': deskFlg ? self.escapeHtml(subTable[j].value[GANTT_DESC].value) : '',
                                    'start': subTable[j].value[GANTT_FROM].value,
                                    'end': subTable[j].value[GANTT_TO].value,
                                    'recId': records[i2]['$id'].value,
                                    'tableId': subTable[j].id,
                                    'record': records[i2],
                                    'GANTT_FROM': GANTT_FROM,
                                    'GANTT_TO': GANTT_TO,
                                    'lang': this.lang[this.settings.i18n]
                                }
                            }]
                        };
                        self.data.push(ganttRecordData);

                    }
                }
            } else {
                for (var i3 = 0; i3 < records.length; i3++) {

                    var colorGantt2 = self.settings.element.classColorGanttDefault;

                    var colorValue2 = records[i3][GANTT_COLOR]['value'] || '';
                    if (colorValue2 && self.settings.config.settingColors[colorValue2]) {
                        var styleRecordClass2 = self.settings.element.prefixColorGantt + 'class-' + i3;
                        colorGantt2 = styleRecordClass2;
                        ganttStylesRecord[styleRecordClass2] = self.settings.config.settingColors[colorValue2];
                    }

                    var descGantt2 = '<b>' + self.escapeHtml(records[i3][GANTT_NAME].value) + '</b>';
                    if (records[i3][GANTT_DESC]) {
                        descGantt2 += '<div>' +
                            self.escapeHtml(records[i3][GANTT_DESC]['value']) +
                            '</div>';
                    }
                    if (records[i3][GANTT_FROM]['value']) {
                        descGantt2 += '<div>' + conf.fieldNameFrom + ': ' +
                            self.escapeHtml(self.convertDateTimeWithTimezone(records[i3][GANTT_FROM]['value'])) +
                            '</div>';
                    }
                    if (records[i3][GANTT_TO]['value']) {
                        descGantt2 += '<div>' + conf.fieldNameTo + ': ' +
                            self.escapeHtml(self.convertDateTimeWithTimezone(records[i3][GANTT_TO]['value'])) +
                            '</div>';
                    }
                    if (records[i3][GANTT_COLOR]['value']) {
                        descGantt2 += conf.fieldNameColor + ': ' + self.escapeHtml(records[i3][GANTT_COLOR]['value']);
                    }
                    var ganttRecordData2 = {
                        id: self.escapeHtml(records[i3]['$id'].value),
                        name: records[i3][GANTT_NAME] ? self.escapeHtml(records[i3][GANTT_NAME].value) : '',
                        desc: records[i3][GANTT_DESC] ? self.escapeHtml(records[i3][GANTT_DESC].value) : '',
                        values: [{
                            from: self.convertDateTime(records[i3][GANTT_FROM].value),
                            to: self.convertDateTime(records[i3][GANTT_TO].value),
                            desc: descGantt2,
                            label: (records[i3][GANTT_DESC] && records[i3][GANTT_DESC].value !== "") ?
                            self.escapeHtml(records[i3][GANTT_DESC]['value'])
                            : self.escapeHtml(records[i3][GANTT_NAME].value),
                            customClass: self.escapeHtml(colorGantt2),
                            dataObj: {
                                'url': '/k/' + kintone.app.getId() + '/show#record=' + records[i3]['$id']['value'],
                                'name': records[i3][GANTT_NAME].value,
                                'desc': records[i3][GANTT_DESC] ? records[i3][GANTT_DESC].value : '',
                                'start': records[i3][GANTT_FROM].value,
                                'end': records[i3][GANTT_TO].value,
                                'recId': records[i3]['$id'].value,
                                'tableId': "",
                                'record': records[i3],
                                'GANTT_FROM': GANTT_FROM,
                                'GANTT_TO': GANTT_TO,
                                'lang': this.lang[this.settings.i18n]
                            }
                        }]
                    };
                    self.data.push(ganttRecordData2);
                }
            }
            (typeof callbackFnc === 'function') && callbackFnc();
            self.uiSetStyleProcessBar(ganttStylesRecord);
        },
        gantt: function(elGantt) {
            elGantt.className = 'loaded';

            var GANTT_SCALL = this.settings.config['ganttchartScall'] || 'days';
            //Execute jquery gantt
            $(elGantt).gantt({
                source: this.data,
                navigate: 'scroll',
                scale: GANTT_SCALL,
                maxScale: 'months',
                minScale: 'hours',
                months: this.lang[this.settings.i18n].months,
                dow: this.lang[this.settings.i18n].dow,
                left: '70px',
                itemsPerPage: 100,
                waitText: this.lang[this.settings.i18n].wait,
                scrollToToday: true,
                onItemClick: function(dataRecord) {
                    $(".leftPanel").css("z-index", "inherit");
                    createModalWindow(dataRecord);
                }
            });
        },
        uiCreateGanttBox: function() {
/*             var elGantt = document.getElementById('gantt');
           if (elGantt !== null) {
                return elGantt;
            }*/
            if ($("#gantt").length > 0) {
                $("#gantt").remove();
            }

            var elSpace = kintone.app.getHeaderSpaceElement();
            // I will adjust the style depending on the version of the design
            var uiVer = kintone.getUiVersion();
            switch (uiVer) {
                case 1:
                    elSpace.style.margin = '10px 5px';
                    elSpace.style.border = 'solid 1px #ccc';
                    break;
                default:
                    elSpace.style.margin = '20px 10px';
                    elSpace.style.border = 'solid 1px #ccc';
                    break;
            }

            // I create an element of Gantt chart.
            var elGantt = document.createElement('div');
            elGantt.id = 'gantt';
            elSpace.appendChild(elGantt);
            return elGantt;
        },
        uiSetStyleProcessBar: function(styles) {
            var styleRule = '';
            for (var className in styles) {
                if (!styles.hasOwnProperty(className)) {
                    continue;
                }
                styleRule += '.' + className + '{background-color:' + styles[className] + '!important}';
            }
            //Change cursor progress bar to pointer
            styleRule += '.fn-gantt .bar .fn-label{cursor: pointer!important;}';
            $('html > head').append($('<style>' + styleRule + '</style>'));
        },
        escapeHtml: function(str) {
            if (typeof str !== 'string') {
                return '';
            }
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&quot;')
                .replace(/'/g, '&#39;');
        },
        convertDateTime: function(str) {
            var dt;
            var dateWithTimezone = moment.tz(str, this.settings.user.timezone);
            var date = new Date(dateWithTimezone.year(),
                dateWithTimezone.month(),
                dateWithTimezone.date(),
                dateWithTimezone.hours(),
                dateWithTimezone.minutes());
            if (str !== '') {
                dt = '/Date(' + date.getTime() + ')/';
            } else {
                dt = '';
            }
            return dt;
        },
        convertDateTimeWithTimezone: function(date) {
            var dateWithTimezone = moment.tz(date, this.settings.user.timezone);
            return dateWithTimezone.format('YYYY-MM-DD H:mm');
        }
    };
    $(document).ready(function() {
        kintonePluginGranttChart.init();
    });

})(jQuery, moment, kintone.$PLUGIN_ID);
