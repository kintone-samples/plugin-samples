/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  var terms = {
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
  }
  var lang = kintone.getLoginUser().language;
  var i18n = (lang in terms) ? terms[lang]: terms['ja'];
  var configHtml = $('#checkValue_plugin').html();
  var tmpl = $.templates(configHtml);
  $('#checkValue_plugin').html(tmpl.render({'terms':i18n}));

  // プラグインIDの設定
  var KEY = PLUGIN_ID;
  var CONF = kintone.plugin.app.getConfig(KEY);
  // 入力モード
  var MODE_ON = '1'; // 変更後チェック実施
  var MODE_OFF = '0'; // 変更後チェック未実施
  function escapeHtml(htmlstr) {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function setDropdown() {
    // フィールド型が「文字列（１行）」「数値」のフィールド情報を取得し、選択ボックスに代入する
    KintoneConfigHelper.getFields(['SINGLE_LINE_TEXT', 'NUMBER']).then(function(resp) {
      for (var i = 0; i < resp.length; i++) {
        var prop = resp[i];
        var $option = $('<option>');

        $option.attr('value', escapeHtml(prop.code));
        $option.text(escapeHtml(prop.label));
        $('#select_checkvalue_field_zip').append($option.clone());
        $('#select_checkvalue_field_tel').append($option.clone());
        $('#select_checkvalue_field_fax').append($option.clone());
        $('#select_checkvalue_field_mail').append($option.clone());
      }
      // 初期値を設定する
      $('#select_checkvalue_field_zip').val(CONF.zip);
      $('#select_checkvalue_field_tel').val(CONF.tel);
      $('#select_checkvalue_field_fax').val(CONF.fax);
      $('#select_checkvalue_field_mail').val(CONF.mail);
    }).catch(function(err) {
      alert(err.message);
    });
  }

  function createErrorMessage(num) {
    var message = {
      'ja': {
        '1': '必須項目が入力されていません',
        '2': '選択肢が重複しています'
      },
      'zh': {
        '1': '有必填项未填写',
        '2': '选项重复'
      }
    }
    if(!message[lang]) {
      lang = 'ja';
    }
    return message[lang][num];
  }

  $(document).ready(function() {

    // 既に値が設定されている場合はフィールドに値を設定する
    if (CONF) {
      // ドロップダウンリストを作成する
      setDropdown();
      $('#check-plugin-change_mode').prop('checked', false);
      // changeイベント有り
      if (CONF.mode === MODE_ON) {
        $('#check-plugin-change_mode').prop('checked', true);
      }
    }

    // 「保存する」ボタン押下時に入力情報を設定する
    $('#check-plugin-submit').click(function() {
      var config = [];
      var zip = $('#select_checkvalue_field_zip').val();
      var tel = $('#select_checkvalue_field_tel').val();
      var fax = $('#select_checkvalue_field_fax').val();
      var mail = $('#select_checkvalue_field_mail').val();
      var mode = $('#check-plugin-change_mode').prop('checked');
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
      var uniqueConfig = [zip, tel, fax, mail];
      var uniqueConfig2 = uniqueConfig.filter(function(value, index, self) {
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
    $('#check-plugin-cancel').click(function() {
      history.back();
    });
  });

})(jQuery, kintone.$PLUGIN_ID);
