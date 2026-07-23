/*
 * eventCalendar Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
((PLUGIN_ID) => {
    'use strict';

    // 文言多言語化
    const createMultilingual = (num) => {
        let userLang = kintone.getLoginUser().language;
        const multilingual = {
            'ja': {
                '11': 'すべて見る',
                '12': '未入力項目があります',
                '13': '必須です',
                '14': '開始日時が終了日時より未来になっています',
                '15': '終了日時より過去にして下さい',
                '16': '開始日時より未来にして下さい',
                '17': '開始日時と終了日時は1分以上あけて下さ'
            },
            'zh': {
                '11': '显示全部',
                '12': '有必填项未填',
                '13': '必填',
                '14': '开始时间比结束时间晚',
                '15': '请选择比结束时间早的时间',
                '16': '请选择比开始时间晚的时间',
                '17': '开始时间和结束时间必须间隔至少1分钟'
            }
        };
        if (!multilingual[userLang]) {
            userLang = 'ja';
        }
        return multilingual[userLang][num];
    };

    // カレンダー上でイベントの時間を変更した時の更新処理
    const putRecord = (calEvent) => {
        const putConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
        const stdtKey = putConfig.start_datetime;
        const eddtKey = putConfig.end_datetime;

        const param = {};
        // FullCalendar v6 の event.start / event.end はネイティブ Date（絶対時刻）
        // toISOString() で UTC の ISO8601 に変換してそのまま保存する
        param[stdtKey] = {value: calEvent.start.toISOString()};
        param[eddtKey] = {value: calEvent.end.toISOString()};

        kintone.api('/k/v1/record', 'PUT', {
            app: kintone.app.getId(),
            id: calEvent.extendedProps.rec,
            record: param
        });
    };

    // 全件取得関数
    const fetchRecords = (appId, query, optOffset, optLimit, optRecords) => {
        const offset = optOffset || 0;
        const limit = optLimit || 500;
        let allRecords = optRecords || [];
        const params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
        return kintone.api('/k/v1/records', 'GET', params).then((resp) => {
            allRecords = allRecords.concat(resp.records);
            if (resp.records.length === limit) {
                return fetchRecords(appId, query, offset + limit, limit, allRecords);
            }
            return allRecords;
        });
    };

    // レコード一覧画面表示イベント
    kintone.events.on('app.record.index.show', (event) => {
        const config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return event;
        }

        const evTitle = config.name;
        const evStart = config.start_datetime;
        const evEnd = config.end_datetime;
        const query = kintone.app.getQueryCondition();

        fetchRecords(kintone.app.getId(), query).then((records) => {
            const recEvents = [];
            for (const record of records) {
                // イベント背景色設定でミスがある場合とプロセス管理無効の場合はデフォルト青色とする
                let eventColor = '#0000ff';
                // イベント背景色設定処理
                let eventStatus;
                let flag = false;
                if (typeof record.ステータス !== 'undefined') {
                    eventStatus = record.ステータス.value;
                } else if (typeof record.状态 !== 'undefined') {
                    eventStatus = record.状态.value;
                } else if (typeof record.Status !== 'undefined') {
                    eventStatus = record.Status.value;
                } else {
                    flag = true;
                }

                if (flag === false) {
                    for (let k = 1; k < 6; k++) {
                        const status = config['status' + k];
                        if (status === eventStatus) {
                            eventColor = config['color' + k];
                            break;
                        }
                    }
                }

                recEvents.push({
                    title: record[evTitle].value,
                    // kintone の日時値（UTC ISO8601）を Date に変換。timeZone:'local' で端末TZ表示
                    start: new Date(record[evStart].value),
                    end: new Date(record[evEnd].value),
                    url: location.protocol + '//' + location.hostname + '/k/' +
                        kintone.app.getId() + '/show#record=' + record.$id.value,
                    backgroundColor: eventColor,
                    borderColor: eventColor,
                    // カスタムプロパティは extendedProps へ
                    extendedProps: {
                        rec: record.$id.value
                    }
                });
            }

            // カレンダーの設定
            // ログインユーザーの言語に合わせてカレンダーUIを切り替える（旧版の ja/zh 対応を踏襲）
            // kintoneの「中国語」は簡体字なので FullCalendar のロケールコードは zh-cn を使用（それ以外は ja）
            const userLang = kintone.getLoginUser().language;
            const calendarEl = document.getElementById('calendar');
            const calendar = new FullCalendar.Calendar(calendarEl, {
                locale: userLang === 'zh' ? 'zh-cn' : 'ja',
                // 上部のボタンやタイトル
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                // 各カレンダーの各時間の表記（24時間表記）
                slotLabelFormat: {hour: 'numeric', minute: '2-digit', hour12: false},
                eventTimeFormat: {hour: 'numeric', minute: '2-digit', hour12: false},
                // 日曜開始のカレンダーとする
                firstDay: 0,
                // 週末（土日）を表示
                weekends: true,
                // デフォルトは月カレンダー
                initialView: 'dayGridMonth',
                // イベントをカレンダー上から編集する
                editable: true,
                eventDurationEditable: true,
                eventStartEditable: true,
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
                    timeGridDay: {
                        slotDuration: '00:30:00',
                        snapDuration: '00:30:00',
                        scrollTime: '06:00:00'
                    }
                },
                slotMinTime: '00:00:00',
                slotMaxTime: '24:00:00',
                // 初期時間位置
                scrollTime: '00:00:00',
                // 月カレンダーでイベントが多い場合に表示を省略する
                dayMaxEvents: true,
                moreLinkText: () => createMultilingual('11'),
                eventResize: (info) => {
                    putRecord(info.event);
                    calendar.unselect();
                },
                eventDrop: (info) => {
                    putRecord(info.event);
                    calendar.unselect();
                },
                events: recEvents
            });
            calendar.render();
        });

        return event;
    });


    // レコード作成・編集画面・一覧編集イベント
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit',
        'app.record.index.edit.submit'], (event) => {
        const record = event.record;

        const config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return event;
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
        } else if (new Date(evStartVal).getTime() > new Date(evEndVal).getTime()) {
            event.error = createMultilingual('14');
            record[config.start_datetime].error = createMultilingual('15');
            record[config.end_datetime].error = createMultilingual('16');
        // 開始日時と終了日時が同時刻の場合はエラー（FullCalendarの仕様上の問題）
        } else if (new Date(evStartVal).getTime() === new Date(evEndVal).getTime()) {
            event.error = createMultilingual('17');
            record[config.start_datetime].error = createMultilingual('15');
            record[config.end_datetime].error = createMultilingual('16');
        }

        return event;

    });

})(kintone.$PLUGIN_ID);
