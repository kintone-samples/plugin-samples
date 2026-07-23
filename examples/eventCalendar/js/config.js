/*
 * eventCalendar Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
((PLUGIN_ID) => {
    'use strict';

    // プラグインIDの設定
    const conf = kintone.plugin.app.getConfig(PLUGIN_ID);

    const init = () => {
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
        const i18n = (lang in terms) ? terms[lang] : terms['ja'];
        const container = document.getElementById('EventCalendarPlugin');
        // jsrender をスタンドアロン（jQuery非依存）で使用
        const tmpl = jsrender.templates(container.innerHTML);
        container.innerHTML = tmpl.render({'terms': i18n});

        // 既に値が設定されている場合はフィールドに値を設定する
        if (typeof conf['name'] !== 'undefined') {
            for (let i = 1; i < 6; i++) {
                document.getElementById('status' + i).value = conf['status' + i] || '';
                document.getElementById('color' + i).value = conf['color' + i] || '';
            }
        }

        const nameSelect = document.getElementById('name_code');
        const startSelect = document.getElementById('start_datetime_code');
        const endSelect = document.getElementById('end_datetime_code');

        // option 要素を生成する
        const createOption = (label, index, selected) => {
            const opt = document.createElement('option');
            opt.setAttribute('name', index);
            opt.textContent = label;
            if (selected) {
                opt.selected = true;
            }
            return opt;
        };

        // アプリのフォーム情報を取得
        kintone.api('/k/v1/preview/app/form/fields', 'GET', {
            app: kintone.app.getId()
        }, (resp) => {
            const singleLineText = [];
            const sDatetime = [];
            const eDatetime = [];
            let count = 0;

            for (const key in resp.properties) {
                if (!Object.prototype.hasOwnProperty.call(resp.properties, key)) {continue;}
                const property = resp.properties[key];
                if (property.type === 'SINGLE_LINE_TEXT') {
                    singleLineText[count] = {
                        'label': property.label,
                        'key': property.code,
                        'index': String(count)
                    };
                    const isSelected = typeof conf['name'] !== 'undefined' && property.code === conf['name'];
                    if (isSelected) {
                        nameSelect.insertBefore(createOption(property.label, count, true), nameSelect.firstChild);
                    } else {
                        nameSelect.appendChild(createOption(property.label, count, false));
                    }
                } else if (property.type === 'DATETIME') {
                    sDatetime[count] = {
                        'label': property.label,
                        'key': property.code,
                        'index': String(count)
                    };
                    eDatetime[count] = {
                        'label': property.label,
                        'key': property.code,
                        'index': String(count)
                    };
                    if (typeof conf['name'] !== 'undefined' && property.code === conf['start_datetime']) {
                        startSelect.insertBefore(createOption(property.label, count, true), startSelect.firstChild);
                        endSelect.appendChild(createOption(property.label, count, false));
                    } else if (typeof conf['name'] !== 'undefined' && property.code === conf['end_datetime']) {
                        startSelect.appendChild(createOption(property.label, count, false));
                        endSelect.insertBefore(createOption(property.label, count, true), endSelect.firstChild);
                    } else {
                        startSelect.appendChild(createOption(property.label, count, false));
                        endSelect.appendChild(createOption(property.label, count, false));
                    }
                }
                count++;
            }

            // 「保存する」ボタン押下時に入力情報を設定する
            document.getElementById('submit').addEventListener('click', () => {
                const config = {};
                let name;
                let startDatetime;
                let endDatetime;

                const nameSelected = nameSelect.selectedOptions[0];
                singleLineText.filter((item) => {
                    if (nameSelected && item.label === nameSelected.textContent &&
                        item.index === nameSelected.getAttribute('name')) {
                        name = item.key;
                        return true;
                    }
                    return false;
                });
                const startSelected = startSelect.selectedOptions[0];
                sDatetime.filter((item) => {
                    if (startSelected && item.label === startSelected.textContent &&
                        item.index === startSelected.getAttribute('name')) {
                        startDatetime = item.key;
                        return true;
                    }
                    return false;
                });
                const endSelected = endSelect.selectedOptions[0];
                eDatetime.filter((item) => {
                    if (endSelected && item.label === endSelected.textContent &&
                        item.index === endSelected.getAttribute('name')) {
                        endDatetime = item.key;
                        return true;
                    }
                    return false;
                });

                if (name === '' || startDatetime === '' || endDatetime === '') {
                    alert('入力されていない必須項目があります。');
                    return;
                }
                config['name'] = name;
                config['start_datetime'] = startDatetime;
                config['end_datetime'] = endDatetime;
                for (let i = 1; i < 6; i++) {
                    config['status' + i] = document.getElementById('status' + i).value;
                    config['color' + i] = document.getElementById('color' + i).value;
                }

                // カスタマイズビューを追加
                const VIEW_NAME = 'スケジュール';
                kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'GET', {
                    'app': kintone.app.getId()
                }).then((scheResp) => {
                    const req = structuredClone(scheResp);
                    req.app = kintone.app.getId();

                    // 作成したビューが存在するか
                    let existFlg = false;
                    for (const k in req.views) {
                        if (req.views[k].id === conf['viewId']) {
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
                            config['viewId'] = putResp.views[VIEW_NAME].id;
                            kintone.plugin.app.setConfig(config);
                        });

                    } else {
                        config['viewId'] = conf['viewId'];
                        kintone.plugin.app.setConfig(config);
                    }

                });
            });

            // 「キャンセル」ボタン押下時の処理
            document.getElementById('cancel').addEventListener('click', () => {
                history.back();
            });

        });
    };

    // jQuery の $(document).ready 相当（読み込み済みなら即実行）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(kintone.$PLUGIN_ID);
