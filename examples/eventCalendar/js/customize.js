jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // カレンダー上でイベントの時間を変更した時の更新処理
    function putRecord(event) {
        var putConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
        var stdtKey = putConfig.start_datetime;
        var eddtKey = putConfig.end_datetime;

        kintone.api('/k/v1/record', 'PUT', {
            "app": kintone.app.getId(),
            "id": event.rec,
            "record": (function() {
                var param = {};
                param[stdtKey] = {
                    "value": moment(event.start).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
                };
                param[eddtKey] = {
                    "value": moment(event.end).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
                };
                return param;
            })()
        });
    }

	// 全件取得関数
    function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
        var offset = opt_offset || 0;
        var limit = opt_limit || 500;
        var allRecords = opt_records || [];
        var params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
        return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
            allRecords = allRecords.concat(resp.records);
            if (resp.records.length === limit) {
                return fetchRecords(appId, query, offset + limit, limit, allRecords);
            }
            return allRecords;
        });
    }

    // レコード一覧画面表示イベント
    kintone.events.on('app.record.index.show', function(event) {
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return false;
        }

        new kintone.Promise(function(resolve, reject) {

            var evTitle = config.name;
            var evStart = config.start_datetime;
            var evEnd = config.end_datetime;

            var startDate;
            var endDate;

            fetchRecords(kintone.app.getId(), '').then(function(calRecords) {

                var records = calRecords;
                var recEvents = [];
                // アプリにレコードがある場合のみループ
                if (records.length !== 0) {
                    for (var i = 0; i < records.length; i++) {
                        startDate = moment(records[i][evStart].value);
                        endDate = moment(records[i][evEnd].value);

                        // イベント背景色設定でミスがある場合とプロセス管理無効の場合はデフォルト青色とする
                        var eventColor = "#0000ff";
                        // イベント背景色設定処理
                        if (typeof (records[i].ステータス) !== 'undefined') {
                            var eventStatus = records[i].ステータス.value;

                            for (var k = 1; k < 6; k++) {
                                var stsPropName = "status" + k;
                                var clrPropName = "color" + k;
                                var status = config[stsPropName];
                                if (status === eventStatus) {
                                    eventColor = config[clrPropName];
                                    break;
                                }
                            }
                        }
                        recEvents.push({
                            title: records[i][evTitle].value,
                            start: startDate.format("YYYY-MM-DD HH:mm:ss"),
                            end: endDate.format("YYYY-MM-DD HH:mm:ss"),
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
                        month: 'YYYY年M月',
                        week: "YYYY年 M月 D日",
                        day: 'YYYY年 M月 D日[(]ddd[)]'
                    },
                    // ボタン文字列の表記
                    buttonText: {
                        prev: '＜',
                        next: '＞',
                        today: '今日',
                        month: '月',
                        week: '週',
                        day: '日'
                    },
                    // 日曜開始のカレンダーとする
                    firstDay: '0',
                    // 週末（土日）を表示
                    weekends: true,
                    // デフォルトは月カレンダー
                    defaultView: 'month',
                    // 月の表記
                    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                   // 曜日の表記
                    dayNames: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
                    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
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
                    eventLimitText: 'すべて見る',
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
        }).then(function() {
            return event;
        });
    });

    // レコード作成・編集画面・一覧編集イベント
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit',
        'app.record.index.edit.submit'], function(event) {
        var record = event.record;

        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return false;
        }

        var evTitleVal = record[config.name].value;
        var evStartVal = record[config.start_datetime].value;
        var evEndVal = record[config.end_datetime].value;

        // イベントタイトル・イベント開始/終了日時は未入力不可
        if (!evTitleVal || !evStartVal || !evEndVal) {
            event.error = "未入力項目があります";
            if (!evTitleVal) {
                record[config.name].error = "必須です";
            }
            if (!evStartVal) {
                record[config.start_datetime].error = "必須です";
            }
            if (!evEndVal) {
                record[config.end_datetime].error = "必須です";
            }
        // 開始日時が終了日時より未来の場合はエラー
        } else if (moment(evStartVal).format("X") > moment(evEndVal).format("X")) {
            event.error = "開始日時が終了日時より未来になっています";
            record[config.start_datetime].error = "終了日時より過去にして下さい";
            record[config.end_datetime].error = "開始日時より未来にして下さい";
        // 開始日時と終了日時が同時刻の場合はエラー（FullCalendarの仕様上の問題）
        } else if (moment(evStartVal).format("X") === moment(evEndVal).format("X")) {
            event.error = "開始日時と終了日時は1分以上あけて下さい";
            record[config.start_datetime].error = "終了日時より過去にして下さい";
            record[config.end_datetime].error = "開始日時より未来にして下さい";
        }

        return event;

    });

})(jQuery, kintone.$PLUGIN_ID);
