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
    var i18n = window.jsEditKintonePlugin.i18n;

    var CDN_URL = i18n.cdn_url;
    var NO_FILE_KEY = '-1';

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
        libsContainerEl.appendChild(libsMultipleChoice.render());

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

    function renderLibsMultipleChoice() {
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

        libs.forEach(function (lib, index) {
            libsMultipleChoice.addItem({
                label: lib.name + '(' + lib.version + ')',
                value: lib.key
            });
        })
    }

    function renderFilesDropdown(defaultValue) {
        clearFilesDropdown();
        var files = getCustomizationFiles();
        files.forEach(function (file) {
            filesDropdown.addItem({ label: file.name, value: file.fileKey });
        });

        if (files[0]) {
            filesDropdown.setValue(files[0].fileKey);
        }

        if (typeof defaultValue !== 'undefined') {
            filesDropdown.setValue(defaultValue);
        }

        app.currentFileKey = filesDropdown.getValue();
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

    function clearFilesDropdown() {
        filesDropdown.addItem({ label: '', value: '' });
        filesDropdown.setValue('')

        var items = filesDropdown.getItems();
        for (var i = items.length - 1; i >= 0; i--) {
            filesDropdown.removeItem(i)
        }
    }

    function setUsedLibsMultipleChoice() {
        var libLinks = getCustomizationLinks();
        var usedLibs = libLinks.map(function (link) {
            return link.split('/')[3];
        });

        libsMultipleChoice.setValue(usedLibs);
    }

    function refreshFilesDropdown() {
        return service.getCustomization().then(function (customization) {
            getCustomizationInfo(customization);
            renderFilesDropdown();

            return kintone.Promise.resolve();
        });
    }

    function refresh() {
        return refreshFilesDropdown().then(function () {
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

    function isDuplicatedFileName(fileName) {
        var checkFiles = getCustomizationFiles();
        var dupplicatedFiles = checkFiles.filter(function(item) {
            return item.name === fileName;
        });

        if (dupplicatedFiles.length > 0) {
            return true;
        }

        return false;
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
        var defaultSource;
        switch (app.currentType) {
            case 'js_pc':
                defaultSource = '(function() {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})();\n';
                break;
            case 'js_mb':
                defaultSource = '(function() {\n' +
                    '  \'use strict\';\n' +
                    '  kintone.events.on(\'mobile.app.record.index.show\', function(e) {\n' +
                    '  });\n' +
                    '})();\n';
                break;
            case 'css_pc':
                defaultSource = '@charset "UTF-8";';
                break;
        }

        return defaultSource;
    }

    function createLibLinks(libKey, libInfo) {
        return libInfo[2].map(function(urlName) {
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
        libsMultipleChoice.getValue().map(function(libKey) {
            return createLibLinks(libKey, cdnLibsDetail[libKey]);
        }).forEach(function(liblinks) {
            liblinks.forEach(function(link) {
                if (link.match(fileTypeRegex) && selectedLibs.indexOf(link) === -1) {
                    selectedLibs.push(link); 
                }
            });
        });

        var userLinks = customizationInfos.filter(function(item) {
            return item.type === 'URL' && item.url.match(CDN_URL) === null;
        });

        userLinks.forEach(function(link) {
            selectedLibs.push(link);
        })

        var newCustomizationInfo = selectedLibs.map(function(libUrl) {
            return { type: 'URL', url: libUrl };
        });

        newCustomizationInfo = newCustomizationInfo.concat(customizationInfos.filter(function(item) {
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
            customizationInfos.forEach(function(item, index) {
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

        app.currentFileKey = value;

        ui.showSpinner();
        service.getFile(app.currentFileKey).then(function(fileData) {
            setEditorContent(fileData);
            ui.hideSpinner();
        });

        app.modeifiedFile = false;
    }

    function handleNewFileBtnClick() {
        if (app.modeifiedFile && !confirmDiscard()) {
            return;
        }

        refreshFilesDropdown().then(function() {
            var fileName = window.prompt(i18n.msg_input_file_name);
            if (!fileName) {
                return;
            }

            fileName = createNameForNewFile(fileName.trim());
            if (isDuplicatedFileName(fileName)) {
                alert(i18n.msg_file_name_is_duplicated);
                return;
            }

            var newFileInfo = addNewTempFile(fileName);
            renderFilesDropdown(newFileInfo.file.fileKey);

            var defaultSource = getDefaultSourceForNewFile();
            setEditorContent(defaultSource);
            app.modeifiedFile = true;

            if (!app.currentFileKey) {
                makeComponentDisabled();
            } else {
                makeComponentEnabled();
            }
        });
    }

    function handleSubmitBtn() {
        ui.showSpinner();

        var lastFileKey = filesDropdown.getValue();
        var lastFileIndex = filesDropdown.getItems().map(function(item, i) {
            return { fileKey: item.value, index: i};
        }).filter(function(item) {
            return item.fileKey === lastFileKey;
        })[0].index;

        var selectedFileKey = filesDropdown.getValue();
        var selectedFile = filesDropdown.getItems().filter(function(item) {
            return item.value === selectedFileKey;
        });

        var newFileKey = '';
        service.uploadFile(selectedFile[0].label, editor.editor.getValue()).then(function(file) {
            newFileKey = file.fileKey;

            return service.getCustomization();
        }).then(function(customization) {
            var content = createUpdatingContent(customization, newFileKey);
            var newCustomization = createUpdatingCustomization(customization, content);

            return service.updateCustomization(newCustomization).catch(function() {
                alert(i18n.msg_failed_to_update);
                ui.hideSpinner();
            });
        }).then(function(resp) {
            var notDeployApp = deployConfigCheckbox.getValue().length === 0;
            if (notDeployApp) {
                return kintone.Promise.resolve();
            }

            return service.deployApp();
        }).then(function() {
            return refreshFilesDropdown();
        }).then(function() {
            var fileToSelect = filesDropdown.getItems()[lastFileIndex].value;
            filesDropdown.setValue(fileToSelect);

            app.modeifiedFile = false;
            ui.hideSpinner();
        }).catch(function(err) {
            ui.hideSpinner();
        });
    }

    function handleCancelBtn(e) {
        if (!confirmDiscard()) {
            return;
        }
        ui.showSpinner();
        refresh().then(function() {
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
        renderLibsMultipleChoice();

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