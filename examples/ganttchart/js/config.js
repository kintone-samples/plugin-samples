jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    $(document).ready(function() {
        var kintonePluginGranttChart = {
            terms: {
                en: {
                    ganttchartTitle: 'Title',
                    ganttchartTitleLabel: '(A).Field of title',
                    ganttchartTitleDescription: 'Please specify the fields to be displayed' +
                        ' in the first classification of the vertical axis of the Gantt chart.',
                    ganttchartDesc: 'Subtitle',
                    ganttchartDescLabel: '(B).Field of subtitle',
                    ganttchartDescDescription: 'Please specify the fields to be displayed' +
                        ' in the second classification of the vertical axis of the Gantt chart.',
                    ganttchartFrom: 'Start date',
                    ganttchartFromLabel: '(C).Field of start date (or date and time)',
                    ganttchartFromDescription: '',
                    ganttchartTo: 'End date',
                    ganttchartToLabel: '(D).Field of end date (or date and time)',
                    ganttchartToDescription: '',
                    ganttchartColor: 'Color of chart',
                    ganttchartColorLabel: '(E).Field of color',
                    ganttchartColorLabelName: 'Color',
                    ganttchartColorLabelSetting: 'Value',
                    ganttchartColorDescription: 'Please enter the condition value coloring to.' +
                        '(More certain when example of \'A, B, C\') if the condition value is duplicated, ' +
                        'it will be priority from the top.',
                    ganttchartScall: 'Scall',
                    ganttchartScallLabel: 'Scale to be displayed early.',
                    ganttchartScallDescription: '',
                    ganttchartScallOption: {
                        hours: 'Hours',
                        days: 'Days',
                        weeks: 'Weeks',
                        months: 'Months'
                    },
                    error: 'Error: ',
                    pluginSubmit: 'Save',
                    pluginCancel: 'Cancel',
                    requiredField: 'Required field is empty.',
                    subTableField: 'This field can not select table field.',
                    mixedField: 'Can not mix [Table] field and normal field.'
                },
                ja: {
                    ganttchartTitle: 'タイトル',
                    ganttchartTitleLabel: '(A).タイトルにするフィールド',
                    ganttchartTitleDescription: 'ガントチャートの縦軸の第一分類に表示するフィールドを指定してください。',
                    ganttchartDesc: 'サブタイトル',
                    ganttchartDescLabel: '(B).サブタイトルにするフィールド',
                    ganttchartDescDescription: 'ガントチャートの縦軸の第二分類に表示するフィールドを指定してください。',
                    ganttchartFrom: '開始日',
                    ganttchartFromLabel: '(C).開始日(開始日時)のフィールド',
                    ganttchartFromDescription: '',
                    ganttchartTo: '終了日',
                    ganttchartToLabel: '(D).終了日(終了日時)のフィールド',
                    ganttchartToDescription: '',
                    ganttchartColor: 'チャートカラー',
                    ganttchartColorLabel: '(E).色付けするフィールド',
                    ganttchartColorLabelName: 'カラー',
                    ganttchartColorLabelSetting: '設定値',
                    ganttchartColorDescription: '色付けする条件値を入力してください。（複数ある際の例「A,B,C」） 条件値が重複する場合には、上から優先されます。',
                    ganttchartScall: 'スケール',
                    ganttchartScallLabel: '初期に表示するスケール',
                    ganttchartScallDescription: '',
                    ganttchartScallOption: {
                        hours: '時間',
                        days: '日',
                        weeks: '週',
                        months: '月'
                    },
                    error: 'エラー: ',
                    pluginSubmit: '保存',
                    pluginCancel: 'キャンセル',
                    requiredField: '必須項目が入力されていません。',
                    subTableField: 'タイトルをテーブルフィールドにすることはできません。',
                    mixedField: '[Table]フィールドと通常のフィールドを混在させることはできません。'
                }
            },
            settings: {
                config: kintone.plugin.app.getConfig(PLUGIN_ID),
                lang: 'en',
                i18n: {},
                form: {},
                formCode: {},
                element: {
                    gantt: '#ganttchart-plugin',
                    ganttForm: '.ganttchart-plugin-form',
                    ganttchartTitle: '#ganttchart-plugin-title',
                    ganttchartDesc: '#ganttchart-plugin-desc',
                    ganttchartFrom: '#ganttchart-plugin-from',
                    ganttchartTo: '#ganttchart-plugin-to',
                    ganttchartColor: '#ganttchart-plugin-color',
                    ganttchartScall: 'input[name="ganttchart-plugin-scale"]',
                    formSubmit: '.form-submit'
                },
                CONST: {
                    BOX_CONFIRM_HEIGHT_PX: 160,
                    CLIENT_MIN_HEIGHT_PX: 750
                }
            },
            init: function() {
                var self = this;
                // To switch the display by the login user's language (English display by default)
                this.settings.lang = kintone.getLoginUser().language;
                this.settings.i18n = this.settings.lang in this.terms ?
                    this.terms[this.settings.lang] : this.terms['en'];

                this.settings.config.settingColors = JSON.parse(this.settings.config.settingColors || '{}');
                kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {
                    app: kintone.app.getId()
                }, function(resp) {
                    self.settings.form = resp.properties;
                    $(self.settings.element.gantt).removeClass('loading');
                    self.templateRender();
                });
            },
            templateRender: function() {
                var self = this;
                var configHtml = $(this.settings.element.gantt).html();
                var tmpl = $.templates(configHtml);
                $('div#ganttchart-plugin').html(tmpl.render({
                    terms: this.settings.i18n
                }));
                // Set in the item selection box retrieves the form information design
                for (var key in this.settings.form) {
                    if (!this.settings.form.hasOwnProperty(key)) {
                        continue;
                    }
                    var prop = this.settings.form[key];
                    this.settings.formCode[prop['code']] = this.settings.form[key];
                    switch (prop['type']) {
                        case 'SINGLE_LINE_TEXT':
                        case 'MULTI_LINE_TEXT':
                            $('#ganttchart-plugin-title')
                                .append($('<option>')
                                    .text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            $('#ganttchart-plugin-desc')
                                .append($('<option>')
                                    .text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            $('#ganttchart-plugin-url')
                                .append($('<option>')
                                    .text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            break;

                        case 'DATE':
                        case 'DATETIME':
                            $('#ganttchart-plugin-from')
                                .append($('<option>').text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            $('#ganttchart-plugin-to')
                                .append($('<option>').text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            break;

                        case 'RADIO_BUTTON':
                        case 'DROP_DOWN':
                            $('#ganttchart-plugin-color')
                                .append($('<option>')
                                    .text(prop['label'])
                                    .val(this.escapeHtml(prop['code'])));
                            break;
                        case 'SUBTABLE':
                            if (key !== "Table") {
                                continue;
                            }
                            for (var key2 in this.settings.form[prop.code].fields) {
                                if (!this.settings.form[prop.code].fields.hasOwnProperty(key2)) {
                                    continue;
                                }
                                var prop2 = this.settings.form[prop.code].fields[key2];
                                this.settings.formCode[prop2['code']] = this.settings.form[prop.code].fields[key2];
                                switch (prop2['type']) {
                                    case 'SINGLE_LINE_TEXT':
                                    case 'MULTI_LINE_TEXT':
                                        $('#ganttchart-plugin-title')
                                            .append($('<option>')
                                                .text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        $('#ganttchart-plugin-desc')
                                            .append($('<option>')
                                                .text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        $('#ganttchart-plugin-url')
                                            .append($('<option>')
                                                .text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        break;

                                    case 'DATE':
                                    case 'DATETIME':
                                        $('#ganttchart-plugin-from')
                                            .append($('<option>').text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        $('#ganttchart-plugin-to')
                                            .append($('<option>').text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        break;

                                    case 'RADIO_BUTTON':
                                    case 'DROP_DOWN':
                                        $('#ganttchart-plugin-color')
                                            .append($('<option>')
                                                .text('[Table]' + prop2['label'])
                                                .val(this.escapeHtml(prop2['code'])));
                                        break;
                                }
                            }
                            break;
                    }
                }
                // Get the plug-in information to set the definition data
                $('#ganttchart-plugin-title').val(this.escapeHtml(this.settings.config['ganttchartTitle']));
                $('#ganttchart-plugin-desc').val(this.escapeHtml(this.settings.config['ganttchartDesc']));
                $('#ganttchart-plugin-from').val(this.escapeHtml(this.settings.config['ganttchartFrom']));
                $('#ganttchart-plugin-to').val(this.escapeHtml(this.settings.config['ganttchartTo']));
                $('#ganttchart-plugin-color').val(this.escapeHtml(this.settings.config['ganttchartColor']));
                $(this.settings.element.ganttchartScall).val([self.settings.config['ganttchartScall'] || 'days']);
                //Fixed header
                this.uiSetFormSubmitIsFixed();
                var timeoutResize;
                $(window).resize(function() {
                    clearTimeout(timeoutResize);
                    timeoutResize = setTimeout(function() {
                        self.uiSetFormSubmitIsFixed();
                    }, 150);
                });
                //Set color setting
                this.settingColorsSet();
                //Show form setting
                $(this.settings.element.gantt).css('display', 'block');
                //Listen action
                this.listenAction();
            },
            uiSetFormSubmitIsFixed: function() {
                var CLIENT_MIN_HEIGHT_PX = 750;
                if ($(window).height() < CLIENT_MIN_HEIGHT_PX) {
                    $(this.settings.element.gantt + ' .submit-bottom').show();
                    $(this.settings.element.ganttForm).css('max-height', 'none');
                    return;
                }
                $(this.settings.element.gantt + ' .submit-bottom').hide();

                var parentHeight = $(this.settings.element.gantt).parents('td').offset().top;
                parentHeight += this.settings.CONST.BOX_CONFIRM_HEIGHT_PX;
                $(this.settings.element.ganttForm).css('max-height', $(window).height() - parentHeight);
            },
            listenAction: function() {
                var self = this;
                //Remove alert when select
                $(this.settings.element.gantt).on('change', 'select', function() {
                    $(this).parents('.kintoneplugin-row').find('.kintoneplugin-alert').remove();
                });
                //on submit
                $(document).on('click', '.pluginSubmit', function() {
                    self.settingSave();
                });
                //on cancel
                $(document).on('click', '.pluginCancel', function() {
                    history.back();
                });
                //Select color picker
                $(this.settings.element.gantt).on('focus', 'input.ganttchart-plugin-color-selected', function() {
                    $(this).colorPicker({
                        opacity: false,
                        preventFocus: false
                    });
                });
                this.settingColorsListen();
            },
            settingSave: function() {
                // Save the value
                var ganttchartTitle = $(this.settings.element.ganttchartTitle).val();
                var ganttchartDesc = $(this.settings.element.ganttchartDesc).val();
                var ganttchartFrom = $(this.settings.element.ganttchartFrom).val();
                var ganttchartTo = $(this.settings.element.ganttchartTo).val();
                var ganttchartColor = $(this.settings.element.ganttchartColor).val();
                var ganttchartScall = $(this.settings.element.ganttchartScall + ':checked').val() || 'days';

                // Check table fields
                var ganntTableCheckTmp = {
                    title: $(this.settings.element.ganttchartTitle + " option:selected").text(),
                    desc: $(this.settings.element.ganttchartDesc + " option:selected").text(),
                    from: $(this.settings.element.ganttchartFrom + " option:selected").text(),
                    to: $(this.settings.element.ganttchartTo + " option:selected").text(),
                    color: $(this.settings.element.ganttchartColor + " option:selected").text()
                };

                var formValid = true;
                // Check the required fields
                if (ganttchartTitle === '') {
                    this.alert(this.settings.element.ganttchartTitle, this.settings.i18n.requiredField);
                    formValid = false;
                } else if (ganntTableCheckTmp.title.indexOf("[Table]") === 0) {
                    this.alert(this.settings.element.ganttchartTitle, this.settings.i18n.subTableField);
                    formValid = false;
                }
                if (ganttchartFrom === '') {
                    this.alert(this.settings.element.ganttchartFrom, this.settings.i18n.requiredField);
                    formValid = false;
                }
                if (ganttchartTo === '') {
                    this.alert(this.settings.element.ganttchartTo, this.settings.i18n.requiredField);
                    formValid = false;
                }
                if (ganttchartColor === '') {
                    this.alert(this.settings.element.ganttchartColor, this.settings.i18n.requiredField);
                    formValid = false;
                }
                if (ganttchartScall === '') {
                    this.alert(this.settings.element.ganttchartScall, this.settings.i18n.requiredField);
                    formValid = false;
                }
                if (!formValid) {
                    return;
                }
                // テーブルと非テーブルフィールドの混在チェック
                if (!(((ganntTableCheckTmp.desc.indexOf("[Table]") === 0 || ganntTableCheckTmp.desc === "--") &&
                ganntTableCheckTmp.from.indexOf("[Table]") === 0 &&
                ganntTableCheckTmp.to.indexOf("[Table]") === 0 &&
                ganntTableCheckTmp.color.indexOf("[Table]") === 0) ||
                (ganntTableCheckTmp.desc.indexOf("[Table]") === -1 &&
                ganntTableCheckTmp.from.indexOf("[Table]") === -1 &&
                ganntTableCheckTmp.to.indexOf("[Table]") === -1 &&
                ganntTableCheckTmp.color.indexOf("[Table]") === -1))) {
                    this.alert(this.settings.element.ganttchartDesc, this.settings.i18n.mixedField);
                    this.alert(this.settings.element.ganttchartFrom, this.settings.i18n.mixedField);
                    this.alert(this.settings.element.ganttchartTo, this.settings.i18n.mixedField);
                    this.alert(this.settings.element.ganttchartColor, this.settings.i18n.mixedField);
                    formValid = false;
                }
                if (!formValid) {
                    return;
                }
                // Set the definition data
                this.settings.config['ganttchartTitle'] = ganttchartTitle;
                this.settings.config['ganttchartDesc'] = ganttchartDesc;
                this.settings.config['ganttchartFrom'] = ganttchartFrom;
                this.settings.config['ganttchartTo'] = ganttchartTo;
                this.settings.config['ganttchartColor'] = ganttchartColor;
                this.settings.config['ganttchartScall'] = ganttchartScall;
                this.settings.config['settingColors'] = JSON.stringify(this.settingColorsGet());
                this.settings.config['fieldNameTitle'] = ganntTableCheckTmp.title;
                this.settings.config['fieldNameDesc'] = ganntTableCheckTmp.desc;
                this.settings.config['fieldNameFrom'] = ganntTableCheckTmp.from;
                this.settings.config['fieldNameTo'] = ganntTableCheckTmp.to;
                this.settings.config['fieldNameColor'] = ganntTableCheckTmp.color;
                kintone.plugin.app.setConfig(this.settings.config);
            },
            settingColorsGet: function() {
                var settingColors = {};
                $(this.settings.element.gantt + ' table > tbody > tr').each(function() {
                    var elementValue = $(this).find('td');
                    var fieldValue = elementValue[0].children[0].value;
                    var fieldColor = elementValue[1].children[0].value;
                    if (fieldValue && fieldColor) {
                        settingColors[fieldValue] = fieldColor;
                    }
                });
                return settingColors;
            },
            settingColorsSet: function() {
                if (!this.settings.config.settingColors) {
                    return;
                }
                var tableColor = $(this.settings.element.gantt + ' table > tbody');
                var settingColorRow = tableColor.find('tr');
                for (var valueColor in this.settings.config.settingColors) {
                    if (!this.settings.config.settingColors.hasOwnProperty(valueColor)) {
                        continue;
                    }
                    var settingColorRowClone = settingColorRow.clone();
                    var elementValue = settingColorRowClone.find('td');
                    elementValue[0].children[0].value = valueColor;
                    elementValue[1].children[0].value = this.settings.config.settingColors[valueColor];
                    elementValue[1].children[0].style.backgroundColor = this.settings.config.settingColors[valueColor];
                    tableColor.append(settingColorRowClone);
                }
                //Add more setting
                if (Object.keys(this.settings.config.settingColors).length === 0) {
                    tableColor.append(settingColorRow.clone());
                }
                settingColorRow.remove();
            },
            settingColorsListen: function() {
                //Add/remove color setting
                $(this.settings.element.gantt).on('click', '.column-add-more > a', function() {
                    var elementAction = $(this);
                    var rowContain = elementAction.parent().parent();
                    if (elementAction.hasClass('add')) {
                        rowContain.parent().append(rowContain.clone());
                        rowContain.next().find('input[type=text]').val('').removeAttr('style');
                        return;
                    }
                    //remove value input if has one element 'tr'
                    if (rowContain.parent().find('tr').length === 1) {
                        rowContain.find('input[type=text]').val('').removeAttr('style');
                        return;
                    }
                    rowContain.remove();
                });
            },
            alert: function(element, mess) {
                var elementParrent = $(element).parent();
                elementParrent.parent().find('.kintoneplugin-alert').remove();
                if ($('.kintoneplugin-alert').length === 0) {
                    $(element).focus();
                }
                elementParrent.after('<div class="kintoneplugin-alert"><p>' + mess + '</p></div>');
            },
            escapeHtml: function(str) {
                if (typeof str !== 'string') {
                    return '';
                }
                return str.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/'/g, '&quot;')
                    .replace(/'/g, '&#39;');
            },
            validateFormquarter: function(kintoneFormConfig) {
                for (var optionIndex in this.settings.formCode[kintoneFormConfig].options) {
                    if (!this.settings.formCode[kintoneFormConfig].options.hasOwnProperty(optionIndex)) {
                        continue;
                    }
                    if (!this.parseQuarter(this.settings.formCode[kintoneFormConfig].options[optionIndex])) {
                        return false;
                    }
                }
                return true;
            }
        };
        kintonePluginGranttChart.init();
    });
})(jQuery, kintone.$PLUGIN_ID);
