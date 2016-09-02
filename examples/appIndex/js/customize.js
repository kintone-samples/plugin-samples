/* Author : cstap inc. Takuji Takei */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    // 各言語対応
    var recordNumber = "レコード番号";
    var creator = "作成者";
    var createTime = "作成日時";
    var updator = "更新者";
    var updateTime = "更新日時";
    if (config.lang === "zh") {
        recordNumber = "记录编号";
        creator = "创建人";
        createTime = "创建时间";
        updator = "更新人";
        updateTime = "更新时间";
    } else if (config.lang === "en") {
        recordNumber = "Record_number";
        creator = "Created_by";
        createTime = "Created_datetime";
        updator = "Updated_by";
        updateTime = "Updated_datetime";
    }
    

    // 全アプリ取得用のDeffered
    var d = new $.Deferred();
    // jsTree描画用のDeffered
    var d2 = new $.Deferred();
    // jsTreeのノード格納用変数
    var data = [];
    // jsTreeの子ノード格納用変数
    var children = [];
    // アプリ情報格納用変数
    var apps;
    // rootフォルダのアイコン
    var rootIcon;
    var onceFlg = true;

    // フォルダ情報
    var folderInfo = [];
    var childNodeInfo = [];

    var folderIcon = config['folderIcon'];
    var appIcon = config['appIcon'];
    var vc_type = ['folder', 'file', 'tree', 'leaf', 'home',
    'arrowRight', 'asterisk', 'bell', 'handRight', 'heart', 'heartEmpty'];

    // 全アプリ取得関数
    function fetchApps(opt_offset, opt_limit, opt_records) {
        var offset = opt_offset || 0;
        var limit = opt_limit || 100;
        var allRecords = opt_records || [];
        return kintone.api(kintone.api.url('/k/v1/apps', true), 'GET', {
            limit: limit,
            offset: offset
        }).then(function(resp) {
            allRecords = allRecords.concat(resp.apps);
            if (resp.apps.length === limit) {
                return fetchApps(offset + limit, limit, allRecords);
            }
            apps = allRecords;
            d.resolve();
        });
    }

    // 全レコード取得関数
    function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
        var offset = opt_offset || 0;
        var limit = opt_limit || 100;
        var allRecords = opt_records || [];
        var params = {
            app: appId,
            query: query + ' limit ' + limit + ' offset ' + offset
        };
        return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
            allRecords = allRecords.concat(resp.records);
            if (resp.records.length === limit) {
                return fetchRecords(appId, query, offset + limit, limit, allRecords);
            }
            return allRecords;
        });
    }

    // 全レコード削除関数
    function deleteRecords(appId, delIds, opt_offset, opt_limit) {
        var offset = opt_offset || 0;
        var limit = opt_limit || 100;
        var finishFlg = 0;
        var ids = [];

        for (var i = offset, j = 0; j < limit; i++, j++) {
            if (typeof (delIds[i]) === "undefined") {
                finishFlg = 1;
                break;
            }
            ids.push(delIds[i]);
        }

        var params = {
            app: appId,
            ids: ids
        };

        return kintone.api('/k/v1/records', 'DELETE', params).then(
            function(resp) {
                if (finishFlg === 0) {
                    return deleteRecords(appId, delIds, offset + limit, limit);
                }
                return true;
            },
            function(resp) {
                return false;
            }
        );
    }

    // ローディング画面
    function setLoading() {
    // モーダルでローディング画像を表示
        var $body = $('body');
        $body.css('width', '100%');

        var $loading = $('<div>').attr('id', 'loading').attr('class', 'loading')
        .attr('style', 'width: 100%; height: 100%; position:absolute;' +
        ' top:0; left:0; text-align:center; background-color:#666666; opacity:0.6; z-index: 9;');
        var $div = $('<div>').attr('id', 'imgBox').attr('style', 'width: 100%; height: 100%;');
        var $img = $('<img>').attr('src', 'data:image/gif;base64,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');
        $loading.append($div.append($img));
        $body.append($loading);

        $('#imgBox').attr('style', 'margin-top: ' + Math.floor($('#loading').height() / 2) + 'px;');

        $body.css('position', 'fixed');

        var autoRemoveCnt = 0;
        var autoRemoveInterval = setInterval(function() {
            autoRemoveCnt++;
            if (autoRemoveCnt > 9) {
                clearInterval(autoRemoveInterval);
                removeLoading();
            }
        }, 1000);
    }

    function removeLoading() {
        var $loading = $('.loading');
        $loading.remove();

        var $body = $('body');
        $body.css('position', '');
    }

    // jstree準備関数
    function readyTree(event) {
        setLoading();
        $("#tree").jstree("destroy");
        d = new $.Deferred();
        d2 = new $.Deferred();
        data = [];
        children = [];
        folderInfo = [];

        // rootフォルダのアイコンを確定させる
        switch (config.folderIcon) {
            case "folder":
                rootIcon = 'jstree-folder';
                break;
            case "tree":
                rootIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA' +
                    'QCAYAAAAf8/9hAAACZUlEQVR42oWTTUhUURTHf88ZP5px7DXpmI6lEKi1Gj' +
                    'ctKm36WoREz0UUEqiLoKAoFyK08aMiKGLGWmQQOdBGaGEKGdRCA2lRkNIim' +
                    'hHC6ZPUpjGdGD/mTeeNVs8vunDvuZd7/r9zzn3nKaw1zlAiqyZzn1pm0Vyb' +
                    'HYTeREeYoYZOxsyuiklUn7vD6isvdavjE1OUbHORmQ7l211YLRZicbh19fk' +
                    'YDgFMMyKgxmUASzsDl5uPesNjiwFisRgLicRfvt1up6CgAKfqpPPBM0Ivog' +
                    '0CCShL0Vsl1ZbaYxVEvk+sqihpzGQyNbNzcnAXFnOlud9vZKGI+GLpbtVXf' +
                    '6KS4Lsg8dl4SqCLc0JPitVT+9R5yVZXHqDF/5BoMNGgZF3jR3uTpr4aHmZu' +
                    'fn6V85+9GZbjcHBk1x5u3O1DUX2W5KGqcqZiE/8E5si6vgym6wZQ53S1lsr' +
                    'CKKHr3KWq+uDHUabl4RLrRDVn47DZyM/YwtPuUMAA9HTcOand6+9b09mwRR' +
                    '8S7B+EvsPwNRcy0i00ace5cLZ70ABoRR5bj26Pk56tpAQ1vTpbY/DNBeENU' +
                    'DsDryPgl9aSish32ihMy2OoN9ymmDqvK9OD17YRiSyiJ1C3E35GIcsO1yfh' +
                    'sZwJycwiSoQO+Yyt5k70yMUAFlQ2QWka3P8FmXmS9qhcC+SL0VeL7fxodSs' +
                    'vQlRZjWzqyuJogWJKrE749BZuTtI2lEdg/X/BNG7vTYEGDp7CE5uF8TC8f0' +
                    'nj+SH8K32VNcReMT6nG4/qlveYg2np7sjn1HWFQEb+B/hThmHrrBl4F+akb' +
                    'jmLeHCl/28Ig0BcPhKKzAAAAABJRU5ErkJggg==';
                break;
            case "leaf":
                rootIcon = "glyphicon glyphicon-leaf";
                break;
            case "home":
                rootIcon = "glyphicon glyphicon-home";
                break;
            case "arrowRight":
                rootIcon = "glyphicon glyphicon-arrow-right";
                break;
            case "asterisk":
                rootIcon = "glyphicon glyphicon-asterisk";
                break;
            case "bell":
                rootIcon = "glyphicon glyphicon-bell";
                break;
            case "handRight":
                rootIcon = "glyphicon glyphicon-hand-right";
                break;
            case "heart":
                rootIcon = "glyphicon glyphicon-heart";
                break;
            case "heartEmpty":
                rootIcon = "glyphicon glyphicon-heart-empty";
                break;
        }


        // すでにログインユーザーに紐づくレコードがあるかどうか（初期状態か否か）
        fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code + '") and parentFolderID = ""')
        .then(function(rootRec) {
            if (rootRec.length > 0) {
                data[0] = {
                    text: rootRec[0].folderName.value,
                    class: "jstree-open",
                    type: 'root',
                    children: [],
                    self: "j1_1"
                };
                fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code +
                '") and parentFolderID != "" order by appSort asc').then(function(selfRecords) {
                    for (var j = 0; j < selfRecords.length; j++) {
                        // フォルダの場合
                        if (!selfRecords[j].appName.value) {
                            children.push({
                                text: selfRecords[j].folderName.value,
                                class: "jstree-open",
                                type: folderIcon,
                                children: [],
                                self: selfRecords[j].selfFolderID.value,
                                parentFolderID: selfRecords[j].parentFolderID.value,
                                appSort: selfRecords[j].appSort.value
                            });
                        } else {
                            children.push({
                                text: selfRecords[j].appName.value,
                                type: appIcon,
                                attr: {
                                    "href": "https://" + location.host + "/k/" + selfRecords[j].appID.value + "/"
                                },
                                parentFolderID: selfRecords[j].parentFolderID.value,
                                appSort: selfRecords[j].appSort.value,
                                appId: selfRecords[j].appID.value
                            });
                        }
                    }

                    // フォルダの子階層を設定
                    var currentFolder;
                    var jissitsuSort = 0;
                    var deleteKey = [];
                    for (var ckey in children) {
                        if (children[ckey].type === folderIcon) {
                            if (typeof (children[parseInt(ckey, 10) + 1]) !== "undefined" &&
                            children[parseInt(ckey, 10) + 1].parentFolderID === children[ckey].self) {
                                currentFolder = ckey;
                                if (!folderInfo[jissitsuSort]) {
                                    folderInfo[jissitsuSort] = [];
                                }
                                continue;
                            }
                        }
                        if (children[ckey].parentFolderID !== "j1_1") {
                            folderInfo[jissitsuSort].push(children[ckey]);
                            children[currentFolder].children.push(children[ckey]);
                            deleteKey.push(ckey);
                        } else {
                            jissitsuSort++;
                        }
                        if (typeof (children[parseInt(ckey, 10) + 1]) !== "undefined" &&
                        children[parseInt(ckey, 10) + 1].parentFolderID === "j1_1" &&
                        children[ckey].parentFolderID !== "j1_1") {
                            jissitsuSort++;
                        }
                    }

                    var delCnt = 0;
                    for (var dkey in deleteKey) {
                        childNodeInfo.push(children[deleteKey[dkey] - delCnt]);
                        children.splice(deleteKey[dkey] - delCnt, 1);
                        delCnt++;
                    }

                    data[0].children = children;
                    d2.resolve();
                });
            } else {
                // 全アプリ取得
                fetchApps();

                d.promise().then(function() {
                    // 取得した全アプリをアプリIDの降順に並び替え
                    apps.sort(function(a, b) {
                        if (parseInt(a.appId, 10) > parseInt(b.appId, 10)) {
                            return -1;
                        }
                        if (parseInt(a.appId, 10) < parseInt(b.appId, 10)) {
                            return 1;
                        }
                        return 0;
                    });
                    for (var i = 0; i < apps.length; i++) {
                        children.push({
                            text: apps[i].name,
                            type: appIcon,
                            attr: {
                                "href": "https://" + location.host + "/k/" + apps[i].appId + "/"
                            }
                        });
                    }
                    var appIndex = "アプリ一覧";
                    if (config.lang === "zh") {
                        appIndex = "软件连接一览";
                    } else if (config.lang === "en") {
                        appIndex = "app index";
                    }
                    data = [{
                        text: appIndex,
                        class: "jstree-open",
                        children: children,
                        type: 'root'
                    }];

                    var recCount = apps.length;
                    var putCount = Math.ceil(recCount / 100);
                    for (var k = 0; k < putCount; k++) {
                        var offset = k * 100;
                        var limit = 100;
                        if (offset + limit > recCount) {
                            limit = recCount - offset;
                        }
                        var putLimit = limit + offset;
                        var insRecords = [];

                        for (offset; offset < putLimit; offset++) {
                            var record = {
                                appName: {
                                    value: apps[offset].name
                                },
                                appSort: {
                                    value: offset
                                },
                                appID: {
                                    value: apps[offset].appId
                                },
                                parentFolderID: {
                                    value: "j1_1"
                                }
                            };
                            insRecords.push(record);
                        }
                        var finFlg = false;
                        var finRecs = [];
                        var rootRecord = {
                            folderName: {
                                value: appIndex
                            },
                            selfFolderID: {
                                value: "j1_1"
                            }
                        };
                        if (recCount === offset && (offset % 100) !== 0) {
                            insRecords.push(rootRecord);
                            finFlg = true;
                        } else if (recCount === offset && (offset % 100) === 0) {
                            finRecs.push(rootRecord);
                            kintone.api('/k/v1/records', 'POST', {
                                app: event.appId,
                                records: insRecords
                            },
                            function(resp) {
                                finFlg = true;
                            });
                        }

                        kintone.api('/k/v1/records', 'POST', {
                            app: event.appId,
                            records: insRecords
                        },
                            function(resp) {
                                if (finFlg) {
                                    location.reload();
                                }
                            }
                        );
                    }
                });
            }

            d2.promise().then(function() {
                createTree(event);
            });

        });
    }

    // jstree描画関数
    function createTree(event) {
        $('#tree').jstree({
            core: {
                "multiple" : false,
                'check_callback': true,
                'themes': {
                    "variant": "large"
                },
                data: data
            },
            "contextmenu": {
                "items": function() {
                    var conLabelRename = "表示名変更";
                    var conLabelDelete = "一覧から削除";
                    if (config.lang === "zh") {
                        conLabelRename = "变更表示名";
                        conLabelDelete = "删除";
                    } else if (config.lang === "en") {
                        conLabelRename = "Change name";
                        conLabelDelete = "Delete Node";
                    }
                    return {
                        "Rename": {
                            "label": conLabelRename,
                            "action": function(nameData) {
                                var inst = $.jstree.reference(nameData.reference);
                                var obj = inst.get_node(nameData.reference);
                                inst.edit(obj);
                            }
                        },
                        "Delete": {
                            "label": conLabelDelete,
                            "action": function(deleteData) {
                                var ref = $.jstree.reference(deleteData.reference),
                                    sel = ref.get_selected();
                                if (!sel.length) {
                                    return false;
                                }
                                ref.delete_node(sel);
                            }
                        }
                    };
                }
            },
            check_callback: function(operation, node, node_parent, node_position, more) {
                switch (operation) {
                    case 'create_node':
                        return true;
                    default:
                        return false;
                }
            },
            types: {
                '#': {
                    valid_children: []
                },
                'default': {
                    valid_children: []
                },
                folder: {
                    icon: 'jstree-folder',
                    valid_children: [config.appIcon]
                },
                file: {
                    icon: 'jstree-file',
                    valid_children: []
                },
                tree: {
                    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA' +
                    'QCAYAAAAf8/9hAAACZUlEQVR42oWTTUhUURTHf88ZP5px7DXpmI6lEKi1Gj' +
                    'ctKm36WoREz0UUEqiLoKAoFyK08aMiKGLGWmQQOdBGaGEKGdRCA2lRkNIim' +
                    'hHC6ZPUpjGdGD/mTeeNVs8vunDvuZd7/r9zzn3nKaw1zlAiqyZzn1pm0Vyb' +
                    'HYTeREeYoYZOxsyuiklUn7vD6isvdavjE1OUbHORmQ7l211YLRZicbh19fk' +
                    'YDgFMMyKgxmUASzsDl5uPesNjiwFisRgLicRfvt1up6CgAKfqpPPBM0Ivog' +
                    '0CCShL0Vsl1ZbaYxVEvk+sqihpzGQyNbNzcnAXFnOlud9vZKGI+GLpbtVXf' +
                    '6KS4Lsg8dl4SqCLc0JPitVT+9R5yVZXHqDF/5BoMNGgZF3jR3uTpr4aHmZu' +
                    'fn6V85+9GZbjcHBk1x5u3O1DUX2W5KGqcqZiE/8E5si6vgym6wZQ53S1lsr' +
                    'CKKHr3KWq+uDHUabl4RLrRDVn47DZyM/YwtPuUMAA9HTcOand6+9b09mwRR' +
                    '8S7B+EvsPwNRcy0i00ace5cLZ70ABoRR5bj26Pk56tpAQ1vTpbY/DNBeENU' +
                    'DsDryPgl9aSish32ihMy2OoN9ymmDqvK9OD17YRiSyiJ1C3E35GIcsO1yfh' +
                    'sZwJycwiSoQO+Yyt5k70yMUAFlQ2QWka3P8FmXmS9qhcC+SL0VeL7fxodSs' +
                    'vQlRZjWzqyuJogWJKrE749BZuTtI2lEdg/X/BNG7vTYEGDp7CE5uF8TC8f0' +
                    'nj+SH8K32VNcReMT6nG4/qlveYg2np7sjn1HWFQEb+B/hThmHrrBl4F+akb' +
                    'jmLeHCl/28Ig0BcPhKKzAAAAABJRU5ErkJggg==',
                    valid_children: config.appIcon !== "tree" ? [config.appIcon] : []
                },
                leaf: {
                    icon: "glyphicon glyphicon-leaf",
                    valid_children: config.appIcon !== "leaf" ? [config.appIcon] : []
                },
                home: {
                    icon: "glyphicon glyphicon-home",
                    valid_children: config.appIcon !== "home" ? [config.appIcon] : []
                },
                arrowRight: {
                    icon: "glyphicon glyphicon-arrow-right",
                    valid_children: config.appIcon !== "arrowRight" ? [config.appIcon] : []
                },
                asterisk: {
                    icon: "glyphicon glyphicon-asterisk",
                    valid_children: config.appIcon !== "asterisk" ? [config.appIcon] : []
                },
                bell: {
                    icon: "glyphicon glyphicon-bell",
                    valid_children: config.appIcon !== "bell" ? [config.appIcon] : []
                },
                handRight: {
                    icon: "glyphicon glyphicon-hand-right",
                    valid_children: config.appIcon !== "handRight" ? [config.appIcon] : []
                },
                heart: {
                    icon: "glyphicon glyphicon-heart",
                    valid_children: config.appIcon !== "heart" ? [config.appIcon] : []
                },
                heartEmpty: {
                    icon: "glyphicon glyphicon-heart-empty",
                    valid_children: config.appIcon !== "heartEmpty" ? [config.appIcon] : []
                },
                root: {
                    icon: rootIcon,
                    valid_children: vc_type
                }
            },
            plugins: [
                'types', 'contextmenu', 'dnd'
            ]
        })
            // ローディング終了時、すべてのフォルダを開いた状態にする
            .bind("loaded.jstree", function() {
                $(this).jstree("open_all");
                removeLoading();
                onceFlg = true;
            })
            // ノードを選択時、設定したURLに飛ばす
            .bind("select_node.jstree", function(e, s_data) {
                // ただし右クリック時は飛ばさない
                var evt = window.event || event;
                var button = evt.which || evt.button;

                if (button !== 1 && (typeof button !== "undefined")) {
                    return false;
                }
                if (typeof (s_data.node.original.attr) !== 'undefined') {
                    var href = s_data.node.original.attr.href;
                    window.open(href);
                }
            })
            .bind("create_node.jstree", function(c_event, c_obj) {
                if (onceFlg) {
                    setLoading();
                    onceFlg = false;
                    fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code + '")' +
                    ' and selfFolderID != "j1_1" order by appSort asc')
                    .then(function(createRec) {
                        if (createRec.length > 0) {
                            var recCount = createRec.length;
                            var putCount = Math.ceil(recCount / 100);
                            for (var i = 0; i < putCount; i++) {
                                var offset = i * 100;
                                var limit = 100;
                                if (offset + limit > recCount) {
                                    limit = recCount - offset;
                                }
                                var putLimit = limit + offset;

                                var editRecords = [];

                                // 更新対象レコードに更新後のデータを上書き
                                for (offset; offset < putLimit; offset++) {
                                    var record = $.extend(true, {}, createRec[offset]);
                                    var recNo = record['$id'].value;
                                    delete record['$id'];
                                    delete record['$revision'];
                                    delete record[recordNumber];
                                    delete record[createTime];
                                    delete record[creator];
                                    delete record[updateTime];
                                    delete record[updator];
                                    record['appSort'].value = parseInt(record['appSort'].value, 10) + 1;
                                    editRecords.push({
                                        'id': recNo,
                                        'record': record
                                    });
                                }
                                var finCnt = -1;
                                if (recCount === offset) {
                                    finCnt = limit;
                                }

                                // 最後に更新処理
                                kintone.api('/k/v1/records', 'PUT', {
                                    app: kintone.app.getId(),
                                    'records': editRecords
                                }, function(createMoveResp) {
                                    if (finCnt !== -1 && finCnt === createMoveResp.records.length) {
                                    // その後新規フォルダレコード作成
                                        var newFolder = "新規フォルダ";
                                        if (config.lang === "zh") {
                                            newFolder = "新规文件夹";
                                        } else if (config.lang === "en") {
                                            newFolder = "New folder";
                                        }
                                        var postRec = {
                                            folderName: {
                                                value: newFolder
                                            },
                                            appSort: {
                                                value: 0
                                            },
                                            parentFolderID: {
                                                value: "j1_1"
                                            },
                                            selfFolderID: {
                                                value: c_event.timeStamp
                                            }
                                        };
                                        kintone.api(kintone.api.url('/k/v1/record', true), 'POST', {
                                            app: kintone.app.getId(),
                                            record: postRec
                                        }, function(createResp) {
                                            readyTree(event);
                                        });
                                    }
                                });
                            }
                        } else {
                            var newFolder = "新規フォルダ";
                            if (config.lang === "zh") {
                                newFolder = "新规文件夹";
                            } else if (config.lang === "en") {
                                newFolder = "New folder";
                            }
                            var postRec = {
                                folderName: {
                                    value: newFolder
                                },
                                appSort: {
                                    value: 0
                                },
                                parentFolderID: {
                                    value: "j1_1"
                                },
                                selfFolderID: {
                                    value: c_event.timeStamp
                                }
                            };
                            kintone.api(kintone.api.url('/k/v1/record', true), 'POST', {
                                app: kintone.app.getId(),
                                record: postRec
                            }, function(createResp) {
                                readyTree(event);
                            });
                        }
                    });
                }
            })
            .bind("rename_node.jstree", function(r_event, r_obj) {
                setLoading();
                var appFolder;
                var appFlg = true;
                // フォルダの場合
                if (r_obj.node.type === config.folderIcon || r_obj.node.type === "root") {
                    appFolder = creator + ' in ("' + kintone.getLoginUser().code + '") and selfFolderID = "' +
                    r_obj.node.original.self + '"';
                    appFlg = false;
                } else {
                    appFolder = creator + ' in ("' + kintone.getLoginUser().code +
                    '") and appID = "' + r_obj.node.original.appId + '"';
                }
                fetchRecords(event.appId, appFolder).then(function(renamePutRec) {
                    var body;
                    if (appFlg) {
                        body = {
                            "app": kintone.app.getId(),
                            "id": renamePutRec[0][recordNumber].value,
                            "record": {
                                "appName": {
                                    "value": r_obj.text
                                }
                            }
                        };
                    } else {
                        body = {
                            "app": kintone.app.getId(),
                            "id": renamePutRec[0][recordNumber].value,
                            "record": {
                                "folderName": {
                                    "value": r_obj.text
                                }
                            }
                        };
                    }
                    kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(renameResp) {
                        readyTree(event);
                    });
                });

            })
            .bind("delete_node.jstree", function(d_event, d_obj) {
                setLoading();
                // ルートの場合
                if (d_obj.node.type === "root") {
                    swal({
                        title: "ルートフォルダは削除できません。",
                        type: 'error'
                    }, function(ok) {
                        readyTree(event);
                    });
                } else if (d_obj.node.type === config.folderIcon) { // フォルダの場合
                    fetchRecords(kintone.app.getId(), creator + ' in ("' + kintone.getLoginUser().code +
                    '") and appSort >= "' + d_obj.node.original.appSort + '" order by appSort asc')
                    .then(function(deleteFolder) {
                        var delFolderId = [deleteFolder[0].$id.value];
                        for (var dfkey in deleteFolder) {
                            if (deleteFolder[dfkey].parentFolderID.value === d_obj.node.original.self) {
                                delFolderId.push(deleteFolder[dfkey].$id.value);
                            }
                        }
                        deleteRecords(kintone.app.getId(), delFolderId).then(function() {
                            if (deleteFolder.length > delFolderId.length) {
                                deleteFolder.splice(0, delFolderId.length);
                                var recCount = deleteFolder.length;
                                var putCount = Math.ceil(recCount / 100);
                                for (var i = 0; i < putCount; i++) {
                                    var offset = i * 100;
                                    var limit = 100;
                                    if (offset + limit > recCount) {
                                        limit = recCount - offset;
                                    }
                                    var putLimit = limit + offset;

                                    var editRecords = [];

                                    // 更新対象レコードに更新後のデータを上書き
                                    for (offset; offset < putLimit; offset++) {
                                        var record = $.extend(true, {}, deleteFolder[offset]);
                                        var recNo = record['$id'].value;
                                        delete record['$id'];
                                        delete record['$revision'];
                                        delete record[recordNumber];
                                        delete record[createTime];
                                        delete record[creator];
                                        delete record[updateTime];
                                        delete record[updator];
                                        record['appSort'].value = parseInt(record['appSort'].value, 10) -
                                        delFolderId.length;
                                        editRecords.push({
                                            'id': recNo,
                                            'record': record
                                        });
                                    }

                                    var finCnt = -1;
                                    if (recCount === offset) {
                                        finCnt = limit;
                                    }

                                    // 最後に更新処理
                                    kintone.api('/k/v1/records', 'PUT', {
                                        app: kintone.app.getId(),
                                        'records': editRecords
                                    }, function(moveUpResp) {
                                        if (finCnt !== -1 && finCnt === moveUpResp.records.length) {
                                            readyTree(event);
                                        }
                                    });
                                }
                            } else {
                                readyTree(event);
                            }
                        });

                    });
                } else { // アプリの場合
                    fetchRecords(kintone.app.getId(), creator + ' in ("' + kintone.getLoginUser().code +
                    '") and appSort >= "' + d_obj.node.original.appSort + '" order by appSort asc')
                    .then(function(deleteApp) {
                        var delAppId = [deleteApp[0].$id.value];
                        deleteRecords(kintone.app.getId(), delAppId).then(function() {
                            if (deleteApp.length > 1) {
                                deleteApp.splice(0, 1);
                                var recCount = deleteApp.length;
                                var putCount = Math.ceil(recCount / 100);
                                for (var i = 0; i < putCount; i++) {
                                    var offset = i * 100;
                                    var limit = 100;
                                    if (offset + limit > recCount) {
                                        limit = recCount - offset;
                                    }
                                    var putLimit = limit + offset;

                                    var editRecords = [];

                                    // 更新対象レコードに更新後のデータを上書き
                                    for (offset; offset < putLimit; offset++) {
                                        var record = $.extend(true, {}, deleteApp[offset]);
                                        var recNo = record['$id'].value;
                                        delete record['$id'];
                                        delete record['$revision'];
                                        delete record[recordNumber];
                                        delete record[createTime];
                                        delete record[creator];
                                        delete record[updateTime];
                                        delete record[updator];
                                        record['appSort'].value = parseInt(record['appSort'].value, 10) - 1;
                                        editRecords.push({
                                            'id': recNo,
                                            'record': record
                                        });
                                    }

                                    var finCnt = -1;
                                    if (recCount === offset) {
                                        finCnt = limit;
                                    }

                                    // 最後に更新処理
                                    kintone.api('/k/v1/records', 'PUT', {
                                        app: kintone.app.getId(),
                                        'records': editRecords
                                    }, function(moveUpResp) {
                                        if (finCnt !== -1 && finCnt === moveUpResp.records.length) {
                                            readyTree(event);
                                        }
                                    });
                                }
                            } else {
                                readyTree(event);
                            }
                        });
                    });
                }

            })
            .bind("move_node.jstree", function(m_event, m_obj) {
                setLoading();
                // 同じフォルダ内で移動した場合
                if (m_obj.old_parent === m_obj.parent) {
                    var fetchQuery;
                    var folderWithAppFlg = false;
                    // フォルダの場合
                    if (m_obj.node.type === config.folderIcon) {
                        fetchQuery = creator + ' in ("' + kintone.getLoginUser().code +
                        '") and selfFolderID = "' + m_obj.node.original.self + '"';
                        // 移動対象がアプリの紐づくフォルダかどうか
                        if (m_obj.node.children.length > 0) {
                            folderWithAppFlg = true;
                        }
                    } else {
                        fetchQuery = creator + ' in ("' + kintone.getLoginUser().code +
                        '") and appID = "' + m_obj.node.original.appId + '"';
                    }
                    fetchRecords(event.appId, fetchQuery).then(function(movePutRec) {
                        var moveNum = m_obj.position - m_obj.old_position;
                        var positionCount = 0;
                        var currentPosition = m_obj.position;
                        var oldPosition = m_obj.old_position;
                        // 上に移動
                        if (moveNum < 0) {
                            if (m_obj.parent.indexOf("_1") > 0) {
                            // 現在ポジションまでにフォルダがあるか
                                for (var ikey in folderInfo) {
                                    for (var m = currentPosition; m < oldPosition; m++) {
                                        if (m === parseInt(ikey, 10)) {
                                            if (folderWithAppFlg && folderInfo[ikey].length > 0 &&
                                                folderInfo[ikey][0].parentFolderID !== m_obj.node.original.self) {
                                                positionCount = folderInfo[ikey].length;
                                                moveNum -= positionCount;
                                                break;
                                            } else if (!folderWithAppFlg) {
                                                positionCount = folderInfo[ikey].length;
                                                moveNum -= positionCount;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (m_obj.parent.indexOf("_1") > 0) {
                                for (var ikey2 in folderInfo) {
                                    for (var m2 = oldPosition + 1; m2 < currentPosition + 1; m2++) {
                                        if (m2 === parseInt(ikey2, 10)) {
                                            positionCount = folderInfo[ikey2].length;
                                            moveNum += positionCount;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        var movedRecId = movePutRec[0][recordNumber].value;
                        var movedSortValue = parseInt(movePutRec[0].appSort.value, 10) + moveNum;
                        var moveBody = {
                            "app": kintone.app.getId(),
                            "id": movedRecId,
                            "record": {
                                "appSort": {
                                    "value": movedSortValue
                                }
                            }
                        };
                        kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', moveBody, function(moveResp) {
                            // 上に移動した場合
                            if (moveNum < 0) {
                                var moveQuery;
                                if (folderWithAppFlg) {
                                    moveQuery = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort >= "' + movedSortValue + '" and appSort <= "' +
                                    (parseInt(movePutRec[0].appSort.value, 10) + m_obj.node.children.length) +
                                    '" and ' + recordNumber + ' != "' + movedRecId + '" order by appSort asc';
                                } else if (positionCount === 0) {
                                    moveQuery = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort >= "' + movedSortValue + '" and appSort < "' +
                                    movePutRec[0].appSort.value + '" and ' + recordNumber + ' != "' + movedRecId +
                                    '" and parentFolderID = "' + m_obj.node.original.parentFolderID + '"';
                                } else {
                                    moveQuery = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort >= "' + movedSortValue + '" and appSort < "' +
                                    movePutRec[0].appSort.value + '" and ' + recordNumber + ' != "' + movedRecId + '"';
                                }
                                fetchRecords(event.appId, moveQuery).then(function(movePutOtherRecs) {
                                    if (folderWithAppFlg) {
                                        var appSortCnt = movedSortValue;
                                        for (var q = 0; q < movePutOtherRecs.length; q++) {
                                            if (movePutOtherRecs[q].parentFolderID.value === m_obj.node.original.self) {
                                                movePutOtherRecs[q].appSort.value = appSortCnt;
                                                appSortCnt++;
                                            } else {
                                                movePutOtherRecs[q].appSort.value =
                                                parseInt(movePutOtherRecs[q].appSort.value, 10) +
                                                m_obj.node.children.length;
                                            }
                                        }
                                    }
                                    var recCount = movePutOtherRecs.length;
                                    if (recCount !== 0) {
                                        var putCount = Math.ceil(recCount / 100);
                                        for (var i = 0; i < putCount; i++) {
                                            var offset = i * 100;
                                            var limit = 100;
                                            if (offset + limit > recCount) {
                                                limit = recCount - offset;
                                            }
                                            var putLimit = limit + offset;

                                            var editRecords = [];

                                            // 更新対象レコードに更新後のデータを上書き
                                            for (offset; offset < putLimit; offset++) {
                                                var record = $.extend(true, {}, movePutOtherRecs[offset]);
                                                var recNo = record['$id'].value;
                                                delete record['$id'];
                                                delete record['$revision'];
                                                delete record[recordNumber];
                                                delete record[createTime];
                                                delete record[creator];
                                                delete record[updateTime];
                                                delete record[updator];
                                                record['appSort'].value = parseInt(record['appSort'].value, 10) + 1;
                                                editRecords.push({
                                                    'id': recNo,
                                                    'record': record
                                                });
                                            }

                                            var finCnt = -1;
                                            if (recCount === offset) {
                                                finCnt = limit;
                                            }

                                            // 最後に更新処理
                                            kintone.api('/k/v1/records', 'PUT', {
                                                app: kintone.app.getId(),
                                                'records': editRecords
                                            }, function(moveUpResp) {
                                                if (finCnt !== -1 && finCnt === moveUpResp.records.length) {
                                                    readyTree(event);
                                                }
                                            });
                                        }
                                    } else {
                                        readyTree(event);
                                    }
                                });
                            } else {
                                var moveQuery2;
                                if (folderWithAppFlg) {
                                    moveQuery2 = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort <= "' + (movedSortValue + m_obj.node.children.length) +
                                    '" and appSort >= "' + m_obj.node.original.appSort +
                                    '" and ' + recordNumber + ' != "' + movedRecId + '" order by appSort asc';
                                } else if (positionCount === 0) {
                                    moveQuery2 = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort <= "' + movedSortValue + '" and appSort > "' +
                                    m_obj.node.original.appSort + '" and ' + recordNumber + ' != "' +
                                    movedRecId + '" and parentFolderID = "' + m_obj.node.original.parentFolderID + '"';
                                } else {
                                    moveQuery2 = creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort <= "' + movedSortValue + '" and appSort > "' +
                                    m_obj.node.original.appSort + '" and ' + recordNumber + ' != "' + movedRecId + '"';
                                }
                                fetchRecords(event.appId, moveQuery2).then(function(movePutOtherRecs) {
                                    if (movePutOtherRecs.length > 0) {
                                        if (folderWithAppFlg) {
                                            var appSortCnt = movedSortValue;
                                            for (var q = 0; q < movePutOtherRecs.length; q++) {
                                                if (movePutOtherRecs[q].parentFolderID.value ===
                                                m_obj.node.original.self) {
                                                    movePutOtherRecs[q].appSort.value = (appSortCnt + 2);
                                                    appSortCnt++;
                                                } else {
                                                    movePutOtherRecs[q].appSort.value =
                                                    parseInt(movePutOtherRecs[q].appSort.value, 10) -
                                                    m_obj.node.children.length;
                                                }
                                            }
                                        }
                                        var recCount = movePutOtherRecs.length;
                                        var putCount = Math.ceil(recCount / 100);
                                        for (var i = 0; i < putCount; i++) {
                                            var offset = i * 100;
                                            var limit = 100;
                                            if (offset + limit > recCount) {
                                                limit = recCount - offset;
                                            }
                                            var putLimit = limit + offset;

                                            var editRecords = [];

                                            // 更新対象レコードに更新後のデータを上書き
                                            for (offset; offset < putLimit; offset++) {
                                                var record = $.extend(true, {}, movePutOtherRecs[offset]);
                                                var recNo = record['$id'].value;
                                                delete record['$id'];
                                                delete record['$revision'];
                                                delete record[recordNumber];
                                                delete record[createTime];
                                                delete record[creator];
                                                delete record[updateTime];
                                                delete record[updator];
                                                record['appSort'].value = parseInt(record['appSort'].value, 10) - 1;
                                                editRecords.push({
                                                    'id': recNo,
                                                    'record': record
                                                });
                                            }

                                            var finCnt = -1;
                                            if (recCount === offset) {
                                                finCnt = limit;
                                            }

                                            // 最後に更新処理
                                            kintone.api('/k/v1/records', 'PUT', {
                                                app: kintone.app.getId(),
                                                'records': editRecords
                                            }, function(moveDownResp) {
                                                if (finCnt !== -1 && finCnt === moveDownResp.records.length) {
                                                    readyTree(event);
                                                }
                                            });
                                        }
                                    } else {
                                        readyTree(event);
                                    }
                                });

                            }
                        });
                    });
                } else { // 別フォルダに移動させた場合
                    var parentSortNum = m_obj.parent.split("_");
                    if (parentSortNum[1] === "1") {
                        parentSortNum = "";
                    } else {
                        parentSortNum = parseInt(parentSortNum[1], 10) - 2;
                    }
                    fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code +
                    '") and appSort = "' + parentSortNum + '"').then(function(moveOtherFolderParentRec) {


                        var upFlg;
                        var folderDownFlg = false;
                        var chNodeCnt2 = 0;
                        // 下へ移動した場合
                        if (parseInt(moveOtherFolderParentRec[0].appSort.value, 10) >
                        parseInt(m_obj.node.original.appSort, 10)) {
                            upFlg = false;
                        } else if (moveOtherFolderParentRec[0].selfFolderID.value === "j1_1") {
                            for (var ikey3 in folderInfo) {
                                for (var n = 0; n < m_obj.position; n++) {
                                    if (n === parseInt(ikey3, 10)) {
                                        for (var o = 0; o < folderInfo[ikey3].length; o++) {
                                            if (folderInfo[ikey3][o].parentFolderID ===
                                            m_obj.node.original.parentFolderID) {
                                                if (folderInfo[ikey3][o].appSort !== m_obj.node.original.appSort) {
                                                    chNodeCnt2++;
                                                }
                                            } else {
                                                chNodeCnt2 += folderInfo[ikey3].length;
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            if (m_obj.position + chNodeCnt2 >= m_obj.node.original.appSort) {
                                upFlg = false;
                                folderDownFlg = true;
                            } else {
                                upFlg = true;
                            }

                        } else {
                            upFlg = true;
                        }
                        var fetchQuery2 = creator + ' in ("' + kintone.getLoginUser().code +
                        '") and appID = "' + m_obj.node.original.appId + '"';
                        fetchRecords(event.appId, fetchQuery2).then(function(moveOtherFolderSelfRec) {
                            var appSortValue;
                            if (upFlg) {
                                // 作成フォルダからルートフォルダに下から上に移動した場合
                                if (moveOtherFolderParentRec[0].selfFolderID.value === "j1_1") {
                                    var chNodeCnt = 0;
                                    for (var ikey4 in folderInfo) {
                                        for (var m3 = 0; m3 < m_obj.position; m3++) {
                                            if (m3 === parseInt(ikey4, 10)) {
                                                chNodeCnt += folderInfo[ikey4].length;
                                                break;
                                            }
                                        }
                                    }

                                    appSortValue = m_obj.position + chNodeCnt;
                                } else {
                                    appSortValue = parseInt(moveOtherFolderParentRec[0].appSort.value, 10) +
                                    m_obj.position + 1;
                                }
                            } else if (folderDownFlg) {
                                appSortValue = m_obj.position + chNodeCnt2;
                            } else {
                                appSortValue = parseInt(moveOtherFolderParentRec[0].appSort.value, 10) + m_obj.position;
                            }
                            var movedOtherFolderRecId = moveOtherFolderSelfRec[0][recordNumber].value;
                            var moveOtherFolderBody = {
                                "app": kintone.app.getId(),
                                "id": movedOtherFolderRecId,
                                "record": {
                                    "appSort": {
                                        "value": appSortValue
                                    },
                                    "parentFolderID": {
                                        "value": moveOtherFolderParentRec[0].selfFolderID.value
                                    }
                                }
                            };
                            kintone.api(kintone.api.url('/k/v1/record', true), 'PUT',
                            moveOtherFolderBody, function(moveOtherFolderResp) {
                                // 上に移動した場合
                                if (upFlg) {
                                    fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort >= "' + appSortValue + '" and appSort < "' +
                                    m_obj.node.original.appSort + '" and ' + recordNumber + ' != "' +
                                    movedOtherFolderRecId + '"').then(function(moveOtherFolderRecs) {
                                        var recCount = moveOtherFolderRecs.length;
                                        if (recCount !== 0) {
                                            var putCount = Math.ceil(recCount / 100);
                                            for (var i = 0; i < putCount; i++) {
                                                var offset = i * 100;
                                                var limit = 100;
                                                if (offset + limit > recCount) {
                                                    limit = recCount - offset;
                                                }
                                                var putLimit = limit + offset;

                                                var editRecords = [];

                                                // 更新対象レコードに更新後のデータを上書き
                                                for (offset; offset < putLimit; offset++) {
                                                    var record = $.extend(true, {}, moveOtherFolderRecs[offset]);
                                                    var recNo = record['$id'].value;
                                                    delete record['$id'];
                                                    delete record['$revision'];
                                                    delete record[recordNumber];
                                                    delete record[createTime];
                                                    delete record[creator];
                                                    delete record[updateTime];
                                                    delete record[updator];
                                                    record['appSort'].value = parseInt(record['appSort'].value, 10) + 1;
                                                    editRecords.push({
                                                        'id': recNo,
                                                        'record': record
                                                    });
                                                }

                                                var finCnt = -1;
                                                if (recCount === offset) {
                                                    finCnt = limit;
                                                }

                                                // 最後に更新処理
                                                kintone.api('/k/v1/records', 'PUT', {
                                                    app: kintone.app.getId(),
                                                    'records': editRecords
                                                }, function(moveUpResp) {
                                                    if (finCnt !== -1 && finCnt === moveUpResp.records.length) {
                                                        readyTree(event);
                                                    }
                                                });
                                            }
                                        } else {
                                            readyTree(event);
                                        }
                                    });
                                } else {
                                    fetchRecords(event.appId, creator + ' in ("' + kintone.getLoginUser().code +
                                    '") and appSort <= "' + appSortValue + '" and appSort > "' +
                                    m_obj.node.original.appSort + '" and ' + recordNumber + ' != "' +
                                    movedOtherFolderRecId + '"').then(function(movePutOtherFolderRecs) {
                                        var recCount = movePutOtherFolderRecs.length;
                                        if (recCount !== 0) {
                                        var putCount = Math.ceil(recCount / 100);
                                            for (var i = 0; i < putCount; i++) {
                                                var offset = i * 100;
                                                var limit = 100;
                                                if (offset + limit > recCount) {
                                                    limit = recCount - offset;
                                                }
                                                var putLimit = limit + offset;

                                                var editRecords = [];

                                                // 更新対象レコードに更新後のデータを上書き
                                                for (offset; offset < putLimit; offset++) {
                                                    var record = $.extend(true, {}, movePutOtherFolderRecs[offset]);
                                                    var recNo = record['$id'].value;
                                                    delete record['$id'];
                                                    delete record['$revision'];
                                                    delete record[recordNumber];
                                                    delete record[createTime];
                                                    delete record[creator];
                                                    delete record[updateTime];
                                                    delete record[updator];
                                                    record['appSort'].value = parseInt(record['appSort'].value, 10) - 1;
                                                    editRecords.push({
                                                        'id': recNo,
                                                        'record': record
                                                    });
                                                }

                                                var finCnt = -1;
                                                if (recCount === offset) {
                                                    finCnt = limit;
                                                }

                                                // 最後に更新処理
                                                kintone.api('/k/v1/records', 'PUT', {
                                                    app: kintone.app.getId(),
                                                    'records': editRecords
                                                }, function(moveDownResp) {
                                                    if (finCnt !== -1 && finCnt === moveDownResp.records.length) {
                                                        readyTree(event);
                                                    }
                                                });
                                            }
                                        } else {
                                            readyTree(event);
                                        }
                                    });
                                }
                            });
                        });

                    });
                }
                $(this).jstree("open_all");
            });
        $('#folderCreate').click(function() {
            $('#tree').jstree("deselect_all");
            $('#tree').jstree('select_node', 'ul > li:first');
            var ref = $('#tree').jstree(true),
                sel = ref.get_selected();
            if (!sel.length) {
                return false;
            }
            var newFolder = "新規フォルダ";
            if (config.lang === "zh") {
                newFolder = "新规文件夹";
            } else if (config.lang === "en") {
                newFolder = "New folder";
            }
            sel = sel[0];
            sel = ref.create_node(sel, {
                "text": newFolder,
                class: "jstree-open",
                "type": folderIcon
            }, "first");
            if (sel) {
                ref.edit(sel);
            }
        });
        $('#returnDefault').click(function() {
            var title = "一覧をすべて初期化しますか？";
            var yes = "はい";
            var no = "いいえ";
            if (config.lang === "zh"){
                title = "回复初期状态一览吗？";
                yes = "是";
                no = "不";
            } else if (config.lang === "en") {
                title = "Reset index?";
                yes = "YES";
                no = "NO";
            }
            swal({
                title: title,
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: no,
                confirmButtonText: yes

            }, function(isConfirm) {
                if (isConfirm) {
                    setLoading();
                    fetchRecords(kintone.app.getId(), creator + ' in ("' +
                    kintone.getLoginUser().code + '")').then(function(deleteRecs) {
                        var delIds = [];
                        $.each(deleteRecs, function(key, row) {
                            delIds.push(row.$id.value);
                        });
                        if (delIds.length > 0) {
                            deleteRecords(kintone.app.getId(), delIds).then(function() {
                                readyTree(event);
                            });
                        }
                    });
                }
            });
        });
    }

    kintone.events.on(['app.record.index.show'], function(event) {
        if (!config || String(event.viewId) !== config.viewId) {
            return false;
        }

        // アプリ一覧の場合のみpaddingを変更
        $(".box-gaia").css("padding", "0px 150px");
        readyTree(event);

        return event;
    });

})(jQuery, kintone.$PLUGIN_ID);
