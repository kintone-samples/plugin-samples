/*
 * textConnect Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';
    // Load setting values such as target fields to connect, resolve fields, and delimiters.
    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);

    // 設定値読み込み
    if (!CONF) {
        return false;
    }

    if (!CONF.copyfield1) {
        return;
    }

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
    }

    function checkTexValue(tex) {
        var tex_changes = '';

        // ユーザー選択、組織選択、グループ選択でnameのみを取得する
        switch (tex['type']) {
            case 'USER_SELECT':
            case 'ORGANIZATION_SELECT':
            case 'GROUP_SELECT':
                if (tex.value.length !== 0) {
                    tex_changes = tex['value'][0]['name'];
                }
                break;

            // 日時のうち、日付だけをトリムする
            // Trim only the date of the date / time
            case 'DATETIME':
                if (tex.value !== undefined) {
                    tex_changes = (tex['value']).substr(0, 10);
                }
                break;

            // 複数の値の場合は配列の0のみを反映する
            // In case of multiple values, only 0 of the array is reflected
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                tex_changes = tex['value'][0];
                break;

            // そのほかのすべてのフィールドタイプ
            // All other field types
            default:
                tex_changes = tex['value'];
                break;
        }
        return tex_changes;
    }

    // 空のフィールドを探す
    // Calculate joinedText field given selectionArray and record
    function fieldValues(record, selectionArry) {
        var fieldarray = [];

        // For all selection fields for the current group of target fields
        for (var j = 0; j < 5; j++) {
            if (selectionArry[j] !== '') {
                var tex = record[String(selectionArry[j])];

                // If text exists then add it to the fieldarray, other wise add empty string.
                if (tex.value !== undefined) {
                    fieldarray.push(checkTexValue(tex));
                } else {
                    fieldarray.push('');
                }
            }

        }
        return fieldarray;
    }

    function createSelectionArry() {

        // 行毎にselectionの配列を作成
        // Create selection array for each row
        var selectionArry = [];
        selectionArry[0] = [];
        selectionArry[1] = [];
        selectionArry[2] = [];
        for (var i = 1; i < 16; i++) {
            selectionArry[parseInt((i - 1) / 5, 10)].push(CONF['select' + i]);
        }
        return selectionArry;
    }


    function connectField(record) {

        // 各結合項目の処理
        // Every iteration, one resolve field is calculated based on its delimiter and selection fields.
        for (var i = 1; i < 4; i++) {
            var cdcopyfield = CONF['copyfield' + i];
            var cdbetween = CONF['between' + i];
            var selectionArry = createSelectionArry();
            var rawTextArray = fieldValues(record, selectionArry[i - 1]); // array of text field values

            // Filter rawTextArray to only include non empty strings
            var filteredTextArray = rawTextArray.filter(function(text) {
                return text !== "";
            });

            // Special cases for delimiters of '&nbsp;' and '&emsp;'
            if (cdbetween === '&nbsp;') {
                cdbetween = '\u0020';
            } else if (cdbetween === '&emsp;') {
                cdbetween = '\u3000';
            }

            // Input back into resolve field in the record
            if (filteredTextArray.length > 0) {
                record[String(cdcopyfield)]['value'] = String(filteredTextArray.join(cdbetween));
            }
        }
    }

    // 値に変更があった場合のイベントと保存前イベント
    function createEvents() {

        var changeEvent = ['app.record.edit.submit',
            'app.record.create.submit',
            'app.record.index.edit.submit'];
        var edit_change = 'app.record.edit.change.';
        var create_change = 'app.record.create.change.';
        var index_change = 'app.record.index.edit.change.';

        for (var a = 1; a < 16; a++) {
            var target = CONF['select' + a];
            changeEvent.push(edit_change + escapeHtml(target));
            changeEvent.push(create_change + escapeHtml(target));
            changeEvent.push(index_change + escapeHtml(target));
        }
        return changeEvent;
    }

    // 一覧作成編集画面
    var events1 = [
        'app.record.edit.show',
        'app.record.create.show',
        'app.record.index.edit.show'
    ];

    // 結合フィールドを入力不可にする
    // Disable the resolve field (gray out)
    kintone.events.on(events1, function(event) {
        var record = event['record'];
        for (var i = 1; i < 4; i++) {
            if (CONF['copyfield' + i] !== '') {
                record[String(CONF['copyfield' + i])]['disabled'] = true;
            }
        }
        return event;
    });

    // changeイベントとsubmitイベント発火時に文字結合処理を行う
    var valevents = createEvents();
    kintone.events.on(valevents, function connect_texts(event) {
        var record = event.record;
        connectField(record);
        return event;
    });


    // 保存前イベント
    var submitEvent = ['app.record.edit.submit',
        'app.record.create.submit',
        'app.record.index.edit.submit'
    ];


    // 保存ボタンを押下したときに空フィールドが指定されているかを確認
    kintone.events.on(submitEvent, function(event) {
        var record = event.record;
        var selectionArry = createSelectionArry();
        var flag = false;

        for (var m = 0; m < 3; m++) {
            var jointext = fieldValues(record, selectionArry[m]);
            for (var i = 0; i < jointext.length; i++) {
                if (!jointext[i]) {
                    var res = confirm('結合対象のフィールドに空文字が含まれています。登録しますか？');
                    if (res === false) {
                        event.error = 'キャンセルしました';
                        return event;
                    }
                    flag = true;
                    break;
                }
            }
            if (flag) {
                break;
            }
        }
        return event;
    });


})(kintone.$PLUGIN_ID);
