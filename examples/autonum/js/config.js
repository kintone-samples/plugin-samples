/*
 * Auto Number plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */

((PLUGIN_ID) => {
  'use strict';
  const kintonePluginConfigAutonum = {
    lang: {
      ja: {
        preview: 'プレビュー',
        targetField: '自動採番フィールド選択',
        selectFormat: '採番書式選択',
        typeOfFormat: {
          numbering: '連番',
          dateNumbering: '日付 + 連番',
          dateTextNumbering: '日付 + テキスト + 連番',
          textNumbering: 'テキスト + 連番',
          textDateNumbering: 'テキスト + 日付 + 連番'
        },
        dateFormat: '日付書式選択（採番書式に日付が含まれる場合のみ）',
        typeOfDateFormat: {
          YYYYMMDD: '年月日(YYYYMMDD)',
          YYYYMM: '年月(YYYYMM)',
          MMDD: '月日(MMDD)',

          MMDDYYYY: '月日年[西暦4桁](MMDDYYYY)',
          MMDDYY: '月日年[西暦2桁](MMDDYY)',
          MMYYYY: '月年[西暦4桁](MMYYYY)',
          MMYY: '月年[西暦2桁](MMYY)',

          YYYY: '年[西暦4桁](YYYY)',
          YY: '年[西暦2桁](YY)'
        },
        textFormat: 'テキスト入力（採番書式にテキストが含まれる場合のみ）',
        connective: '接続語設定',
        typeOfConnective: {
          hyphen: {'value': '-', 'text': 'ハイフン( - )'},
          underscore: {'value': '_', 'text': 'アンダースコア( _ )'}
        },
        numberingOfDigits: '採番の桁数',
        resetTiming: '連番リセットタイミング選択',
        typeOfResetTiming: {
          none: 'なし',
          yearly: '年毎',
          monthly: '月毎',
          daily: '日毎'
        },
        apiToken: 'APIトークン (レコードにアクセス権設定を行う場合)',
        saveButton: '保存',
        cancelButton: 'キャンセル',
        alertMessage: {
          failedAutoNumbering: '自動採番の番号取得に失敗しました\n',
          notSelectedNumberingField: '自動採番フィールドが選択されていません',
          notSelectedFormat: '書式が選択されていません',
          notSelectedConnectionChar: '接続語が選択されていません',
          notSelectedDateFormat: '日付形式が選択されていません',
          notInputTextFormat: 'テキストが入力されていません',
          invalidNumberingOfDigits: '採番の桁数に正の整数を入力してください',
          canNotUseConnectionCharForTextFormat: 'テキストに接続語(-, _)を\n入力することはできません',
          canNotUseHTMLCharactersForTextFormat: 'テキストにHTML特殊文字(&, <, >, \', ")を\n入力することはできません',
          apiTokenInvalid: 'APIトークンに正しい権限が設定されていません'
        }
      },
      en: {
        preview: 'Preview',
        targetField: 'Field to display Autonumber',
        selectFormat: 'Autonumber format',
        typeOfFormat: {
          numbering: 'Numbering',
          dateNumbering: 'Date + Numbering',
          dateTextNumbering: 'Date + Text + Numbering',
          textNumbering: 'Text + Numbering',
          textDateNumbering: 'Text + Date + Numbering'
        },
        dateFormat: 'Date format (if included in Autonumber format)',
        typeOfDateFormat: {
          YYYYMMDD: 'YYYYMMDD',
          YYYYMM: 'YYYYMM',
          MMDD: 'MMDD',

          MMDDYYYY: 'MMDDYYYY',
          MMDDYY: 'MMDDYY',
          MMYYYY: 'MMYYYY',
          MMYY: 'MMYY',

          YYYY: 'YYYY',
          YY: 'YY'
        },
        textFormat: 'Text format (if included in Autonumber format)',
        connective: 'Connector',
        typeOfConnective: {
          hyphen: {'value': '-', 'text': 'Hyphen ( - )'},
          underscore: {'value': '_', 'text': 'Underscore ( _ )'}
        },
        numberingOfDigits: 'Number of digits for Numbering',
        resetTiming: 'Reset timing for Numbering',
        typeOfResetTiming: {
          none: 'Never',
          yearly: 'Yearly',
          monthly: 'Monthly',
          daily: 'Daily'
        },
        apiToken: 'API Token (recommended if records have access permissions)',
        saveButton: 'Save',
        cancelButton: 'Cancel',
        alertMessage: {
          failedAutoNumbering: 'Failed to retrieve number for Autonumbering\n',
          notSelectedNumberingField: 'Select a Field to display Autonumber',
          notSelectedFormat: 'Select an Autonumber format',
          notSelectedConnectionChar: 'Select a Connector',
          notSelectedDateFormat: 'Select a Date format',
          notInputTextFormat: 'Input a Text format',
          invalidNumberingOfDigits: 'Input a positive number for Number of digits',
          canNotUseConnectionCharForTextFormat: 'Connectors(-, _) cannot be used for Text format',
          canNotUseHTMLCharactersForTextFormat: '&, <, >, \', " cannot be used for Text format',
          apiTokenInvalid: 'The API token does not have the correct permission'
        }
      },
      zh: {
        preview: '编号预览',
        targetField: '显示自动编号的字段',
        selectFormat: '自动编号的格式',
        typeOfFormat: {
          numbering: '编号',
          dateNumbering: '日期 + 编号',
          dateTextNumbering: '日期 + 文本 + 编号',
          textNumbering: '文本 + 编号',
          textDateNumbering: '文本 + 日期 + 编号'
        },
        dateFormat: '日期格式 (当选择的自动编号格式内包含了日期时可设置此项)',
        typeOfDateFormat: {
          YYYYMMDD: '年月日(YYYYMMDD)',
          YYYYMM: '年月(YYYYMM)',
          MMDD: '月日(MMDD)',
          MMDDYYYY: '月日年[阳历4位](MMDDYYYY)',
          MMDDYY: '月日年[阳历2位](MMDDYY)',
          MMYYYY: '月年[阳历4位](MMYYYY)',
          MMYY: '月年[阳历2位](MMYY)',
          YYYY: '年[阳历4位](YYYY)',
          YY: '年[阳历2位](YY)'
        },
        textFormat: '文本格式 (当选择的自动编号格式内包含了文本时可设置此项)',
        connective: '连接符号',
        typeOfConnective: {
          hyphen: {'value': '-', 'text': '连字符 ( - )'},
          underscore: {'value': '_', 'text': '下划线 ( _ )'}
        },
        numberingOfDigits: '自动编号的长度',
        resetTiming: '何时重置编号',
        typeOfResetTiming: {
          none: '从不',
          yearly: '每年',
          monthly: '每月',
          daily: '每天'
        },
        apiToken: 'API令牌(如需记录的访问权限)',
        saveButton: '保存',
        cancelButton: '取消',
        alertMessage: {
          failedAutoNumbering: '自动编号获取失败\n',
          notSelectedNumberingField: '未选择[显示自动编号的字段]',
          notSelectedFormat: '未选择格式',
          notSelectedConnectionChar: '未选择连接符号',
          notSelectedDateFormat: '未选择日期格式',
          notInputTextFormat: '未输入文本',
          invalidNumberingOfDigits: '自动编号的长度请输入正整数',
          canNotUseConnectionCharForTextFormat: '文本不得含有连接符号(-, _)',
          canNotUseHTMLCharactersForTextFormat: '文本中不可输入HTML的特殊符号(&, <, >, \', ")',
          apiTokenInvalid: 'API令牌的权限设置不正确'
        }
      }
    },
    settings: {
      lang: 'en',
      i18n: {},
      config: {
        plugin: kintone.plugin.app.getConfig(PLUGIN_ID)
      },
      element: {
        form: '#kintoneplugin-setting',
        formSetting: '.kintoneplugin-setting-form',
        formSubmit: '.form-submit',
        input: {
          fieldCode: '#autonum-fieldselect',
          prefix: '#autonum-prefix',
          timing: 'input[name="autonum-resetTiming"]',
          preview: '#autonum-preview',
          apiToken: '#autonum-api-token',
          numberOfDigit: '#autonum-number-of-digit',
          textFormatSelect: '#autonum-textFormat-select',
          dateFormatSelect: '#autonum-dateFormat-select',
          connectiveSelect: '#autonum-connective-select'
        }
      },
      apiURL: {
        formField: kintone.api.url('/k/v1/preview/app/form/fields', true)
      },
      CONST: {
        BOX_CONFIRM_HEIGHT_PX: 160,
        CLIENT_MIN_HEIGHT_PX: 750
      }
    },
    init: function() {
      const self = this;
      this.settings.lang = kintone.getLoginUser().language;
      this.settings.i18n = this.settings.lang in this.lang ? this.lang[this.settings.lang] : this.lang.en;

      if (this.settings.config.plugin.useProxy > 0) {
        const params = {
          app: kintone.app.getId(),
          fields: this.settings.config.plugin.autoNumberingFieldcode
        };
        const appUrl = kintone.api.urlForGet('/k/v1/records', params, true);
        this.settings.config.proxy = kintone.plugin.app.getProxyConfig(appUrl, 'GET');
      }
      kintone.api(this.settings.apiURL.formField, 'GET', {'app': kintone.app.getId()},
        (respone) => {
          for (const key in respone.properties) {
            if (!Object.prototype.hasOwnProperty.call(respone.properties, key)) {
              continue;
            }

            const prop = respone.properties[key];
            if (prop.type === 'SINGLE_LINE_TEXT') {
              const option = document.createElement('option');
              option.value = self.escapeHtml(prop.code);
              option.textContent = self.escapeHtml(prop.label);

              document.querySelector(self.settings.element.input.fieldCode).appendChild(option);
            }
          }
          document.querySelector(self.settings.element.form).classList.remove('loading');
          self.templateRender();
        });

    },
    templateRender: function() {
      const self = this;
      const formEl = document.querySelector(this.settings.element.form);
      const configHtml = formEl.innerHTML;
      const tmpl = $.templates(configHtml);
      formEl.innerHTML = tmpl.render({
        lang: this.settings.i18n
      });
      formEl.style.display = '';

      self.setDefault();
      self.listenAction();

      self.uiSetFormSubmitIsFixed();
      let timeoutResize;
      window.addEventListener('resize', () => {
        clearTimeout(timeoutResize);
        timeoutResize = setTimeout(() => {
          self.uiSetFormSubmitIsFixed();
        }, 150);
      });
    },
    setDefault: function() {
      const conf = this.settings.config.plugin;
      const apiToken = this.settings.config.proxy ? this.settings.config.proxy.headers['X-Cybozu-API-Token'] : '';
      if (Object.keys(conf).length === 0) {
        return false;
      }
      document.querySelector(this.settings.element.input.fieldCode).value = conf.autoNumberingFieldcode;
      document.querySelector(this.settings.element.input.textFormatSelect).value = conf.format;
      document.querySelector(this.settings.element.input.dateFormatSelect).value = conf.dateFormat;
      document.querySelector(this.settings.element.input.connectiveSelect).value = conf.connective;
      document.querySelector(this.settings.element.input.prefix).value = conf.text;
      document.querySelector(this.settings.element.input.preview).textContent = conf.preview;
      document.querySelectorAll(this.settings.element.input.timing).forEach((radio) => {
        radio.checked = (radio.value === conf.timing);
      });
      document.querySelector(this.settings.element.input.apiToken).value = apiToken;
      document.querySelector(this.settings.element.input.numberOfDigit).value = conf.numOfDigit;
      this.checkAutonumFormat();
    },
    listenAction: function() {
      const self = this;
      document.querySelectorAll(
        this.settings.element.input.fieldCode + ', ' +
                this.settings.element.input.prefix + ', ' +
                this.settings.element.input.numberOfDigit + ', ' +
                this.settings.element.input.textFormatSelect + ', ' +
                this.settings.element.input.dateFormatSelect + ', ' +
                this.settings.element.input.connectiveSelect
      ).forEach((el) => {
        el.addEventListener('change', () => {
          const format = self.createPreview(document.querySelector(self.settings.element.input.textFormatSelect).value);
          document.querySelector(self.settings.element.input.preview).innerHTML = self.escapeHtml(format || '');
        });
      });
      document.querySelector(this.settings.element.input.textFormatSelect).addEventListener('change', () => {
        self.checkAutonumFormat();
      });
      document.querySelector(this.settings.element.input.dateFormatSelect).addEventListener('change', () => {
        self.propRadioTiming();
      });
      document.querySelector('button.plugin_submit').addEventListener('click', () => {
        self.settingSave();
      });
      document.querySelector('button.plugin_cancel').addEventListener('click', () => {
        history.back();
      });
    },
    createPreview: function(selectFormat) {
      const text = document.querySelector(this.settings.element.input.prefix).value;
      if (!this.validateFormValue()) {
        return;
      }
      const numOfDigit = parseInt(document.querySelector(this.settings.element.input.numberOfDigit).value, 10);
      const number = new Array(numOfDigit).join('0') + '1';
      const dateVal = document.querySelector(this.settings.element.input.dateFormatSelect).value || 'null';
      const connective = document.querySelector(this.settings.element.input.connectiveSelect).value || '';
      const date = dateVal !== 'null' ? moment().format(dateVal) : '';

      switch (selectFormat) {
        case 'numbering':
          return (number);

        case 'dateNumbering':
          return (date + connective + number);

        case 'dateTextNumbering':
          return (date + connective + text + connective + number);

        case 'textNumbering':
          return (text + connective + number);

        case 'textDateNumbering':
          return (text + connective + date + connective + number);

        default:
          return '';
      }
    },
    settingSave: function() {
      const config = this.validateFormValue();
      if (config === false) {
        return;
      }
      if (parseInt(config.useProxy, 10) > 0) {
        this.settingSaveProxy(() => {
          kintone.plugin.app.setConfig(config);
        });
        return;
      }
      kintone.plugin.app.setConfig(config);
    },
    settingSaveProxy: function(callback) {
      const apiToken = document.querySelector(this.settings.element.input.apiToken).value;
      const numberingFieldcode = document.querySelector(this.settings.element.input.fieldCode).value;

      const params = {
        app: kintone.app.getId(),
        fields: numberingFieldcode
      };
      const headerProxy = {
        'X-Cybozu-API-Token': apiToken
      };
      const appUrl = kintone.api.urlForGet('/k/v1/records', params, true);
      const method = 'GET';
      this.validateProxy(appUrl, method, headerProxy, {}, () => {
        kintone.plugin.app.setProxyConfig(appUrl, method, headerProxy, {}, callback);
      });

    },
    validateProxy: function(url, method, header, data, callback) {
      const self = this;
      kintone.proxy(url, method, header, data, (respdata) => {
        const responeDataJson = JSON.parse(respdata);
        if (responeDataJson.records) {
          callback();
        } else {
          self.alert(self.settings.element.input.apiToken,
            self.settings.i18n.alertMessage.apiTokenInvalid);

        }

      }, () => {
        self.alert(self.settings.i18n.alertMessage.apiTokenInvalid);
      });
    },
    validateFormValue: function() {

      this.checkAutonumFormat();
      this.propRadioTiming();
      const config = {};
      const autoNumberingFieldcode = document.querySelector(this.settings.element.input.fieldCode).value;
      const format = this.formatType(document.querySelector(this.settings.element.input.textFormatSelect).value);
      const preview = document.querySelector(this.settings.element.input.preview).textContent;
      const prefix = document.querySelector(this.settings.element.input.prefix).value;
      const dateformat = document.querySelector(this.settings.element.input.dateFormatSelect).value;

      const timing = document.querySelector(this.settings.element.input.timing + ':checked')?.value || 'none';

      const connective = document.querySelector(this.settings.element.input.connectiveSelect).value;
      let numOfDigit = document.querySelector(this.settings.element.input.numberOfDigit).value;
      let validateResult = true;
      document.querySelectorAll('.kintoneplugin-alert').forEach((el) => {
        el.remove();
      });

      if (autoNumberingFieldcode === 'null') {
        this.alert(this.settings.element.input.fieldCode,
          this.settings.i18n.alertMessage.notSelectedNumberingField);
        validateResult = false;
      }
      if (!this.isNumberPositive(numOfDigit)) {
        this.alert(this.settings.element.input.numberOfDigit,
          this.settings.i18n.alertMessage.invalidNumberingOfDigits);
        validateResult = false;
      } else {
        numOfDigit = parseInt(numOfDigit, 10);
        document.querySelector(this.settings.element.input.numberOfDigit).value = numOfDigit;
      }
      // 採番書籍選択未選択チェック
      if (format[0] === 'null') {
        this.alert(this.settings.element.input.textFormatSelect,
          this.settings.i18n.alertMessage.notSelectedFormat);
        validateResult = false;
      }
      // 「書式」と「日付形式」未選択チェック
      if ((format[0] === 'date' || format[1] === 'date') && dateformat === 'null') {
        this.alert(this.settings.element.input.dateFormatSelect,
          this.settings.i18n.alertMessage.notSelectedDateFormat);
        validateResult = false;
      }
      // 「書式」と「テキスト設定」未入力チェック
      if ((format[0] === 'text' || format[1] === 'text') && prefix === '') {
        this.alert(this.settings.element.input.prefix, this.settings.i18n.alertMessage.notInputTextFormat);
        validateResult = false;
      }
      if (prefix.match(/&|<|>|'|'/g) !== null) {
        this.alert(this.settings.element.input.prefix,
          this.settings.i18n.alertMessage.canNotUseHTMLCharactersForTextFormat);
        validateResult = false;
      }
      if (prefix.match(/-|_/g) !== null) {
        this.alert(this.settings.element.input.prefix,
          this.settings.i18n.alertMessage.canNotUseConnectionCharForTextFormat);
        validateResult = false;
      }

      if (connective === 'null') {
        this.alert(this.settings.element.input.connectiveSelect,
          this.settings.i18n.alertMessage.notSelectedConnectionChar);
        validateResult = false;
      }

      if (!validateResult) {
        return false;
      }

      // 設定文書の値を返す
      config.autoNumberingFieldcode = autoNumberingFieldcode;
      config.format = document.querySelector(this.settings.element.input.textFormatSelect).value;
      config.format1 = format[0]; // date
      config.format2 = format[1]; // number
      config.format3 = format[2]; // textの何れかが入る。
      config.dateFormat = dateformat;
      config.text = prefix;
      config.preview = preview;
      config.timing = timing;
      config.connective = connective;
      config.useProxy = document.querySelector(this.settings.element.input.apiToken).value !== '' ? '1' : '0';
      config.numOfDigit = numOfDigit.toString();
      return config;
    },
    alert: function(element, mess) {
      const elementParrent = element.parentElement;
      elementParrent.parentElement.querySelectorAll('.kintoneplugin-alert').forEach((el) => {
        el.remove();
      });
      if (document.querySelectorAll('.kintoneplugin-alert').length === 0) {
        element.focus();
      }
      elementParrent.insertAdjacentHTML('afterend', '<div class=\'kintoneplugin-alert\'><p>' + mess + '</p></div>');
    },
    formatType: function(selectformat) {

      switch (selectformat) {
        case 'numbering':
          return ['number', '', ''];

        case 'dateNumbering':
          return ['date', 'number', ''];

        case 'dateTextNumbering':
          return ['date', 'text', 'number'];

        case 'textNumbering':
          return ['text', 'number', ''];

        case 'textDateNumbering':
          return ['text', 'date', 'number'];

        default:
          return ['null', '', ''];
      }
    },
    checkAutonumFormat: function() {
      this.propRadioTiming();
      const autonumFormat = document.querySelector(this.settings.element.input.textFormatSelect).value;
      switch (autonumFormat) {

        case 'numbering':
          document.querySelector(this.settings.element.input.dateFormatSelect).value = 'null';
          document.querySelector(this.settings.element.input.prefix).value = '';
          this.propElement(this.settings.element.input.dateFormatSelect, true);
          this.propElement(this.settings.element.input.prefix, true);
          break;

        case 'dateNumbering':
          document.querySelector(this.settings.element.input.prefix).value = '';
          this.propElement(this.settings.element.input.dateFormatSelect, false);
          this.propElement(this.settings.element.input.prefix, true);
          break;

        case 'dateTextNumbering':
          this.propElement(this.settings.element.input.dateFormatSelect, false);
          this.propElement(this.settings.element.input.prefix, false);
          break;

        case 'textNumbering':
          document.querySelector(this.settings.element.input.dateFormatSelect).value = 'null';
          this.propElement(this.settings.element.input.dateFormatSelect, true);
          this.propElement(this.settings.element.input.prefix, false);
          break;

        case 'textDateNumbering':
          this.propElement(this.settings.element.input.dateFormatSelect, false);
          this.propElement(this.settings.element.input.prefix, false);
          break;

        default:
          document.querySelector(this.settings.element.input.dateFormatSelect).value = 'null';
          document.querySelector(this.settings.element.input.prefix).value = '';
          this.propElement(this.settings.element.input.dateFormatSelect, true);
          this.propElement(this.settings.element.input.prefix, true);
      }
    },
    propRadioTiming: function() {
      const dateformat = document.querySelector(this.settings.element.input.dateFormatSelect).value;
      const timing = document.querySelector(this.settings.element.input.timing + ':checked')?.value || 'none';
      switch (dateformat) {
        case 'MMDDYYYY':
        case 'MMDDYY':
        case 'YYYYMMDD':
          this.propElement('#autonum-resetTiming-yearly', false);
          this.propElement('#autonum-resetTiming-monthly', false);
          this.propElement('#autonum-resetTiming-daily', false);
          break;
        case 'MMYYYY':
        case 'MMYY':
        case 'YYYYMM':
          this.propElement('#autonum-resetTiming-yearly', false);
          this.propElement('#autonum-resetTiming-monthly', false);
          this.propElement('#autonum-resetTiming-daily', true);
          if (timing === 'daily') {
            document.querySelectorAll(this.settings.element.input.timing).forEach((radio) => {
              radio.checked = (radio.value === 'none');
            });
          }
          break;

        case 'MMDD':
          this.propElement('#autonum-resetTiming-yearly', true);
          if (timing === 'yearly') {
            document.querySelectorAll(this.settings.element.input.timing).forEach((radio) => {
              radio.checked = (radio.value === 'none');
            });
          }

          this.propElement('#autonum-resetTiming-monthly', false);
          this.propElement('#autonum-resetTiming-daily', false);
          break;

        case 'YYYY':
        case 'YY':
          this.propElement('#autonum-resetTiming-yearly', false);

          this.propElement('#autonum-resetTiming-monthly', true);
          this.propElement('#autonum-resetTiming-daily', true);
          if (timing !== 'yearly') {
            document.querySelectorAll(this.settings.element.input.timing).forEach((radio) => {
              radio.checked = (radio.value === 'none');
            });
          }
          break;
        default:
          this.propElement('#autonum-resetTiming-yearly', true);
          this.propElement('#autonum-resetTiming-monthly', true);
          this.propElement('#autonum-resetTiming-daily', true);
          document.querySelectorAll(this.settings.element.input.timing).forEach((radio) => {
            radio.checked = (radio.value === 'none');
          });
          break;
      }
    },
    propElement: function(element, isDisabled) {
      document.querySelector(element).disabled = isDisabled;
    },
    uiSetFormSubmitIsFixed: function() {
      if (window.innerHeight < this.settings.CONST.CLIENT_MIN_HEIGHT_PX) {
        document.querySelector(this.settings.element.form + ' .submit-bottom').style.display = '';
        document.querySelector(this.settings.element.formSetting).style.maxHeight = 'none';
        return;
      }
      document.querySelector(this.settings.element.form + ' .submit-bottom').style.display = 'none';

      let parentHeight = document.querySelector(this.settings.element.form).closest('td').getBoundingClientRect().top + window.scrollY;
      parentHeight += this.settings.CONST.BOX_CONFIRM_HEIGHT_PX;
      document.querySelector(this.settings.element.formSetting).style.maxHeight = (window.innerHeight - parentHeight) + 'px';
    },
    escapeHtml: function(htmlstr) {
      return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
    },
    isNumberPositive: function(number) {
      const regex = /^(?:[1-9]\d*|\d)$/;
      return regex.test(number.toString());
    }
  };
  kintonePluginConfigAutonum.init();
})(kintone.$PLUGIN_ID);
