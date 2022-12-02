/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function(pluginId, $) {
    'use strict';

    var APPID = kintone.app.getId();
    var config = kintone.plugin.app.getConfig(pluginId);
    var VOTE_FIELD = config['vote_field'];
    var VOTE_COUNT_FIELD = config['vote_count_field'];

    var Msg = {
        en: {
            recordNumFieldNotFound: 'To use the Like Plug-in, the Record number field must be set in the Form edit settings.',
            updatedWhileClicking: 'Someone updated the record while you were clicking "Like".'
                                    + ' Please click the "Like" button again.',
            notHavePermissionToEdit: 'Users who do not have permission to edit the record'
                                    + ' cannot click the "Like" button.'
                                    + ' Please contact the Administrator of this App to resolve this issue.',
            errorOccurred: 'An error occurred. Please contact the Administrator of this App to resolve this issue.'
        },
        ja: {
            recordNumFieldNotFound: 'いいねプラグインを使うためには、フォーム編集画面でレコード番号フィールドを配置する必要があります。',
            updatedWhileClicking: 'いいね中に誰かがレコードを更新しました。もう一度いいねしてください。',
            notHavePermissionToEdit: 'レコード編集権限がないユーザはいいねできません。アプリ管理者にお問い合わせ下さい。',
            errorOccurred: 'エラーが発生しました。アプリ管理者にお問い合わせ下さい。'
        },
        zh: {
            recordNumFieldNotFound: '未找到记录编号字段。需要在表单中设置记录编号字段才可使用顶！插件。',
            updatedWhileClicking: '在点顶的同时有其他人更新了记录，请再点一次。',
            notHavePermissionToEdit: '无记录编辑权限的用户不可以点顶。详情请咨询应用管理员。',
            errorOccurred: '出错了！详情请咨询应用管理员。'
        }
    };

    var NotifyPopup = {
        control: {
            popup: null
        },
        template: '<div class="customization-notify error">'
                  + '    <div class="notify-title"></div>'
                  + '    <div class= "close-button">'
                  + '        <div class="close-button-icon">'
                  + '            <div class="icon-1"><div class="icon-2"></div></div>'
                  + '        </div>'
                  + '    </div>'
                  + '</div>',
        createPopup: function() {
            this.control.popup = $(this.template);
            $('body').append(this.control.popup[0]);

            this.bindEvent();

            return this.control.popup;
        },
        showPopup: function(message) {
            this.control.popup.find('.notify-title').text(message);

            var popupWidth = this.control.popup.width();
            this.control.popup.css({left: '-' + popupWidth / 2 + 'px'});

            this.control.popup.addClass('notify-slidedown');
        },
        hidePopup: function() {
            this.control.popup.removeClass('notify-slidedown');
        },
        bindEvent: function() {
            this.control.popup.click(function() {
                this.hidePopup();
            }.bind(this));
        }
    };

    function getLanguage(lang) {
        switch (lang) {
            case 'ja':
                return 'ja';
            case 'en':
                return 'en';
            case 'zh':
                return 'zh';
            default:
                return 'en';
        }
    }

    function getRecordNumberFieldCode(fields) {
        var code = '';
        $.each(fields, function(fieldCode, value) {
            if (value.type === 'RECORD_NUMBER') {
                code = fieldCode;
                return true;
            }
        });
        return code;
    }

    function VoteModel(record, language) {
        var recordId = Number(record['$id']['value']);
        var voteUsers = record[VOTE_FIELD]['value'];
        var revision = Number(record['$revision']['value']);

        function createErrorMessage(e) {
            var message;
            switch (e['code']) {
                case 'GAIA_CO02':
                    message = Msg[language].updatedWhileClicking;
                    break;
                case 'CB_NO02':
                    message = Msg[language].notHavePermissionToEdit;
                    break;
                default:
                    message = Msg[language].errorOccurred;
                    break;
            }
            message += '(id:' + e['id'] + ', code:' + e['code'] + ')';
            return message;
        }

        return {
            getRecordId: function() {
                return recordId;
            },
            getVoteUsers: function() {
                return voteUsers;
            },
            getRevision: function() {
                return revision;
            },
            countVoteUsers: function() {
                return voteUsers.length;
            },
            isLoginUserVoted: function() {
                return $.grep(voteUsers, function(user) {
                    return user['code'] === kintone.getLoginUser().code;
                }).length !== 0;
            },
            toggleLoginUser: function() {
                var that = this;
                var promise = this.fetch().then(function() {
                    if (that.isLoginUserVoted()) {
                        voteUsers = $.grep(voteUsers, function(user) {
                            return user['code'] !== kintone.getLoginUser().code;
                        });
                    } else {
                        voteUsers.push({
                            'code': kintone.getLoginUser().code
                        });
                    }
                }).then(function() {
                    return that.update();
                });
                return promise;
            },
            fetch: function() {
                var d = new $.Deferred();
                kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
                    'app': APPID,
                    'id': recordId
                }, function(evt) {
                    voteUsers = evt['record'][VOTE_FIELD]['value'];
                    revision = evt['record']['$revision']['value'];
                    d.resolve();
                });
                return d.promise();
            },
            update: function() {
                var d = new $.Deferred();
                var newRecord = {};
                newRecord[VOTE_FIELD] = {'value': voteUsers};
                newRecord[VOTE_COUNT_FIELD] = {'value': voteUsers.length};
                kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
                    'app': APPID,
                    'id': recordId,
                    'record': newRecord,
                    'revision': revision
                }, d.resolve, function(e) {
                    NotifyPopup.showPopup(createErrorMessage(e));
                });
                return d.promise();
            }
        };
    }

    function fetchVoteModel(language) {
        var d = new $.Deferred();
        var id = kintone.app.record.getId();
        kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
            'app': APPID,
            'id': id
        }, function(evt) {
            var record = {
                '$id': { 'value': id },
                '$revision': evt['record']['$revision']
            };
            record[VOTE_FIELD] = evt['record'][VOTE_FIELD];
            d.resolve(new VoteModel(record, language));
        });
        return d.promise();
    }

    function fetchVoteModels(language) {
        var d = new $.Deferred();

        var query = kintone.app.getQuery();

        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
            'app': APPID,
            'query': query,
            'fields': ['$id', VOTE_FIELD, '$revision']
        }, function(evt) {
            var models = [];
            $.each(evt['records'], function(i, record) {
                var model = new VoteModel(record, language);
                models.push(model);
            });
            d.resolve(models);
        });
        return d.promise();
    }

    function VoteView(model) {
        var $element = $('<button type="button" class="vote-plugin-show">');
        var clickable = true;

        function updateImg(voted) {
            $element.find('.vote-plugin-img').toggleClass('vote-plugin-voted', voted);
        }

        function updateButtonLabel(usercount, voted){
            var countText = usercount + '人のいいね。';
            var votedText = voted ? 'いいねしました' : 'いいねする';
            $element.attr('aria-label', countText + votedText);

        }
        function updateCounterEl(usercount) {
            $element.find('.vote-plugin-count').remove();
            if (usercount !== 0) {
                $element.append($('<span>').addClass('vote-plugin-count').text(usercount));
            }
        }

        function handleClick() {
            if (!clickable) {
                return;
            }
            clickable = false;
            model.toggleLoginUser().then(function() {
                updateImg(model.isLoginUserVoted());
                updateButtonLabel(model.countVoteUsers(), model.isLoginUserVoted());
                updateCounterEl(model.countVoteUsers());
                clickable = true;
            });
        }

        function renderImgAndCounter() {
            // createImg
            var $imgEl = $('<span class="vote-plugin-img">');
            $element.append($imgEl);
            updateImg(model.isLoginUserVoted());

            // createCounter
            updateButtonLabel(model.countVoteUsers(), model.isLoginUserVoted());
            updateCounterEl(model.countVoteUsers());

            $element.click(handleClick);
        }

        return {
            append: function($parentEl) {
                $parentEl.append($element);
                renderImgAndCounter();
            },

            prepend: function($parentEl) {
                $parentEl.prepend($element);
                renderImgAndCounter();
            }
        };
    }

    kintone.events.on(['app.record.create.show', 'app.record.index.edit.show', 'app.record.edit.show'], function(evt) {
        var record = evt['record'];
        var users = record[VOTE_FIELD].value;
        if (evt.reuse) {
            for (var i = 0; i < users.length; i++) {
                record[VOTE_FIELD].value = [];
            }
            record[VOTE_COUNT_FIELD].value = '';
        } else {
            record[VOTE_FIELD]['disabled'] = true;
            record[VOTE_COUNT_FIELD]['disabled'] = true;
        }
        return evt;
    });

    kintone.events.on('app.record.index.show', function(event) {
        if (event.records.length === 0) {
            return event;
        }

        var loginInfo = kintone.getLoginUser();
        var lang = getLanguage(loginInfo.language);

        NotifyPopup.createPopup();

        var RECORD_FIELD = getRecordNumberFieldCode(event.records[0]);
        fetchVoteModels().then(function(voteModels) {
            var cellEls = $(kintone.app.getFieldElements(RECORD_FIELD));
            cellEls.each(function() {
                var recordId = Number($(this).text().split('-').pop());
                var voteModel = $.grep(voteModels, function(elem) {
                    return elem.getRecordId() === recordId;
                })[0];

                if (voteModel !== null) {
                    var $parentEl = $(this).find('*').contents().filter(function() {
                        return this.nodeType === 3;
                    }).parent();
                    new VoteView(voteModel).append($parentEl);
                }
            });
        }).fail(function(mess) {
            var error = mess.error;
            NotifyPopup.showPopup(Msg[lang][error]);
        });
    });

    kintone.events.on('app.record.detail.show', function(appId, record, recordId) {
        var loginInfo = kintone.getLoginUser();
        var lang = getLanguage(loginInfo.language);

        NotifyPopup.createPopup();

        fetchVoteModel(lang).then(function(voteModel) {
            var $labelEl = $(kintone.app.record.getFieldElement(VOTE_FIELD));
            new VoteView(voteModel).prepend($labelEl);
        });
    });

})(kintone.$PLUGIN_ID, jQuery);
