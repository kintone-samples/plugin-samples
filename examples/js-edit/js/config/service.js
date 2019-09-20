/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    var i18n = window.jsEditKintonePlugin.i18n;
    var service = {
        uploadFile: function(fileName, fileValue) {
            return new kintone.Promise(function(resolve, reject) {
                var blob = new Blob([fileValue], { type: 'text/javascript' });
                var formData = new FormData();
                formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
                formData.append('file', blob, fileName);
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(function(data) {
                    resolve(data);
                }).fail(function(err) {
                    reject(err);
                });
            });
        },
        getFile: function(fileKey) {
            return new kintone.Promise(function(resolve, reject) {
                $.ajax(kintone.api.url('/k/v1/file', true), {
                    type: 'GET',
                    dataType: 'text',
                    data: { 'fileKey': fileKey }
                }).done(function(data, status, xhr) {
                    resolve(data);
                }).fail(function(xhr, status, error) {
                    alert(i18n.msg_failed_to_get_file);
                    reject();
                });
            });
        },
        getCustomization: function() {
            var params = { app: kintone.app.getId() };
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', params);
        },
        updateCustomization: function(data) {
            data.app = kintone.app.getId();
            return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'PUT', data);
        },
        deployApp: function() {
            var params = { apps: [{ app: kintone.app.getId() }] };
            return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', params);
        },
        deployStatus: function() {
            var params = { apps: [kintone.app.getId()] };
            return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'GET', params);
        }
    };

    window.jsEditKintonePlugin.service = service;
})(jQuery, kintone.$PLUGIN_ID);
