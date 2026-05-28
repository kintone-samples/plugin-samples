/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */

((PLUGIN_ID) => {
  'use strict';

  const terms = {
    'ja': {
      'checkValue_label': '値変更後入力チェック',
      'checkValue_checkbox': '値変更後に入力チェックを行う場合はチェックしてください。',
      'checkValue_zip_label': '郵便番号をチェックするフィールド',
      'checkValue_zip_field': '郵便番号のチェックを行うフィールドを選択してください。',
      'checkValue_tel_label': '電話番号をチェックするフィールド',
      'checkValue_tel_field': '電話番号のチェックを行うフィールドを選択してください。',
      'checkValue_fax_label': 'FAX番号をチェックするフィールド',
      'checkValue_fax_field': 'FAX番号のチェックを行うフィールドを選択してください。',
      'checkValue_mail_label': 'メールアドレスをチェックするフィールド',
      'checkValue_mail_field': 'メールアドレスのチェックを行うフィールドを選択してください。',
      'checkValue_save': '保存する',
      'checkValue_cancel': 'キャンセル'
    },
    'zh': {
      'checkValue_label': '校验输入值',
      'checkValue_checkbox': '如需在输入值之后进行校验请勾选。',
      'checkValue_zip_label': '检验邮政编码',
      'checkValue_zip_field': '请选择需要对邮政编码进行校验的字段。',
      'checkValue_tel_label': '校验电话号码',
      'checkValue_tel_field': '请选择需要对电话号码进行校验的字段。',
      'checkValue_fax_label': '校验传真号码',
      'checkValue_fax_field': '请选择需要对传真号码进行校验的字段。',
      'checkValue_mail_label': '校验邮箱地址',
      'checkValue_mail_field': '请选择需要对邮箱地址进行校验的字段。',
      'checkValue_save': '保存',
      'checkValue_cancel': '取消'
    }
  };
  let lang = kintone.getLoginUser().language;
  const i18n = (lang in terms) ? terms[lang] : terms.ja;
  const checkValuePlugin = document.getElementById('checkValue_plugin');
  const configHtml = checkValuePlugin.innerHTML;
  const tmpl = jsrender.templates(configHtml);
  checkValuePlugin.innerHTML = tmpl.render({'terms': i18n});

  // プラグインIDの設定
  const KEY = PLUGIN_ID;
  const CONF = kintone.plugin.app.getConfig(KEY);
  // 入力モード
  const MODE_ON = '1'; // 変更後チェック実施
  const MODE_OFF = '0'; // 変更後チェック未実施
  const escapeHtml = (htmlstr) => {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  const setDropdown = () => {
    // フィールド型が「文字列（１行）」「数値」のフィールド情報を取得し、選択ボックスに代入する
    const client = new KintoneRestAPIClient();
    const appId = kintone.app.getId();
    const getFiled = async () => {
      try {
        const { properties } = await client.app.getFormFields({ app: appId });
        // propertiesオブジェクト中のフィールドのタイプが「文字列（１行）」「数値」のフィールド情報を取得する。
        const fields = Object.keys(properties).filter((key) => {
          return (
            properties[key].type === 'SINGLE_LINE_TEXT' ||
            properties[key].type === 'NUMBER'
          );
        });
        // 取得したフィールドのフィールド名をプルダウンメニューのラベル、フィールドコードをプルダウンメニューの値に設定する。
        for (let i = 0; i < fields.length; i++) {
          const prop = properties[fields[i]];
          const option = document.createElement('option');
          option.value = escapeHtml(prop.code);
          option.textContent = escapeHtml(prop.label);
          document.getElementById('select_checkvalue_field_zip').appendChild(option.cloneNode(true));
          document.getElementById('select_checkvalue_field_tel').appendChild(option.cloneNode(true));
          document.getElementById('select_checkvalue_field_fax').appendChild(option.cloneNode(true));
          document.getElementById('select_checkvalue_field_mail').appendChild(option.cloneNode(true));
        }
        // 初期値を設定する
        document.getElementById('select_checkvalue_field_zip').value = CONF.zip;
        document.getElementById('select_checkvalue_field_tel').value = CONF.tel;
        document.getElementById('select_checkvalue_field_fax').value = CONF.fax;
        document.getElementById('select_checkvalue_field_mail').value = CONF.mail;
      } catch (e) {
        alert(err.message);
      }
    };
    getFiled();
  };

  const createErrorMessage = (num) => {
    const message = {
      'ja': {
        '1': '必須項目が入力されていません',
        '2': '選択肢が重複しています'
      },
      'zh': {
        '1': '有必填项未填写',
        '2': '选项重复'
      }
    };
    if (!message[lang]) {
      lang = 'ja';
    }
    return message[lang][num];
  };

  const initCheckValue =  () => {

    // 既に値が設定されている場合はフィールドに値を設定する
    if (CONF) {
      // ドロップダウンリストを作成する
      setDropdown();
      document.getElementById('check-plugin-change_mode').checked = false;
      // changeイベント有り
      if (CONF.mode === MODE_ON) {
        document.getElementById('check-plugin-change_mode').checked = true;
      }
    }

    // 「保存する」ボタン押下時に入力情報を設定する
    document.getElementById('check-plugin-submit').addEventListener('click', () => {
      const config = {};
      const zip = document.getElementById('select_checkvalue_field_zip').value;
      const tel = document.getElementById('select_checkvalue_field_tel').value;
      const fax = document.getElementById('select_checkvalue_field_fax').value;
      const mail = document.getElementById('select_checkvalue_field_mail').value;
      const mode = document.getElementById('check-plugin-change_mode').checked;
      // 必須チェック
      if (zip === '' || tel === '' || fax === '' || mail === '') {
        alert(createErrorMessage(1));
        return;
      }
      config.zip = zip;
      config.tel = tel;
      config.fax = fax;
      config.mail = mail;
      // 重複チェック
      const uniqueConfig = [zip, tel, fax, mail];
      const uniqueConfig2 = uniqueConfig.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
      if (Object.keys(config).length !== uniqueConfig2.length) {
        alert(createErrorMessage(2));
        return;
      }

      config.mode = MODE_OFF;
      if (mode) {
        config.mode = MODE_ON;
      }
      kintone.plugin.app.setConfig(config);
    });

    // 「キャンセル」ボタン押下時の処理
    document.getElementById('check-plugin-cancel').addEventListener('click', () => {
      history.back();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckValue);
  } else {
    initCheckValue();
  }

})(kintone.$PLUGIN_ID);
