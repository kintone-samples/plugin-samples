/*
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    $(document).ready(function() {
        var kFields = [];
        var viewNum = 0;
        // set plug-in ID.
        var KEY = PLUGIN_ID;
        var appId = kintone.app.getId();
        var config = kintone.plugin.app.getConfig(KEY);
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {app: appId}).then(function(resp) {
            for (var i = 0; i < resp.properties.length; i++) {
                //set field for title.
                if (resp.properties[i]['type'] === 'SINGLE_LINE_TEXT') {
                    var $op = $("<option>", {
                        value: resp.properties[i]['code']
                    }).append(
                        '<span>' + resp.properties[i]['label'] + '(' + resp.properties[i]['code'] + ')</span>'
                    );
                    $('#title-field').append($op);
                }else if (resp.properties[i]['type'] === 'DATE') {
                    var $op = $("<option>", {
                        value: resp.properties[i]['code']
                    }).append(
                        '<span>' + resp.properties[i]['label'] + '(' + resp.properties[i]['code'] + ')</span>'
                    );
                    $('#kaisai-date').append($op);
                }
            }
        }).then(function() {
            //if exist setting.
            if (config) {
                $('#view-id').val(config['viewId']);
                $('#set-day').val(config['theDate']);
                $('#title-field').val(config['titleField']);
                $('#kaisai-date').val(config['kaisaiDate']);
                $('#highlight-st').val(config['highlightSt']);
                $('#highlight-co').val(config['highlightCo']);
                viewNum = Object.keys(config).length - 6;
                if (viewNum > 0) {
                    $('.default-noset').remove();
                    var $createTable = $('<table>', {
                        border: 1,
                        id: 'viewTable'
                    });
                    for (var i = 0; i < viewNum; i++) {
                        var tableParts = $('<th>');
                        $createTable.append(tableParts.text(config['viewName' + (i + 1)]));
                        kFields.push(config['viewName' + (i + 1)]);
                    }
                    $createTable.appendTo($('.viewSettingTable'));
                }
            }
            //if push the button for setting of view details.
            $('#getViewSetting').click(function() {
                var $table = $('<table>', {
                    border: 1,
                    id: 'viewTable'
                });
                if (kFields.length > 0) {
                    kFields = [];
                }
                if ($('#viewTable')) {
                    $('#viewTable').remove();
                }
                var viewName = $('#view-id').val();
                kintone.api(kintone.api.url('/k/v1/app/views', true), 'GET', {app: appId}).then(function(viewResp) {
                    if (viewResp['views'][viewName]) {
                        for (var i = 0; i < viewResp['views'][viewName]['fields'].length; i++) {
                            var tableParts = $('<th>');
                            kFields.push(viewResp['views'][viewName]['fields'][i]);
                            $table.append(tableParts.text(viewResp['views'][viewName]['fields'][i]));
                        }
                        $('.default-noset').remove();
                    }
                    $table.appendTo($('.viewSettingTable'));
                }, function(err) {
                    alert("一覧の取得に失敗しました。\n" + err.message);
                });
            });
            //if push the button for submit.
            $('#submit').click(function() {
                var config = [];
                var viewId = $('#view-id').val();
                var theDate = $('#set-day').val();
                var titleField = $('#title-field').val();
                var kaisaiDate = $('#kaisai-date').val();
                var highlightSt = $('#highlight-st').val();
                var highlightCo = $('#highlight-co').val();
                if (viewId === '' || theDate === '' || titleField === '' || kaisaiDate === '') {
                    alert('必須項目が入力されていません');
                    return;
                }
                config['viewId'] = viewId;
                config['theDate'] = theDate;
                config['titleField'] = titleField;
                config['kaisaiDate'] = kaisaiDate;
                config['highlightSt'] = highlightSt;
                config['highlightCo'] = highlightCo;
                viewNum = Object.keys(config).length - 6;
                if (kFields.length > 0) {
                    for (var i = 0; i < kFields.length; i++) {
                        config['viewName' + (i + 1)] = kFields[i];
                    }
                }
                kintone.plugin.app.setConfig(config);
            });
            $('#cancel').click(function() {
                history.back();
            });
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
