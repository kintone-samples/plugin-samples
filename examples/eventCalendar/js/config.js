/*
 * eventCalendar Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  // プラグインIDの設定
  const conf = kintone.plugin.app.getConfig(PLUGIN_ID);

  $(document).ready(() => {
    const terms = {
      'ja': {
        'event_title': 'イベント名フィールド',
        'event_title_description': 'イベント名として使用する文字列フィールドのフィールド名を選択して下さい。',
        'start_dateTime': '開始日時フィールド',
        'start_dateTime_description': 'イベント開始日時として使用する日時フィールドのフィールド名を選択して下さい。',
        'end_dateTime': '終了日時フィールド',
        'terms.end_dateTime_description': 'イベント終了日時として使用する日時フィールドのフィールド名を選択して下さい。',
        'background': 'ステータス（任意）',
        'background_description': 'プロセス管理のステータスと対応する背景色を指定可能です。\n'
                + '<br> ※背景色は英語、16進数、RGBのいずれも可。　赤：red, #ff0000, rgb(255,0,0)　緑：green, #008000, rgb(0,128,0)',
        'background_status': 'ステータス',
        'background_color': '背景色',
        'save_button': '保存する',
        'cancel_button': 'キャンセル'
      },
      'zh': {
        'event_title': '活动标题',
        'event_title_description': '请选择要作为活动标题的字段。',
        'start_dateTime': '开始时间',
        'start_dateTime_description': '请选择要作为活动开始时间的字段。',
        'end_dateTime': '结束时间',
        'terms.end_dateTime_description': '请选择要作为活动结束时间的字段。',
        'background': '状态（任意）',
        'background_description': '可对流程管理的各状态设置背景色。\n'
                + '※背景色可用英语、16进制、RGB的任意一种方式来指定。红：red, #ff0000, rgb(255,0,0)　绿：green, #008000, rgb(0,128,0)',
        'background_status': '状态',
        'background_color': '背景色',
        'save_button': '保存',
        'cancel_button': '取消'
      }
    };

    // ログインユーザーの設定言語によって表示言語を切り替える
    const lang = kintone.getLoginUser().language;
    const i18n = (lang in terms) ? terms[lang] : terms.ja;
    const configHtml = $('#EventCalendarPlugin').html();
    const tmpl = $.templates(configHtml);
    $('div#EventCalendarPlugin').html(tmpl.render({'terms': i18n}));

    // 既に値が設定されている場合はフィールドに値を設定する
    if (typeof (conf.name) !== 'undefined') {
      $('#status1').val(conf.status1);
      $('#color1').val(conf.color1);
      $('#status2').val(conf.status2);
      $('#color2').val(conf.color2);
      $('#status3').val(conf.status3);
      $('#color3').val(conf.color3);
      $('#status4').val(conf.status4);
      $('#color4').val(conf.color4);
      $('#status5').val(conf.status5);
      $('#color5').val(conf.color5);
    }
    // アプリのフォーム情報を取得
    kintone.api('/k/v1/preview/app/form/fields', 'GET', {
      app: kintone.app.getId()
    }, (resp) => {
      const singleLineText = [];
      const sDatetime = [];
      const eDatetime = [];
      let count = 0;

      for (const key in resp.properties) {
        if (!Object.prototype.hasOwnProperty.call(resp.properties, key)) {
          continue;
        }
        let confFlg = false;
        if (resp.properties[key].type === 'SINGLE_LINE_TEXT') {
          singleLineText[count] = {
            'label': resp.properties[key].label,
            'key': resp.properties[key].code,
            'index': String(count)
          };
          if (typeof (conf.name) !== 'undefined' && resp.properties[key].code === conf.name) {
            confFlg = true;
          }
          if (confFlg) {
            $('#name_code').prepend('<option name=' + count + ' selected>' + singleLineText[count].label + '</option>');
          } else {
            $('#name_code').append('<option name=' + count + '>' + singleLineText[count].label + '</option>');
          }
        } else if (resp.properties[key].type === 'DATETIME') {
          sDatetime[count] = {
            'label': resp.properties[key].label,
            'key': resp.properties[key].code,
            'index': String(count)
          };
          eDatetime[count] = {
            'label': resp.properties[key].label,
            'key': resp.properties[key].code,
            'index': String(count)
          };
          if (typeof (conf.name) !== 'undefined' && resp.properties[key].code === conf.start_datetime) {
            $('#start_datetime_code').prepend('<option name=' + count + ' selected>' +
                            sDatetime[count].label + '</option>');
            $('#end_datetime_code').append('<option name=' + count + '>' + eDatetime[count].label + '</option>');
          } else if (typeof (conf.name) !== 'undefined' && resp.properties[key].code === conf.end_datetime) {
            $('#start_datetime_code').append('<option name=' + count + '>' + sDatetime[count].label + '</option>');
            $('#end_datetime_code').prepend('<option name=' + count + ' selected>' +
                            eDatetime[count].label + '</option>');
          } else {
            $('#start_datetime_code').append('<option name=' + count + '>' + sDatetime[count].label + '</option>');
            $('#end_datetime_code').append('<option name=' + count + '>' + eDatetime[count].label + '</option>');
          }

        }
        count++;
      }


      // 「保存する」ボタン押下時に入力情報を設定する
      $('#submit').click(() => {
        const config = {};
        let name;
        let start_datetime;
        let end_datetime;
        singleLineText.filter((item) => {
          if (item.label === $('#name_code :selected').text() &&
                        item.index === $('#name_code :selected').attr('name')) {
            name = item.key;
            return true;
          }
        });
        sDatetime.filter((item) => {
          if (item.label === $('#start_datetime_code :selected').text() &&
                        item.index === $('#start_datetime_code :selected').attr('name')) {
            start_datetime = item.key;
            return true;
          }
        });
        eDatetime.filter((item) => {
          if (item.label === $('#end_datetime_code :selected').text() &&
                        item.index === $('#end_datetime_code :selected').attr('name')) {
            end_datetime = item.key;
            return true;
          }
        });
        const status1 = $('#status1').val();
        const color1 = $('#color1').val();
        const status2 = $('#status2').val();
        const color2 = $('#color2').val();
        const status3 = $('#status3').val();
        const color3 = $('#color3').val();
        const status4 = $('#status4').val();
        const color4 = $('#color4').val();
        const status5 = $('#status5').val();
        const color5 = $('#color5').val();

        if (name === '' || start_datetime === '' || end_datetime === '') {
          alert('入力されていない必須項目があります。');
          return;
        }
        config.name = name;
        config.start_datetime = start_datetime;
        config.end_datetime = end_datetime;
        config.status1 = status1;
        config.color1 = color1;
        config.status2 = status2;
        config.color2 = color2;
        config.status3 = status3;
        config.color3 = color3;
        config.status4 = status4;
        config.color4 = color4;
        config.status5 = status5;
        config.color5 = color5;

        // カスタマイズビューを追加
        const VIEW_NAME = 'スケジュール';
        kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'GET', {
          'app': kintone.app.getId()
        }).then((scheResp) => {
          const req = $.extend(true, {}, scheResp);
          req.app = kintone.app.getId();

          // 作成したビューが存在するか
          let existFlg = false;
          for (const k in req.views) {
            if (req.views[k].id === conf.viewId) {
              existFlg = true;
              break;
            }
          }

          // カスタマイズビューが存在しなければ追加
          if (!existFlg) {

            // 一番上のビュー（デフォルトビュー）に「スケジュール」ビューを作成
            for (const prop in req.views) {
              if (Object.prototype.hasOwnProperty.call(req.views, prop)) {
                req.views[prop].index = Number(req.views[prop].index) + 1;
              }
            }

            req.views[VIEW_NAME] = {
              'type': 'CUSTOM',
              'name': VIEW_NAME,
              'html': '<div id="calendar"></div>',
              'filterCond': '',
              'pager': true,
              'index': 0
            };

            kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'PUT', req).then((putResp) => {
              // 作成したビューIDを保存する
              const viewId = putResp.views[VIEW_NAME].id;
              config.viewId = viewId;
              kintone.plugin.app.setConfig(config);
            });

          } else {
            config.viewId = conf.viewId;
            kintone.plugin.app.setConfig(config);
          }

        });
      });

      // 「キャンセル」ボタン押下時の処理
      $('#cancel').click(() => {
        history.back();
      });

    });
  });

})(jQuery, kintone.$PLUGIN_ID);
