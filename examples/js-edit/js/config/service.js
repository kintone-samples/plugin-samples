/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(($, PLUGIN_ID) => {
  'use strict';
  const i18n = window.jsEditKintonePlugin.i18n;
  const service = {
    uploadFile: (fileName, fileValue) => {
      return new kintone.Promise((resolve, reject) => {
        const blob = new Blob([fileValue], {type: 'text/javascript'});
        const formData = new FormData();
        formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
        formData.append('file', blob, fileName);
        $.ajax(kintone.api.url('/k/v1/file', true), {
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false
        }).done((data) => {
          resolve(data);
        }).fail((err) => {
          reject(err);
        });
      });
    },
    getFile: (fileKey) => {
      return new kintone.Promise((resolve, reject) => {
        $.ajax(kintone.api.url('/k/v1/file', true), {
          type: 'GET',
          dataType: 'text',
          data: {'fileKey': fileKey}
        }).done((data, status, xhr) => {
          resolve(data);
        }).fail((xhr, status, error) => {
          alert(i18n.msg_failed_to_get_file);
          reject();
        });
      });
    },
    getCustomization: () => {
      const params = {app: kintone.app.getId()};
      return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'GET', params);
    },
    updateCustomization: (data) => {
      data.app = kintone.app.getId();
      return kintone.api(kintone.api.url('/k/v1/preview/app/customize', true), 'PUT', data);
    },
    deployApp: () => {
      const params = {apps: [{app: kintone.app.getId()}]};
      return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', params);
    },
    deployStatus: () => {
      const params = {apps: [kintone.app.getId()]};
      return kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'GET', params);
    }
  };

  window.jsEditKintonePlugin.service = service;
})(jQuery, kintone.$PLUGIN_ID);
