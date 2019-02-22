/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

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
    // フォーム設計情報を取得し、選択ボックスに代入する
    kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()}, function(resp) {

      for (var i = 0; i < resp.properties.length; i++) {
        var prop = resp.properties[i];
        var $option = $('<option>');

        switch (prop.type) {
          // 文字列と数値が対象(変更前イベントの対象、テキスト入力可能)
          case 'SINGLE_LINE_TEXT':
          case 'NUMBER':

            $option.attr('value', escapeHtml(prop.code));
            $option.text(escapeHtml(prop.label));
            $('#select_checkvalue_field_zip').append($option.clone());
            $('#select_checkvalue_field_tel').append($option.clone());
            $('#select_checkvalue_field_fax').append($option.clone());
            $('#select_checkvalue_field_mail').append($option.clone());
            break;

          default:
            break;
        }
      }
      // 初期値を設定する
      $('#select_checkvalue_field_zip').val(CONF.zip);
      $('#select_checkvalue_field_tel').val(CONF.tel);
      $('#select_checkvalue_field_fax').val(CONF.fax);
      $('#select_checkvalue_field_mail').val(CONF.mail);
    });
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
        alert('必須項目が入力されていません');
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
        alert('選択肢が重複しています');
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
