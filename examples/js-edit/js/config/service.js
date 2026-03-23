/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
((PLUGIN_ID) => {
  'use strict';
  const i18n = window.jsEditKintonePlugin.i18n;
  const service = {
    uploadFile: (fileName, fileValue) => {
      const blob = new Blob([fileValue], {type: 'text/javascript'});
      const formData = new FormData();
      formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
      formData.append('file', blob, fileName);
      return fetch(kintone.api.url('/k/v1/file', true), {
        method: 'POST',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: formData
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      });
    },
    getFile: (fileKey) => {
      const url = kintone.api.url('/k/v1/file', true) + '?fileKey=' + encodeURIComponent(fileKey);
      return fetch(url, {
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'}
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      }).catch(() => {
        alert(i18n.msg_failed_to_get_file);
        return kintone.Promise.reject();
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
})(kintone.$PLUGIN_ID);
