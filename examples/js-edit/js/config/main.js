/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
((PLUGIN_ID) => {
  'use strict';
  const ui = window.jsEditKintonePlugin.ui;
  const service = window.jsEditKintonePlugin.service;
  const cdnLibsDetail = window.jsEditKintonePlugin.resource.cdnLibsDetail;
  const lang = window.jsEditKintonePlugin.lang;
  const i18n = window.jsEditKintonePlugin.i18n;

  const CDN_URL = i18n.cdn_url;
  const NO_FILE_KEY = '-1';
  const MAX_LENGHT_FILE_NAME = 255;
  const MAX_CUSTOMIZATION = 30;
  const DEPLOYMENT_TIMEOUT = 1000;

  const app = {
    customization: {
      desktop: {css: [], js: []},
      mobile: {css: [], js: []}
    },
    removingLibs: [],
    currentType: 'js_pc',
    currentFileKey: '',
    modeifiedFile: false
  };

  const editor = ui.createEditor();
  const newFileBtn = ui.createNewFileButton();
  const typeDropdown = ui.createTypeDropdown();
  const filesDropdown = ui.createFilesDropdown();
  const submitBtn = ui.createSubmitButton();
  const cancelBtn = ui.createCancelButton();
  const backLinkEl = ui.createBackLinkEl();
  const libsMultipleChoice = ui.createMultipleChoice();
  const deployConfigCheckbox = ui.createDeployConfigCheckbox();

  const confirmDiscard = () => {
    return (window.confirm(i18n.msg_discard));
  };

  const renderUi = () => {
    const actionContainerEl = ui.createActionContainerEl();
    actionContainerEl.appendChild(newFileBtn.render());
    actionContainerEl.appendChild(typeDropdown.render());
    actionContainerEl.appendChild(filesDropdown.render());

    const submitContainerEl = ui.createSubmitContainerEl();
    submitContainerEl.appendChild(submitBtn.render());
    submitContainerEl.appendChild(cancelBtn.render());
    submitContainerEl.appendChild(backLinkEl);

    const libsContainerEl = ui.createLibsContainerEl();

    const libsLinksContainerEl = ui.createLibsLinksContainerEl();
    libsLinksContainerEl.className = 'jsedit-container-flex ';
    libsLinksContainerEl.appendChild(libsContainerEl);
    libsLinksContainerEl.appendChild(ui.createLinksEl());

    const saveOptionsEl = ui.createSaveOptionsEl();
    saveOptionsEl.appendChild(deployConfigCheckbox.render());

    const mainContainerEl = ui.getMainContainerEl();
    mainContainerEl.appendChild(actionContainerEl);
    mainContainerEl.appendChild(editor.getContainerEl());
    mainContainerEl.appendChild(submitContainerEl);
    mainContainerEl.appendChild(libsLinksContainerEl);
    mainContainerEl.appendChild(saveOptionsEl);
  };

  const refreshLibsMultipleChoice = () => {
    const infos = getLibsInfo();
    let libs;
    switch (app.currentType) {
      case 'js_pc':
      case 'js_mb':
        libs = infos.jsLibs;
        break;
      case 'css_pc':
        libs = infos.cssLibs;
        break;
    }

    const items = libs.map((lib, index) => {
      return {
        label: lib.name + '(' + lib.version + ')',
        value: lib.key
      };
    });

    libsMultipleChoice.setItems(items);
    ui.renderLibsContainerEl(libsMultipleChoice.render());
  };

  const renderFilesDropdown = (defaultValue) => {
    const files = getCustomizationFiles();
    let items = [{label: '', value: ''}];
    let fileKey = '';

    if (files.length > 0 && files[0]) {
      items = files.map((file) => {
        return {
          label: file.name,
          value: file.fileKey
        };
      });
      fileKey = files[0].fileKey;
    }

    filesDropdown.setItems(items);
    filesDropdown.setValue(fileKey);

    const defaultValueExisted = items.some((item) => {
      return item.value === defaultValue;
    });
    if (typeof defaultValue !== 'undefined' && defaultValueExisted) {
      filesDropdown.setValue(defaultValue);
    }

    const value = filesDropdown.getValue();
    app.currentFileKey = value ? value : '';
  };

  const makeComponentDisabled = () => {
    editor.disable();
    submitBtn.disable();
    cancelBtn.disable();
    filesDropdown.disable();
  };

  const makeComponentEnabled = () => {
    editor.enable();
    submitBtn.enable();
    cancelBtn.enable();
    filesDropdown.enable();
  };

  const getLibsInfo = () => {
    const infos = {jsLibs: [], cssLibs: []};
    Object.keys(cdnLibsDetail).forEach((libKey) => {
      if (libKey === 'ultradatejs' && lang === 'en') {
        // skip this lib with users using English
        return;
      }

      const lib = cdnLibsDetail[libKey];
      const tmpLib = {
        name: lib[0],
        key: libKey,
        version: lib[1],
        url: [],
        selected: false
      };
      let filenames = lib[2];
      if (!Array.isArray(filenames)) {
        filenames = [filenames];
      }
      let jsLib, cssLib;
      for (let j = 0; j < filenames.length; j++) {
        const filename = filenames[j];
        const url = CDN_URL + lib[0] + '/' + lib[1] + '/' + filename;
        if (filename.match(/\.js$/)) {
          if (!jsLib) {
            jsLib = JSON.parse(JSON.stringify(tmpLib));
          }
          jsLib.url.push(url);
        } else if (filename.match(/\.css$/)) {
          if (!cssLib) {
            cssLib = JSON.parse(JSON.stringify(tmpLib));
          }
          cssLib.url.push(url);
        }
      }
      if (jsLib) {
        infos.jsLibs.push(jsLib);
      }
      if (cssLib) {
        infos.cssLibs.push(cssLib);
      }
    });

    return infos;
  };

  const setEditorContent = (value) => {
    const editorValue = value ? value : '';
    switch (app.currentType) {
      case 'js_pc':
      case 'js_mb':
        editor.editor.getSession().setMode('ace/mode/javascript');
        break;
      case 'css_pc':
        editor.editor.getSession().setMode('ace/mode/css');
        break;
    }

    editor.editor.setValue(editorValue);
    editor.editor.selection.moveCursorToPosition({row: 1, column: 0});
    editor.editor.selection.selectLine();
    app.modeifiedFile = false;
  };

  const getCustomizationPart = (customization) => {
    let customizationPart = [];
    switch (app.currentType) {
      case 'js_pc':
        customizationPart = customization.desktop.js;
        break;
      case 'js_mb':
        customizationPart = customization.mobile.js;
        break;
      case 'css_pc':
        customizationPart = customization.desktop.css;
        break;
    }

    return customizationPart;
  };

  const getCustomizationFiles = () => {
    const customizationInfo = getCustomizationPart(app.customization);
    return customizationInfo.filter((item) => {
      return item.type === 'FILE';
    }).map((item) => {
      return {fileKey: item.file.fileKey, name: item.file.name};
    });
  };

  const getCustomizationLinks = () => {
    const customizationInfo = getCustomizationPart(app.customization);
    return customizationInfo.filter((item) => {
      return item.type === 'URL';
    }).map((item) => {
      return item.url;
    });
  };

  const getCustomizationInfo = (customization) => {
    app.customization.desktop = JSON.parse(JSON.stringify(customization.desktop));
    app.customization.mobile = JSON.parse(JSON.stringify(customization.mobile));
  };

  const setUsedLibsMultipleChoice = () => {
    const unifyItems = (items) => {
      const existedInLibItems = (item) => {
        const libItems = libsMultipleChoice.getItems();

        return libItems.some((libItem) => {
          return libItem.value === item;
        });
      };

      const unifiedItems = [];
      items.forEach((item) => {
        if (unifiedItems.indexOf(item) === -1 && existedInLibItems(item)) {
          unifiedItems.push(item);
        }
      });
      return unifiedItems;
    };

    const libLinks = getCustomizationLinks();
    let usedLibs = libLinks.filter((link) => {
      return isValidLibVersion(link);
    }).map((link) => {
      return link.split('/')[3];
    });

    if (lang === 'en') {
      usedLibs = usedLibs.filter((lib) => {
        return lib !== 'ultradatejs';
      });
    }

    // unifyItems use to cheat for passing kintone-ui-component bug.
    const unifiedUsedLibs = unifyItems(usedLibs);

    libsMultipleChoice.setValue(unifiedUsedLibs);
  };

  const isValidLibVersion = (libUrl) => {
    const libKey = libUrl.split('/')[3];
    const libVersion = libUrl.split('/')[4];

    const infos = getLibsInfo();
    let libs;
    switch (app.currentType) {
      case 'js_pc':
      case 'js_mb':
        libs = infos.jsLibs;
        break;
      case 'css_pc':
        libs = infos.cssLibs;
        break;
    }

    return libs.some((lib) => {
      return lib.key === libKey && lib.version === libVersion;
    });
  };

  const removeNewFileInFilesDropdown = () => {
    const items = filesDropdown.getItems();
    const newFilesIndex = [];
    items.forEach((item, i) => {
      if (item.value === NO_FILE_KEY) {
        newFilesIndex.push(i);
      }
    });

    newFilesIndex.forEach((index) => {
      filesDropdown.removeItem(index);
    });
  };

  const refreshFilesDropdown = (defaultValue) => {
    return service.getCustomization().then((customization) => {
      getCustomizationInfo(customization);
      renderFilesDropdown(defaultValue);

      return kintone.Promise.resolve();
    });
  };

  const refresh = (currentFileKey) =>{
    let defaultValue;
    if (typeof currentFileKey !== 'undefined') {
      defaultValue = currentFileKey;
    }

    return refreshFilesDropdown(defaultValue).then(() => {
      setUsedLibsMultipleChoice();

      if (app.currentFileKey === null || app.currentFileKey === '') {
        app.currentFileKey = null;
        return kintone.Promise.resolve(null);
      }

      return service.getFile(app.currentFileKey);
    }).then((fileData) => {
      setEditorContent(fileData);
    });
  };

  const createNameForNewFile = (name) => {
    let fileName = name;
    switch (app.currentType) {
      case 'js_pc':
      case 'js_mb':
        if (!fileName.match(/\.js$/)) {
          fileName += '.js';
        }
        break;
      case 'css_pc':
        if (!fileName.match(/\.css$/)) {
          fileName += '.css';
        }
        break;
    }

    return fileName;
  };

  const isValidFileName = (fileName) => {
    if (fileName.length > MAX_LENGHT_FILE_NAME) {
      alert(i18n.msg_max_file_name_length_limit);
      return false;
    }

    const specialCharRegex = /[\\/:\?\*\|"<>]/;
    if (fileName.match(specialCharRegex) !== null) {
      alert(i18n.msg_file_name_includ_special_character);
      return false;
    }

    return true;
  };

  const checkValidCustomizationLimit = (customizaions) => {
    const invalidCustomization = [];
    if (customizaions.desktop.js.length > MAX_CUSTOMIZATION) {
      invalidCustomization.push('js_pc');
    }

    if (customizaions.desktop.css.length > MAX_CUSTOMIZATION) {
      invalidCustomization.push('css_pc');
    }

    if (customizaions.mobile.js.length > MAX_CUSTOMIZATION) {
      invalidCustomization.push('js_mb');
    }

    return invalidCustomization;
  };

  const addNewTempFile = (fileName) => {
    const newFileInfo = {
      type: 'FILE',
      file: {
        fileKey: NO_FILE_KEY,
        name: fileName
      }
    };

    switch (app.currentType) {
      case 'js_pc':
        app.customization.desktop.js.push(newFileInfo);
        break;
      case 'js_mb':
        app.customization.mobile.js.push(newFileInfo);
        break;
      case 'css_pc':
        app.customization.desktop.css.push(newFileInfo);
        break;
    }

    return newFileInfo;
  };

  const getDefaultSourceForNewFile = () => {
    const defaultSource = jsEditKintonePlugin.defaultSource[app.currentType];
    return defaultSource;
  };

  const createLibLinks = (libKey, libInfo) => {
    return libInfo[2].map((urlName) => {
      return CDN_URL + libKey + '/' + libInfo[1] + '/' + urlName;
    });
  };

  const createUpdatingLinks = (customizationInfos) =>{
    let fileTypeRegex = '';
    switch (app.currentType) {
      case 'js_pc':
      case 'js_mb':
        fileTypeRegex = /.js$/;
        break;
      case 'css_pc':
        fileTypeRegex = /.css$/;
        break;
    }

    const selectedLibs = [];
    libsMultipleChoice.getValue().map((libKey) => {
      return createLibLinks(libKey, cdnLibsDetail[libKey]);
    }).forEach((liblinks) => {
      liblinks.forEach((link) => {
        if (link.match(fileTypeRegex) && selectedLibs.indexOf(link) === -1) {
          selectedLibs.push(link);
        }
      });
    });

    const userLinks = customizationInfos.filter((item) => {
      return item.type === 'URL' && !isValidLibVersion(item.url);
    }).map((item) => {
      return item.url;
    });

    userLinks.forEach((link) => {
      selectedLibs.push(link);
    });

    let newCustomizationInfo = selectedLibs.map((libUrl) => {
      return {type: 'URL', url: libUrl};
    });

    newCustomizationInfo = newCustomizationInfo.concat(customizationInfos.filter((item) => {
      return item.type === 'FILE';
    }));

    return newCustomizationInfo;
  };

  const createUpdatingFiles = (customizationInfos, newFileKey) => {
    if (app.currentFileKey === NO_FILE_KEY) {
      // Creating new file
      customizationInfos.push({
        file: {fileKey: newFileKey},
        type: 'FILE'
      });
    } else {
      // Updating old file
      customizationInfos.forEach((item, index) => {
        if (item.type === 'FILE' && item.file.fileKey === app.currentFileKey) {
          customizationInfos[index].file = {fileKey: newFileKey};
          return false;
        }
      });
    }

    return customizationInfos;
  };

  const createUpdatingContent = (customization, newFileKey) => {
    let customizationInfos = getCustomizationPart(customization);
    customizationInfos = createUpdatingFiles(customizationInfos, newFileKey);
    customizationInfos = createUpdatingLinks(customizationInfos);

    return customizationInfos;
  };

  const createUpdatingCustomization = (customization, content) => {
    const newCustomization = customization;
    switch (app.currentType) {
      case 'js_pc':
        newCustomization.desktop.js = content;
        break;
      case 'js_mb':
        newCustomization.mobile.js = content;
        break;
      case 'css_pc':
        newCustomization.desktop.css = content;
        break;
    }

    return newCustomization;
  };

  const handelTypeDropdownChange = (value) => {
    if (app.modeifiedFile && !confirmDiscard()) {
      typeDropdown.setValue(app.currentType);
      return;
    }

    app.currentType = value;
    refreshLibsMultipleChoice();

    ui.showSpinner();
    refresh().then(() => {
      if (!app.currentFileKey) {
        makeComponentDisabled();
      } else {
        makeComponentEnabled();
      }

      app.modeifiedFile = false;
      ui.hideSpinner();
    });
  };

  const handelFilesDropdownChange = (value) => {
    if ((value === app.currentFileKey) || (app.modeifiedFile && !confirmDiscard())) {
      filesDropdown.setValue(app.currentFileKey);
      return;
    }

    removeNewFileInFilesDropdown();
    app.currentFileKey = value;
    app.modeifiedFile = false;

    if (NO_FILE_KEY === app.currentFileKey) {
      return;
    }

    ui.showSpinner();
    service.getFile(app.currentFileKey).then((fileData) => {
      setEditorContent(fileData);
      ui.hideSpinner();
    });
  };

  const handleNewFileBtnClick = () => {
    if (app.modeifiedFile && !confirmDiscard()) {
      return;
    }

    refreshFilesDropdown().then(() => {
      ui.showSpinner();
      let fileName = window.prompt(i18n.msg_input_file_name, '');
      if (!fileName) {
        return refresh();
      }

      fileName = createNameForNewFile(fileName.trim());
      const replaceSpacesRegex = /  +/g;
      fileName = fileName.replace(replaceSpacesRegex, ' ');

      if (!isValidFileName(fileName)) {
        return kintone.Promise.resolve();
      }

      const newFileInfo = addNewTempFile(fileName);
      renderFilesDropdown(newFileInfo.file.fileKey);

      const defaultSource = getDefaultSourceForNewFile();
      setEditorContent(defaultSource);
      app.modeifiedFile = true;

      return kintone.Promise.resolve();
    }).then(() => {
      if (!app.currentFileKey) {
        makeComponentDisabled();
      } else {
        makeComponentEnabled();
      }

      ui.hideSpinner();
    });
  };

  const handleSubmitBtn = () => {
    ui.showSpinner();

    const lastFileKey = filesDropdown.getValue();
    const lastFileIndex = filesDropdown.getItems().map((item, i) => {
      return {fileKey: item.value, index: i};
    }).filter((item) => {
      return item.fileKey === lastFileKey;
    })[0].index;

    const selectedFileKey = filesDropdown.getValue();
    const selectedFile = filesDropdown.getItems().filter((item) => {
      return item.value === selectedFileKey;
    });

    let newFileKey = '';
    service.uploadFile(selectedFile[0].label, editor.editor.getValue()).then((file) => {
      newFileKey = file.fileKey;

      return service.getCustomization();
    }).then((customization) => {
      const content = createUpdatingContent(customization, newFileKey);
      const newCustomization = createUpdatingCustomization(customization, content);

      const invalidCustomizationsLimit = checkValidCustomizationLimit(newCustomization);
      if (invalidCustomizationsLimit.length > 0) {
        const errMsg = invalidCustomizationsLimit.map((type) => {
          return i18n.msg_max_customizations_limit.replace('<LIMIT_NUMBER>', MAX_CUSTOMIZATION)
            .replace('<CUSTOMIZATION_TYPE>', i18n[type]);
        }).join('\n');
        return kintone.Promise.reject(errMsg);
      }

      return service.updateCustomization(newCustomization).catch(() => {
        throw i18n.msg_failed_to_update;
      });
    }).then((resp) => {
      const notDeployApp = deployConfigCheckbox.getValue().length === 0;
      if (notDeployApp) {
        return kintone.Promise.resolve();
      }

      return service.deployApp();
    }).then(() => {
      return refreshFilesDropdown();
    }).then(() => {
      const fileToSelect = filesDropdown.getItems()[lastFileIndex].value;
      filesDropdown.setValue(fileToSelect);
      app.currentFileKey = fileToSelect;

      app.modeifiedFile = false;
    }).then(() => {
      return checkDeployStatus();
    }).then(() => {
      ui.hideSpinner();
    }).catch((err) => {
      if (err.deployStatus && err.deployStatus === 'FAIL') {
        alert(i18n.msg_failed_to_update);
      }

      if (typeof err === 'string') {
        alert(err);
      }

      ui.hideSpinner();
    });
  };

  const checkDeployStatus = () => {
    const waitForDeployment = (resolve, reject) => {
      return service.deployStatus().then((response) => {
        const appInfo = response.apps[0];
        switch (appInfo.status) {
          case 'FAIL':
            reject({deployStatus: appInfo.status});
            break;
          case 'PROCESSING':
            setTimeout(() => {
              waitForDeployment(resolve, reject);
            }, DEPLOYMENT_TIMEOUT);
            break;
          case 'SUCCESS':
          case 'CANCEL':
            resolve();
        }
      }).catch((error) => {
        reject(error);
      });
    };

    return new kintone.Promise((resolve, reject) => {
      waitForDeployment(resolve, reject);
    });
  };

  const handleCancelBtn = (e) => {
    if (!confirmDiscard()) {
      return;
    }
    ui.showSpinner();
    const currentFileKey = app.currentFileKey;
    refresh(currentFileKey).then(() => {
      if (!app.currentFileKey) {
        makeComponentDisabled();
      } else {
        makeComponentEnabled();
      }
      ui.hideSpinner();
    });
  };

  const handleBackBtn = () => {
    if (app.modeifiedFile && !confirmDiscard()) {
      return;
    }
    history.back();
  };

  const handleEditorChange = () => {
    app.modeifiedFile = true;
  };

  (() => {
    renderUi();
    refreshLibsMultipleChoice();

    ui.showSpinner();
    refresh().then(() => {
      newFileBtn.on('click', handleNewFileBtnClick);
      typeDropdown.on('change', handelTypeDropdownChange);
      filesDropdown.on('change', handelFilesDropdownChange);
      editor.on('change', handleEditorChange);
      submitBtn.on('click', handleSubmitBtn);
      cancelBtn.on('click', handleCancelBtn);
      backLinkEl.addEventListener('click', handleBackBtn);

      if (!app.currentFileKey) {
        makeComponentDisabled();
      } else {
        makeComponentEnabled();
      }

      ui.hideSpinner();
    });
  })();
})(kintone.$PLUGIN_ID);
