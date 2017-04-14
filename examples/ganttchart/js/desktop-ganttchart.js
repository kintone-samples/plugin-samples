/*
 * Gantt chart display of sample program
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, moment, PLUGIN_ID) {
    'use strict';
    var kintonePluginGranttChart = {
        lang: {
            ja: {
                months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                dow: ['月、', '火、', '水、', '木、', '金、', '土、', '日'],
                wait: '表示するまでお待ちください。'
            },
            en: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                wait: 'Please Wait...'
            },
            zh: {
                months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                dow: ['日', '一', '二', '三', '四', '五', '六'],
                wait: '请等待显示'
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
                self.initSetting();

                var ganttBox = self.uiCreateGanttBox();
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
            var GANTT_COLOR = self.settings.config['ganttchartColor'] || 'Priority',
                GANTT_NAME = self.settings.config['ganttchartTitle'] || 'To_Do',
                GANTT_DESC = self.settings.config['ganttchartDesc'] || 'Details',
                GANTT_FROM = self.settings.config['ganttchartFrom'] || 'From',
                GANTT_TO = self.settings.config['ganttchartTo'] || 'To',
                GANTT_LABEL = self.settings.config['ganttchartTitle'] || 'To_Do';

            // Set the record.
            for (var i = 0; i < records.length; i++) {

                var colorGantt = self.settings.element.classColorGanttDefault;

                var colorValue = records[i][GANTT_COLOR]['value'] || '';
                if (colorValue && self.settings.config.settingColors[colorValue]) {
                    var styleRecordClass = self.settings.element.prefixColorGantt + 'class-' + i;
                    colorGantt = styleRecordClass;
                    ganttStylesRecord[styleRecordClass] = self.settings.config.settingColors[colorValue];
                }

                var descGantt = '<b>' + self.escapeHtml(records[i][GANTT_NAME].value) + '</b>';
                if (records[i][GANTT_FROM]['value']) {
                    descGantt += '<div>' + 'From: ' +
                        self.escapeHtml(self.convertDateTimeWithTimezone(records[i][GANTT_FROM]['value'])) +
                        '</div>';
                }
                if (records[i][GANTT_TO]['value']) {
                    descGantt += '<div>' + 'To: ' +
                        self.escapeHtml(self.convertDateTimeWithTimezone(records[i][GANTT_TO]['value'])) +
                        '</div>';
                }
                if (records[i][GANTT_COLOR]['value']) {
                    descGantt += self.escapeHtml(records[i][GANTT_COLOR]['value']);
                }
                var ganttRecordData = {
                    id: self.escapeHtml(records[i]['$id'].value),
                    name: records[i][GANTT_NAME] ? self.escapeHtml(records[i][GANTT_NAME].value) : '',
                    desc: records[i][GANTT_DESC] ? self.escapeHtml(records[i][GANTT_DESC].value) : '',
                    values: [{
                        from: self.convertDateTime(records[i][GANTT_FROM].value),
                        to: self.convertDateTime(records[i][GANTT_TO].value),
                        desc: descGantt,
                        label: GANTT_LABEL ? self.escapeHtml(records[i][GANTT_LABEL]['value']) : '',
                        customClass: self.escapeHtml(colorGantt),
                        dataObj: {
                            'url': '/k/' + kintone.app.getId() + '/show#record=' + records[i]['$id']['value']
                        }
                    }]
                };
                self.data.push(ganttRecordData);
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
                    if (dataRecord && dataRecord.url) {
                        window.open(dataRecord.url, '_blank').focus();
                    }
                }
            });
        },
        uiCreateGanttBox: function() {
            var elGantt = document.getElementById('gantt');
            if (elGantt !== null) {
                return elGantt;
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
            elGantt = document.createElement('div');
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
