/*
 * Auto Number plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

(function(PLUGIN_ID, $) {
    'use strict';

    var kintonePluginAutonum = {
        lang: {
            ja: {
                alertMessage: {
                    failedAutoNumbering: '自動採番の番号取得に失敗しました\n',
                    apiTokenInvalid: 'APIトークンに正しい権限が設定されていません'

                }
            },
            en: {
                alertMessage: {
                    failedAutoNumbering: 'Failed to retrieve number for Autonumbering\n',
                    apiTokenInvalid: 'The API token does not have the correct permission'
                }
            }
        },
        settings: {
            lang: 'en',
            i18n: 'en',
            events: {
                onShow: [
                    'app.record.create.show',
                    'app.record.edit.show',
                    'app.record.index.edit.show'
                ],
                onSubmit: ['app.record.create.submit']
            },
            config: {
                plugin: kintone.plugin.app.getConfig(PLUGIN_ID)
            }
        },
        init: function() {
            if (!this.settings.config.plugin) {
                return false;
            }
            var user = kintone.getLoginUser();
            this.settings.lang = user['language'];
            this.settings.i18n = this.settings.lang in this.lang ? this.lang[this.settings.lang] : this.lang['en'];

            this.settings.config.TEXT = this.settings.config.plugin['text'];
            this.settings.config.FIELD_CODE = this.settings.config.plugin['autoNumberingFieldcode'];
            this.settings.config.SELECT_FORMAT = this.settings.config.plugin['format'];
            this.settings.config.DATE_SELECT_FORMAT = this.settings.config.plugin['dateFormat'];
            this.settings.config.CONNECTIVE = this.settings.config.plugin['connective'];
            this.settings.config.RESET_TIMING = this.settings.config.plugin['timing'];
            this.settings.config.FORMAT = [
                this.settings.config.plugin['format1'],
                this.settings.config.plugin['format2'],
                this.settings.config.plugin['format3']
            ];
            this.settings.config.NUM_OF_DIGIT = parseInt(this.settings.config.plugin['numOfDigit'], 10);

            this.kintoneEvents();
        },
        kintoneEvents: function() {
            var self = this;
            kintone.events.on(this.settings.events.onShow, function(event) {
                var record = event['record'];
                record[self.settings.config.FIELD_CODE]['disabled'] = true;
                if (event.type === 'app.record.create.show') {
                    record[self.settings.config.FIELD_CODE]['value'] = '';
                }
                return event;
            });
            // Get last record, parse id and increased 1
            kintone.events.on(this.settings.events.onSubmit, function(event) {

                var record = event.record;
                var NUMBERING_DEFAULT = 1;

                var query = 'order by $id desc limit 1';
                return self.apiRequest(query).then(function(respdata) {
                    if (!respdata.records[0] ||
                        respdata['records'][0][self.settings.config.FIELD_CODE]['value'] === ''
                    ) {
                        record[self.settings.config.FIELD_CODE]['value'] =
                            self.createWithNumberOfDigit(NUMBERING_DEFAULT);
                        return self.createFormat(self.createWithNumberOfDigit(NUMBERING_DEFAULT));
                    }
                    var lastNumberingResponse = respdata['records'][0][self.settings.config.FIELD_CODE]['value'];

                    var numbering;
                    if (self.isResetNumber(respdata)) {
                        numbering = NUMBERING_DEFAULT;
                    } else {
                        //handle case NUM_OF_DIGIT was changed
                        var lastIdArray = lastNumberingResponse.split(self.settings.config.CONNECTIVE);
                        var lastIdInt = lastIdArray[lastIdArray.length - 1];

                        numbering = parseInt(lastIdInt, 10) + 1;
                    }

                    var numberingWithNumberOfDigit = self.createWithNumberOfDigit(numbering);
                    var numberingWithFormat = self.createFormat(numberingWithNumberOfDigit);
                    numberingWithFormat = self.countupNumber(numberingWithFormat, numbering);

                    return numberingWithFormat;

                }).then(function(numberingWithFormat) {
                    record[self.settings.config.FIELD_CODE]['value'] = numberingWithFormat;
                    return event;

                }).catch(function(error) {
                    self.alertMessage(self.settings.i18n.alertMessage.failedAutoNumbering + ': ' + error.message);
                    return false;
                });
            });
        },
        createFormat: function(number) {
            var date = '';
            if (this.settings.config.DATE_SELECT_FORMAT !== 'null') {
                date = moment(new Date()).format(this.settings.config.DATE_SELECT_FORMAT);
            }
            switch (this.settings.config.SELECT_FORMAT) {
                case 'numbering':
                    return (number);

                case 'dateNumbering':
                    return (date + this.settings.config.CONNECTIVE + number);

                case 'dateTextNumbering':
                    return (date + this.settings.config.CONNECTIVE +
                            this.settings.config.TEXT +
                            this.settings.config.CONNECTIVE + number);

                case 'textNumbering':
                    return (this.settings.config.TEXT + this.settings.config.CONNECTIVE + number);

                case 'textDateNumbering':
                    return (this.settings.config.TEXT +
                            this.settings.config.CONNECTIVE + date +
                            this.settings.config.CONNECTIVE + number);

                default:
                    return ('');
            }
        },
        countupNumber: function(numberingWithFormat, countNumber) {
            var self = this;

            var newCountNumber = countNumber;
            var newlayout2 = numberingWithFormat;
            var zerono = this.createWithNumberOfDigit(countNumber);
            var query = self.settings.config.FIELD_CODE + '="' + newlayout2 + '"';

            return this.apiRequest(query).then(function(respdata) {
                // レコードを取得できた場合、重複のため番号を振りなおす
                if (respdata.records.length > 0) {
                    newCountNumber += 1;
                    zerono = self.createWithNumberOfDigit(newCountNumber);
                    newlayout2 = self.createFormat(zerono);
                    return self.countupNumber(newlayout2, newCountNumber);
                }
                return newlayout2;

            }, function() {
                self.alertMessage(self.settings.i18n.alertMessage.failedAutoNumbering);
                throw(self.settings.i18n.alertMessage.failedAutoNumbering);
            });
        },
        apiRequest: function(query) {
            var self = this;
            var appUrl = '';
            var params = {
                app: kintone.app.getId(),
                fields: self.settings.config.FIELD_CODE,
                query: query
            };
            return new kintone.Promise(function(resolve, reject) {
                if (self.settings.config.plugin.useProxy > 0) {
                    appUrl = kintone.api.urlForGet('/k/v1/records', params);
                    kintone.plugin.app.proxy(PLUGIN_ID, appUrl, 'GET', {}, {}, function(respdata) {
                        var responeDataJson = JSON.parse(respdata);
                        if (responeDataJson.records) {
                            resolve(responeDataJson);
                        } else {
                            self.alertMessage(self.settings.i18n.alertMessage.apiTokenInvalid);
                        }
                        
                    }, function(error) {
                        reject(error);
                    });
                } else {
                    appUrl = kintone.api.url('/k/v1/records', true);
                    kintone.api(appUrl, 'GET', params, function(respdata) {
                        if (respdata.records) {
                            resolve(respdata);
                        } else {
                            self.alertMessage(self.settings.i18n.alertMessage.apiTokenInvalid);
                        }
                    }, function(error) {
                        reject(error);
                    });
                }
            });
        },
        createWithNumberOfDigit: function(number) {
            if (number.toString().length >= this.settings.config.NUM_OF_DIGIT) {
                return number;
            }
            return (new Array(this.settings.config.NUM_OF_DIGIT).join('0') + number)
                .slice(-1 * this.settings.config.NUM_OF_DIGIT);
        },
        timingIsDateReset: function(before, after) {
            switch (this.settings.config.RESET_TIMING) {
                case 'yearly':
                    if (this.timingGetYear(before) !== this.timingGetYear(after)) {
                        return true;
                    }
                    return false;

                case 'monthly':
                    if (this.timingGetYear(before) + this.timingGetMonth(before) !==
                            this.timingGetYear(after) + this.timingGetMonth(after)) {
                        return true;
                    }
                    return false;
                case 'daily':
                    if (before !== after) {
                        return true;
                    }
                    return false;

                default:
                    return false;
            }
        },
        timingGetYear: function(stringDate) {
            var position = {start: 0, end: 0};
            if (this.settings.config.DATE_SELECT_FORMAT === 'MMDDYYYY' ||
                this.settings.config.DATE_SELECT_FORMAT === 'MMDDYY') {
                position.start = 4; // diff 2 char from MMDD
            } else if (this.settings.config.DATE_SELECT_FORMAT === 'MMYY' ||
                        this.settings.config.DATE_SELECT_FORMAT === 'MMYYYY') {
                position.start = 2; // diff 2 char from MM
            }

            if (this.settings.config.DATE_SELECT_FORMAT === 'YY' ||
                this.settings.config.DATE_SELECT_FORMAT === 'MMDDYY' ||
                this.settings.config.DATE_SELECT_FORMAT === 'MMYY') {
                position.end = 2; // Year with 2 character
            } else {
                position.end = 4; // Year with 4 character
            }
            return stringDate.substr(position.start, position.end);
        },
        timingGetMonth: function(stringDate) {
            var position = {start: 0, end: 2}; // end = 2 because month always come with 2 character
            if (this.settings.config.DATE_SELECT_FORMAT === 'YYYYMMDD' ||
                this.settings.config.DATE_SELECT_FORMAT === 'YYYYMM') {
                position.start = 4; // Year with 4 characters
            }
            return stringDate.substr(position.start, position.end);
        },
        countupStartPoint: function(startPoint, format) {
            var formatDate = moment().format(this.settings.config.DATE_SELECT_FORMAT);

            if (format === 'date') {
                var datelen = formatDate.length + 1;
                return (startPoint + datelen);

            } else if (format === 'text') {
                var textLength = this.settings.config.TEXT.length + 1;
                return (startPoint + textLength);
            }
        },
        checkFormat: function(startPoint, autonum, format) {

            var formatDate = moment().format(this.settings.config.DATE_SELECT_FORMAT); // 書式で「日付」が選択されている場合、日付情報作成
            var before;
            var after;

            // 書式で「日付」が選択されている場合の形式チェック
            if (format === 'date') {
                // 日付+接続語の長さを取得
                var datelen = formatDate.length + 1;
                before = autonum.substr(startPoint, datelen);
                after = formatDate + this.settings.config.CONNECTIVE;

                // 接続語の位置が一致しているかの確認
                if (before.indexOf(this.settings.config.CONNECTIVE) !==
                    after.indexOf(this.settings.config.CONNECTIVE)) {
                    return true;
                }

                // 頭1文字で比較(桁数が同じ場合の制御で「西暦(4桁)」「月日(4桁)」、「テキスト設定」「日付」の比較用)
                if (before.substr(0, 1) !== after.substr(0, 1)) {
                    return true;
                }

                // 日付によるリセットタイミングの確認
                if (this.timingIsDateReset(before, after)) {
                    return true;
                }
                return false;

                // 書式で「テキスト」が選択されている場合の形式チェック
            } else if (format === 'text') {
                // テキスト設定+接続語の長さを取得

                var textLength = this.settings.config.TEXT.length + 1;

                before = autonum.substr(startPoint, textLength);
                after = this.settings.config.TEXT + this.settings.config.CONNECTIVE;

                // 設定文書のテキスト設定と前採番の形式チェック
                if (before !== after) {
                    return true;
                }
                return false;
            }
        },
        isResetNumber: function(respdata) {

            var loopNumber;

            // 書式の連番位置からループ回数の取得
            if (this.settings.config.FORMAT[0] === 'number') {
                loopNumber = 0;
            } else if (this.settings.config.FORMAT[1] === 'number') {
                loopNumber = 1;
            } else if (this.settings.config.FORMAT[2] === 'number') {
                loopNumber = 2;
            }

            // 検索にヒットした最新の採番取得
            var autonum = respdata['records'][0][this.settings.config.FIELD_CODE]['value'];
            var count = 0;
            var pos = autonum.indexOf(this.settings.config.CONNECTIVE);

            while (pos !== -1) {
                count++;
                pos = autonum.indexOf(this.settings.config.CONNECTIVE, pos + 1);
            }

            // 直近に採番された書式と新しく採番する書式の接続語の個数比較
            if (loopNumber !== count) {
                return true;
            }
            var startPoint = 0;

            // 書式で「日付」「テキスト」が選択されている場合のみ形式チェックを行う
            for (var i = 0; i < loopNumber; i++) {
                if (this.checkFormat(startPoint, autonum, this.settings.config.FORMAT[i])) {
                    return true;
                }
                startPoint = this.countupStartPoint(startPoint, this.settings.config.FORMAT[i]);
            }
            return false;
        },
        alertMessage: function(message) {
            var alertButtonClose = $('<span class="close"></span>'),
                alertMessage = $('<div class="kintoneplugin-alert popup"><span>' + message + '</span></div>');
            alertButtonClose.click(function() {
                $(this).parents('.kintoneplugin-alert-popup').remove();
            });
            alertMessage.append(alertButtonClose);
            $('body').append($('<div class="kintoneplugin-alert-popup"></div>').append(alertMessage));
        }

    };
    kintonePluginAutonum.init();
})(kintone.$PLUGIN_ID, jQuery);