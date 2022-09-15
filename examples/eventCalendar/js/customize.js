/*
 * eventCalendar Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  // 文言多言語化
  function createMultilingual(num) {
    let user_lang = kintone.getLoginUser().language;
    const multilingual = {
      'ja': {
        '1': 'YYYY年M月',
        '2': 'YYYY年 M月 D日',
        '3': 'YYYY年 M月 D日[(]ddd[)]',
        '4': '今日',
        '5': '月',
        '6': '週',
        '7': '日',
        '8': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        '9': ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
        '10': ['日', '月', '火', '水', '木', '金', '土'],
        '11': 'すべて見る',
        '12': '未入力項目があります',
        '13': '必須です',
        '14': '開始日時が終了日時より未来になっています',
        '15': '終了日時より過去にして下さい',
        '16': '開始日時より未来にして下さい',
        '17': '開始日時と終了日時は1分以上あけて下さ'
      },
      'zh': {
        '1': 'YYYY年M月',
        '2': 'YYYY年 M月 D日',
        '3': 'YYYY年 M月 D日[(]ddd[)]',
        '4': '今天',
        '5': '月',
        '6': '周',
        '7': '日',
        '8': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        '9': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        '10': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        '11': '显示全部',
        '12': '有必填项未填',
        '13': '必填',
        '14': '开始时间比结束时间晚',
        '15': '请选择比结束时间早的时间',
        '16': '请选择比开始时间晚的时间',
        '17': '开始时间和结束时间必须间隔至少1分钟'
      }
    };
    if (!multilingual[user_lang]) {
      user_lang = 'ja';
    }
    return multilingual[user_lang][num];
  }

  // カレンダー上でイベントの時間を変更した時の更新処理
  function putRecord(event) {
    const putConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
    const stdtKey = putConfig.start_datetime;
    const eddtKey = putConfig.end_datetime;

    kintone.api('/k/v1/record', 'PUT', {
      'app': kintone.app.getId(),
      'id': event.rec,
      'record': (function() {
        const param = {};
        param[stdtKey] = {
          'value': moment(event.start).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
        };
        param[eddtKey] = {
          'value': moment(event.end).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
        };
        return param;
      })()
    });
  }

  // 全件取得関数
  function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
    const offset = opt_offset || 0;
    const limit = opt_limit || 500;
    let allRecords = opt_records || [];
    const params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
    return kintone.api('/k/v1/records', 'GET', params).then((resp) => {
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return fetchRecords(appId, query, offset + limit, limit, allRecords);
      }
      return allRecords;
    });
  }

  // レコード一覧画面表示イベント
  kintone.events.on('app.record.index.show', (event) => {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!config) {
      return false;
    }

    new kintone.Promise((resolve, reject) => {

      const evTitle = config.name;
      const evStart = config.start_datetime;
      const evEnd = config.end_datetime;
      const query = kintone.app.getQueryCondition();

      let startDate;
      let endDate;

      fetchRecords(kintone.app.getId(), query).then((calRecords) => {

        const records = calRecords;
        const recEvents = [];
        // アプリにレコードがある場合のみループ
        if (records.length !== 0) {
          for (let i = 0; i < records.length; i++) {
            startDate = moment(records[i][evStart].value);
            endDate = moment(records[i][evEnd].value);

            // イベント背景色設定でミスがある場合とプロセス管理無効の場合はデフォルト青色とする
            let eventColor = '#0000ff';
            // イベント背景色設定処理
            let eventStatus;
            let flag = false;
            if (typeof (records[i].ステータス) !== 'undefined') {
              eventStatus = records[i].ステータス.value;
            } else if (typeof (records[i].状态) !== 'undefined') {
              eventStatus = records[i].状态.value;
            } else if (typeof (records[i].Status) !== 'undefined') {
              eventStatus = records[i].Status.value;
            } else {
              flag = true;
            }

            if (flag === false) {
              for (let k = 1; k < 6; k++) {
                const stsPropName = 'status' + k;
                const clrPropName = 'color' + k;
                const status = config[stsPropName];
                if (status === eventStatus) {
                  eventColor = config[clrPropName];
                  break;
                }
              }
            }

            recEvents.push({
              title: records[i][evTitle].value,
              start: startDate.format('YYYY-MM-DD HH:mm:ss'),
              end: endDate.format('YYYY-MM-DD HH:mm:ss'),
              url: location.protocol + '//' + location.hostname + '/k/' +
                                kintone.app.getId() + '/show#record=' + records[i].$id.value,
              rec: records[i].$id.value,
              backgroundColor: eventColor,
              borderColor: eventColor
            });
          }
        }

        // カレンダーの設定
        $('#calendar').fullCalendar({
          lang: 'ja',
          theme: false,
          // 上部のボタンやタイトル
          header: {
            left: 'prev,next, today',
            center: 'title',
            right: ' month,agendaWeek,agendaDay'
          },
          // 各カレンダーの1日毎の表記方法
          columnFormat: {
            month: 'ddd',
            week: 'M/D[(]ddd[)]',
            day: 'M/D[(]ddd[)]'
          },
          // 各カレンダーのタイトル
          titleFormat: {
            month: createMultilingual('1'),
            week: createMultilingual('2'),
            day: createMultilingual('3')
          },
          // ボタン文字列の表記
          buttonText: {
            prev: '＜',
            next: '＞',
            today: createMultilingual('4'),
            month: createMultilingual('5'),
            week: createMultilingual('6'),
            day: createMultilingual('7')
          },
          // 日曜開始のカレンダーとする
          firstDay: '0',
          // 週末（土日）を表示
          weekends: true,
          // デフォルトは月カレンダー
          defaultView: 'month',
          // 月の表記
          monthNames: createMultilingual('8'),
          monthNamesShort: createMultilingual('8'),
          // 曜日の表記
          dayNames: createMultilingual('9'),
          dayNamesShort: createMultilingual('10'),
          // 各カレンダーの各時間の表記
          axisFormat: 'H:mm',
          timeFormat: 'H:mm',
          // イベントをカレンダー上から編集する
          editable: true,
          durationEditable: true,
          startEditable: true,
          unselectAuto: true,
          unselectCancel: '',
          dragRevertDuration: 100,
          // 終日予定は表示しない
          allDaySlot: false,
          // 0時区切りのカレンダーとする
          nextDayThreshold: '00:00:00',
          // カレンダーの高さ
          height: 700,
          contentHeight: 600,
          // 時間軸の単位
          slotDuration: '01:00:00',
          // 何分刻みでバーを動かすか
          snapDuration: '01:00:00',
          // 日カレンダーのみ詳細に表示するための設定
          views: {
            day: {
              slotDuration: '00:30:00',
              snapDuration: '00:30:00',
              scrollTime: '06:00:00'
            }
          },
          minTime: '00:00:00',
          maxTime: '24:00:00',
          // 初期時間位置
          scrollTime: '00:00:00',
          // 月カレンダーでイベントが多い場合に表所を省略する
          eventLimit: true,
          eventLimitText: createMultilingual('11'),
          eventResize: function(ev, delta, revertFunc, jsEvent, ui, view) {
            putRecord(ev);
            $('#calendar').fullCalendar('unselect');
          },
          eventDrop: function(ev, delta, revertFunc, jsEvent, ui, view) {
            putRecord(ev);
            $('#calendar').fullCalendar('unselect');
          },
          eventSources: [{
            events: recEvents
          }]
        });
        resolve(event);
      });
    }).then(() => {
      return event;
    });
  });


  // レコード作成・編集画面・一覧編集イベント
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit',
    'app.record.index.edit.submit'], (event) => {
    const record = event.record;

    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!config) {
      return false;
    }

    const evTitleVal = record[config.name].value;
    const evStartVal = record[config.start_datetime].value;
    const evEndVal = record[config.end_datetime].value;

    // イベントタイトル・イベント開始/終了日時は未入力不可
    if (!evTitleVal || !evStartVal || !evEndVal) {
      event.error = createMultilingual('12');
      if (!evTitleVal) {
        record[config.name].error = createMultilingual('13');
      }
      if (!evStartVal) {
        record[config.start_datetime].error = createMultilingual('13');
      }
      if (!evEndVal) {
        record[config.end_datetime].error = createMultilingual('13');
      }
      // 開始日時が終了日時より未来の場合はエラー
    } else if (moment(evStartVal).format('X') > moment(evEndVal).format('X')) {
      event.error = createMultilingual('14');
      record[config.start_datetime].error = createMultilingual('15');
      record[config.end_datetime].error = createMultilingual('16');
      // 開始日時と終了日時が同時刻の場合はエラー（FullCalendarの仕様上の問題）
    } else if (moment(evStartVal).format('X') === moment(evEndVal).format('X')) {
      event.error = createMultilingual('17');
      record[config.start_datetime].error = createMultilingual('15');
      record[config.end_datetime].error = createMultilingual('16');
    }

    return event;

  });

})(jQuery, kintone.$PLUGIN_ID);
