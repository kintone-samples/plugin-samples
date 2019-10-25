/*
 * js-edit Plug-in
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
(function (PLUGIN_ID) {
    'use strict';
    var ui = window.jsEditKintonePlugin.ui;
    var service = window.jsEditKintonePlugin.service;
    var cdnLibsDetail = window.jsEditKintonePlugin.resource.cdnLibsDetail;
    var lang = window.jsEditKintonePlugin.lang;
    var i18n = window.jsEditKintonePlugin.i18n;

    var CDN_URL = i18n.cdn_url;
    var NO_FILE_KEY = '-1';
    var MAX_LENGHT_FILE_NAME = 255;
    var MAX_CUSTOMIZATION = 30;
    var DEPLOYMENT_TIMEOUT = 1000;

    var app = {
        customization: {
            desktop: { css: [], js: [] },
            mobile: { css: [], js: [] }
        },
        removingLibs: [],
        currentType: 'js_pc',
        currentFileKey: '',
        modeifiedFile: false
    };

    var editor = ui.createEditor();
    var newFileBtn = ui.createNewFileButton();
    var typeDropdown = ui.createTypeDropdown();
    var filesDropdown = ui.createFilesDropdown();
    var submitBtn = ui.createSubmitButton();
    var cancelBtn = ui.createCancelButton();
    var backLinkEl = ui.createBackLinkEl();
    var libsMultipleChoice = ui.createMultipleChoice();
    var deployConfigCheckbox = ui.createDeployConfigCheckbox();

    function confirmDiscard() {
        return (window.confirm(i18n.msg_discard));
    }

    function renderUi() {
        var actionContainerEl = ui.createActionContainerEl();
        actionContainerEl.appendChild(newFileBtn.render());
        actionContainerEl.appendChild(typeDropdown.render());
        actionContainerEl.appendChild(filesDropdown.render());

        var submitContainerEl = ui.createSubmitContainerEl();
        submitContainerEl.appendChild(submitBtn.render());
        submitContainerEl.appendChild(cancelBtn.render());
        submitContainerEl.appendChild(backLinkEl);

        var libsContainerEl = ui.createLibsContainerEl();

        var libsLinksContainerEl = ui.createLibsLinksContainerEl();
        libsLinksContainerEl.className = 'jsedit-container-flex ';
        libsLinksContainerEl.appendChild(libsContainerEl);
        libsLinksContainerEl.appendChild(ui.createLinksEl());

        var saveOptionsEl = ui.createSaveOptionsEl();
        saveOptionsEl.appendChild(deployConfigCheckbox.render());

        var mainContainerEl = ui.getMainContainerEl();
        mainContainerEl.appendChild(actionContainerEl);
        mainContainerEl.appendChild(editor.getContainerEl());
        mainContainerEl.appendChild(submitContainerEl);
        mainContainerEl.appendChild(libsLinksContainerEl);
        mainContainerEl.appendChild(saveOptionsEl);
    }

    function refreshLibsMultipleChoice() {
        var infos = getLibsInfo();
        var libs;
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                libs = infos.jsLibs;
                break;
            case 'css_pc':
                libs = infos.cssLibs;
                break;
        }

        var items = libs.map(function (lib, index) {
            return {
                label: lib.name + '(' + lib.version + ')',
                value: lib.key
            };
        });

        libsMultipleChoice.setItems(items);
        ui.renderLibsContainerEl(libsMultipleChoice.render());
    }

    function renderFilesDropdown(defaultValue) {
        var files = getCustomizationFiles();
        var items = [{ label: '', value: '' }];
        var fileKey = '';

        if (files.length > 0 && files[0]) {
            items = files.map(function (file) {
                return {
                    label: file.name,
                    value: file.fileKey
                };
            });
            fileKey = files[0].fileKey;
        }

        filesDropdown.setItems(items);
        filesDropdown.setValue(fileKey);

        if (typeof defaultValue !== 'undefined') {
            filesDropdown.setValue(defaultValue);
        }

        var value = filesDropdown.getValue();
        app.currentFileKey = value ? value : '';
    }

    function makeComponentDisabled() {
        editor.disable();
        submitBtn.disable();
        cancelBtn.disable();
        filesDropdown.disable();
    }

    function makeComponentEnabled() {
        editor.enable();
        submitBtn.enable();
        cancelBtn.enable();
        filesDropdown.enable();
    }

    function getLibsInfo() {
        var infos = { jsLibs: [], cssLibs: [] };
        Object.keys(cdnLibsDetail).forEach(function (libKey) {
            if (libKey === 'ultradatejs' && lang === 'en') {
                // skip this lib with users using English
                return;
            }

            var lib = cdnLibsDetail[libKey];
            var tmpLib = {
                name: lib[0],
                key: libKey,
                version: lib[1],
                url: [],
                selected: false
            };
            var filenames = lib[2];
            if (!Array.isArray(filenames)) {
                filenames = [filenames];
            }
            var jsLib, cssLib;
            for (var j = 0; j < filenames.length; j++) {
                var filename = filenames[j];
                var url = CDN_URL + lib[0] + '/' + lib[1] + '/' + filename;
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
    }

    function setEditorContent(value) {
        var editorValue = value ? value : '';
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
        editor.editor.selection.moveCursorToPosition({ row: 1, column: 0 });
        editor.editor.selection.selectLine();
        app.modeifiedFile = false;
    }

    function getCustomizationPart(customization) {
        var customizationPart = [];
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
    }

    function getCustomizationFiles() {
        var customizationInfo = getCustomizationPart(app.customization);
        return customizationInfo.filter(function (item) {
            return item.type === 'FILE';
        }).map(function (item) {
            return { fileKey: item.file.fileKey, name: item.file.name };
        });
    }

    function getCustomizationLinks() {
        var customizationInfo = getCustomizationPart(app.customization);
        return customizationInfo.filter(function (item) {
            return item.type === 'URL';
        }).map(function (item) {
            return item.url;
        });
    }

    function getCustomizationInfo(customization) {
        app.customization.desktop = JSON.parse(JSON.stringify(customization.desktop));
        app.customization.mobile = JSON.parse(JSON.stringify(customization.mobile));
    }

    function setUsedLibsMultipleChoice() {
        var unifyItems = function (items) {
            var unifiedItems = [];
            items.forEach(function (item) {
                if (unifiedItems.indexOf(item) === -1) {
                    unifiedItems.push(item);
                }
            });
            return unifiedItems;
        }

        var libLinks = getCustomizationLinks();
        var usedLibs = libLinks.map(function (link) {
            return link.split('/')[3];
        });

        if (lang === 'en') {
            usedLibs = usedLibs.filter(function (lib) {
                return lib !== 'ultradatejs';
            });
        }

        // unifyItems use to cheat for passing kintone-ui-component bug.
        var unifiedUsedLibs = unifyItems(usedLibs);

        libsMultipleChoice.setValue(unifiedUsedLibs);
    }

    function removeNewFileInFilesDropdown() {
        var items = filesDropdown.getItems();
        var newFilesIndex = [];
        items.forEach(function(item, i) {
            if (item.value === NO_FILE_KEY) {
                newFilesIndex.push(i);
            }
        });

        newFilesIndex.forEach(function(index) {
            filesDropdown.removeItem(index);
        });
    }

    function refreshFilesDropdown(defaultValue) {
        return service.getCustomization().then(function (customization) {
            getCustomizationInfo(customization);
            renderFilesDropdown(defaultValue);

            return kintone.Promise.resolve();
        });
    }

    function refresh(currentFileKey) {
        var defaultValue;
        if (typeof currentFileKey !== 'undefined') {
            defaultValue = currentFileKey;
        }

        return refreshFilesDropdown(defaultValue).then(function () {
            setUsedLibsMultipleChoice();

            if (app.currentFileKey === null || app.currentFileKey === '') {
                app.currentFileKey = null;
                return kintone.Promise.resolve(null);
            }

            return service.getFile(app.currentFileKey);
        }).then(function (fileData) {
            setEditorContent(fileData);
        });
    }

    function createNameForNewFile(name) {
        var fileName = name;
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                if (!fileName.match(/\.js$/)) {
                    fileName = fileName + '.js';
                }
                break;
            case 'css_pc':
                if (!fileName.match(/\.css$/)) {
                    fileName = fileName + '.css';
                }
                break;
        }

        return fileName;
    }

    function isValidFileName(fileName) {
        if (fileName.length > MAX_LENGHT_FILE_NAME) {
            alert(i18n.msg_max_file_name_length_limit)
            return false;
        }

        var specialCharRegex = /[\\/:\?\*\|"<>]/
        if (fileName.match(specialCharRegex) !== null) {
            alert(i18n.msg_file_name_includ_special_character)
            return false;
        }

        return true;
    }

    function checkValidCustomizationLimit(customizaions) {
        var invalidCustomization = [];
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
    }

    function addNewTempFile(fileName) {
        var newFileInfo = {
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
    }

    function getDefaultSourceForNewFile() {
        var defaultSource = jsEditKintonePlugin.defaultSource[app.currentType];
        return defaultSource;
    }

    function createLibLinks(libKey, libInfo) {
        return libInfo[2].map(function (urlName) {
            return CDN_URL + libKey + '/' + libInfo[1] + '/' + urlName;
        });
    }

    function createUpdatingLinks(customizationInfos) {
        var fileTypeRegex = '';
        switch (app.currentType) {
            case 'js_pc':
            case 'js_mb':
                fileTypeRegex = /.js$/;
                break;
            case 'css_pc':
                fileTypeRegex = /.css$/;
                break;
        }

        var selectedLibs = [];
        libsMultipleChoice.getValue().map(function (libKey) {
            return createLibLinks(libKey, cdnLibsDetail[libKey]);
        }).forEach(function (liblinks) {
            liblinks.forEach(function (link) {
                if (link.match(fileTypeRegex) && selectedLibs.indexOf(link) === -1) {
                    selectedLibs.push(link);
                }
            });
        });

        var userLinks = customizationInfos.filter(function (item) {
            return item.type === 'URL' && item.url.match(CDN_URL) === null;
        }).map(function (item) {
            return item.url;
        });

        userLinks.forEach(function (link) {
            selectedLibs.push(link);
        })

        var newCustomizationInfo = selectedLibs.map(function (libUrl) {
            return { type: 'URL', url: libUrl };
        });

        newCustomizationInfo = newCustomizationInfo.concat(customizationInfos.filter(function (item) {
            return item.type === 'FILE';
        }));

        return newCustomizationInfo;
    }

    function createUpdatingFiles(customizationInfos, newFileKey) {
        if (app.currentFileKey === NO_FILE_KEY) {
            // Creating new file
            customizationInfos.push({
                file: { fileKey: newFileKey },
                type: 'FILE'
            });
        } else {
            // Updating old file
            customizationInfos.forEach(function (item, index) {
                if (item.type === 'FILE' && item.file.fileKey === app.currentFileKey) {
                    customizationInfos[index].file = { fileKey: newFileKey };
                    return false;
                }
            });
        }

        return customizationInfos;
    }

    function createUpdatingContent(customization, newFileKey) {
        var customizationInfos = getCustomizationPart(customization);
        customizationInfos = createUpdatingFiles(customizationInfos, newFileKey);
        customizationInfos = createUpdatingLinks(customizationInfos);

        return customizationInfos;
    }

    function createUpdatingCustomization(customization, content) {
        var newCustomization = customization;
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
    }

    function handelTypeDropdownChange(value) {
        if (app.modeifiedFile && !confirmDiscard()) {
            typeDropdown.setValue(app.currentType);
            return;
        }

        app.currentType = value;
        refreshLibsMultipleChoice();

        ui.showSpinner();
        refresh().then(function () {
            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }

            app.modeifiedFile = false;
            ui.hideSpinner();
        });
    }

    function handelFilesDropdownChange(value) {
        if (app.modeifiedFile && !confirmDiscard()) {
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
        service.getFile(app.currentFileKey).then(function (fileData) {
            setEditorContent(fileData);
            ui.hideSpinner();
        });
    }

    function handleNewFileBtnClick() {
        if (app.modeifiedFile && !confirmDiscard()) {
            return;
        }

        refreshFilesDropdown().then(function () {
            ui.showSpinner();
            var fileName = window.prompt(i18n.msg_input_file_name, '');
            if (!fileName) {
                return refresh();
            }

            fileName = createNameForNewFile(fileName.trim());
            var replaceSpacesRegex = /  +/g;
            fileName = fileName.replace(replaceSpacesRegex, ' ');

            if (!isValidFileName(fileName)) {
                return kintone.Promise.resolve();
            }

            var newFileInfo = addNewTempFile(fileName);
            renderFilesDropdown(newFileInfo.file.fileKey);

            var defaultSource = getDefaultSourceForNewFile();
            setEditorContent(defaultSource);
            app.modeifiedFile = true;

            return kintone.Promise.resolve();
        }).then(function () {
            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }

            ui.hideSpinner();
        });
    }

    function handleSubmitBtn() {
        ui.showSpinner();

        var lastFileKey = filesDropdown.getValue();
        var lastFileIndex = filesDropdown.getItems().map(function (item, i) {
            return { fileKey: item.value, index: i };
        }).filter(function (item) {
            return item.fileKey === lastFileKey;
        })[0].index;

        var selectedFileKey = filesDropdown.getValue();
        var selectedFile = filesDropdown.getItems().filter(function (item) {
            return item.value === selectedFileKey;
        });

        var newFileKey = '';
        service.uploadFile(selectedFile[0].label, editor.editor.getValue()).then(function (file) {
            newFileKey = file.fileKey;

            return service.getCustomization();
        }).then(function (customization) {
            var content = createUpdatingContent(customization, newFileKey);
            var newCustomization = createUpdatingCustomization(customization, content);

            var invalidCustomizationsLimit = checkValidCustomizationLimit(newCustomization);
            if (invalidCustomizationsLimit.length > 0) {
                var errMsg = invalidCustomizationsLimit.map(function (type) {
                    return i18n.msg_max_customizations_limit.replace('<LIMIT_NUMBER>', MAX_CUSTOMIZATION)
                        .replace('<CUSTOMIZATION_TYPE>', i18n[type]);
                }).join('\n');
                return kintone.Promise.reject(errMsg);
            }

            return service.updateCustomization(newCustomization).catch(function () {
                throw i18n.msg_failed_to_update
            });
        }).then(function (resp) {
            var notDeployApp = deployConfigCheckbox.getValue().length === 0;
            if (notDeployApp) {
                return kintone.Promise.resolve();
            }

            return service.deployApp();
        }).then(function () {
            return refreshFilesDropdown();
        }).then(function () {
            var fileToSelect = filesDropdown.getItems()[lastFileIndex].value;
            filesDropdown.setValue(fileToSelect);
            app.currentFileKey = fileToSelect;

            app.modeifiedFile = false;
        }).then(function () {
            return checkDeployStatus();
        }).then(function () {
            ui.hideSpinner();
        }).catch(function (err) {
            if (err.deployStatus && err.deployStatus === 'FAIL') {
                alert(i18n.msg_failed_to_update);
            }

            if (typeof err === 'string') {
                alert(err);
            }

            ui.hideSpinner();
        });
    }

    function checkDeployStatus() {
        function waitForDeployment(resolve, reject) {
            return service.deployStatus().then(function (response) {
                var app = response.apps[0];
                switch (app.status) {
                    case 'FAIL':
                        reject({ deployStatus: app.status });
                        break;
                    case 'PROCESSING':
                        setTimeout(function () {
                            waitForDeployment(resolve, reject);
                        }, DEPLOYMENT_TIMEOUT);
                        break;
                    case 'SUCCESS':
                    case 'CANCEL':
                        resolve();
                }
            }).catch(function (error) {
                reject(error);
            });
        }

        return new kintone.Promise(function (resolve, reject) {
            waitForDeployment(resolve, reject);
        });
    }

    function handleCancelBtn(e) {
        if (!confirmDiscard()) {
            return;
        }
        ui.showSpinner();
        var currentFileKey = app.currentFileKey;
        refresh(currentFileKey).then(function () {
            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }
            ui.hideSpinner();
        });
    }

    function handleBackBtn() {
        if (app.modeifiedFile && !confirmDiscard()) {
            return;
        }
        history.back();
    }

    function handleEditorChange() {
        app.modeifiedFile = true;
    }

    (function () {
        renderUi();
        refreshLibsMultipleChoice();

        ui.showSpinner();
        refresh().then(function () {
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
