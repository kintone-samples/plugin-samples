jQuery.noConflict();

(function(pluginId, $) {
    "use strict";

    var APPID = kintone.app.getId();
    var config = kintone.plugin.app.getConfig(pluginId);
    var VOTE_FIELD = config['vote_field'];
    var VOTE_COUNT_FIELD = config['vote_count_field'];
    var VOTE_EL_WIDTH = 26;

    kintone.events.on(['app.record.create.show', 'app.record.index.edit.show', 'app.record.edit.show'], function(evt) {
        var record = evt['record'];
        record[VOTE_FIELD]['disabled'] = true;
        record[VOTE_COUNT_FIELD]['disabled'] = true;
        return evt;
    });

    kintone.events.on('app.record.index.show', function() {
        fetchVoteModels().then(function(voteModels) {
　　　　　　　　　　　　var cellEls = $('.recordlist-show-gaia').parent();
            cellEls.each(function() {
                var recordId = Number($(this).children('.recordlist-show-gaia').attr('href').match('record=([0-9]+)')[1]);
                var voteModel = $.grep(voteModels, function(voteModel) {
                    return voteModel.getRecordId() === recordId;
                })[0];

                if(voteModel !== null) {
                    new VoteView(voteModel).append($(this));
                }
            });
        }).then(function() {
            resizeTable();
        });
    });

    kintone.events.on('app.record.detail.show', function(appId, record, recordId) {
        fetchVoteModel().then(function(voteModel) {
            var $labelEl = $(kintone.app.record.getFieldElement(VOTE_FIELD)).parent().find('.control-label-gaia');
            $labelEl.addClass('vote-control-label');
            new VoteView(voteModel).append($labelEl);
        });
    });

    function fetchVoteModel() {
        var d = new $.Deferred;
        var id = kintone.app.record.getId();
        kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
            'app': APPID,
            'id': id
        }, function(evt) {
            var record = {
                '$id': { 'value' : id },
                '$revision': evt['record']['$revision']
            };
            record[VOTE_FIELD] = evt['record'][VOTE_FIELD];
            d.resolve(new VoteModel(record));
        });
        return d.promise();
    }

    function fetchVoteModels() {
        var d = new $.Deferred;

        var rawQuery = kintone.app.getQuery().match(/(.*)(limit .+)/);
        var query;
        if (rawQuery[1] === '') {
            query = 'order by 作成日時 desc ' + rawQuery[2];
        } else {
            query = rawQuery[1] + ', 作成日時 desc ' + rawQuery[2];
        }

        kintone.api('/k/v1/records', 'GET', {
            'app': APPID,
            'query': query,
            'fields': ['$id', VOTE_FIELD, '$revision']
        }, function(evt) {
            var models = [];
            $.each(evt['records'], function(i, record) {
                var model = new VoteModel(record);
                models.push(model);
            });
            d.resolve(models);
        });
        return d.promise();
    }

    function VoteModel(record) {
        var recordId = Number(record['$id']['value']);
        var voteUsers = record[VOTE_FIELD]['value'];
        var revision = Number(record['$revision']['value']);

        function createErrorMessage(e) {
            var message;
            switch(e['code']) {
                case 'GAIA_CO02':
                    message = 'いいね中に誰かがレコードを更新しました。もう一度いいねしてください。';
                    break;
                case 'CB_NO02':
                    message = 'レコード編集権限がないユーザはいいねできません。アプリ管理者にお問い合わせ下さい。';
                    break;
                default:
                    message = 'エラーが発生しました。アプリ管理者にお問い合わせ下さい。';
                    break;
            }
            message += '(id:' + e['id'] + ', code:' + e['code']+')';
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
                        voteUsers = $.grep(voteUsers, function(user){
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
                var d = new $.Deferred;
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
                var d = new $.Deferred;
                var record = {};
                record[VOTE_FIELD] = {'value': voteUsers};
                record[VOTE_COUNT_FIELD] = {'value': voteUsers.length};
                kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
                    'app': APPID,
                    'id': recordId,
                    'record': record,
                    'revision': revision
                }, d.resolve , function(e) {
                    alert(createErrorMessage(e));
                });
                return d.promise();
            }
        };
    }

    function VoteView(model) {
        var $element = $('<span class="vote-plugin-show">');
        var clickable = true;

        function handleClick() {
            if(!clickable) {
                return;
            }
            clickable = false;
            model.toggleLoginUser().then(function() {
                updateImg(model.isLoginUserVoted());
                updateCounterEl(model.countVoteUsers());
                clickable = true;
            });
        }

        function updateImg(voted) {
            $element.find('.vote-plugin-img').toggleClass('vote-plugin-voted', voted);
        }

        function updateCounterEl(usercount) {
            $element.find('.vote-plugin-count').remove();
            if (usercount !== 0) {
                $element.append($('<span>').addClass('vote-plugin-count').text(usercount));
            }
        }

        function renderImgAndCounter() {
            // createImg
            var $imgEl = $('<span class="vote-plugin-img">');
            $element.append($imgEl);
            updateImg(model.isLoginUserVoted());

            // createCounter
            updateCounterEl(model.countVoteUsers());

            $element.click(handleClick);
        }

        return {
            append: function($parentEl) {
                $parentEl.append($element);
                renderImgAndCounter();
            }
        };
    }

    /**
     * いいねを表示する列の幅を広げ、一番幅が広い列の幅を狭める
     */
    function resizeTable() {
        var controlTh = $('.recordlist-gaia > thead > th:first-child');
        controlTh.width(controlTh.width() + VOTE_EL_WIDTH);
        var largestTh;
        var width = 0;
        $('.recordlist-gaia > thead > th').not(':first-child').each(function() {
            if ($(this).width() > width) {
                largestTh = $(this);
                width = $(this).width();
            }
        });
        largestTh && largestTh.width(width - VOTE_EL_WIDTH);
    }
})(kintone.$PLUGIN_ID, jQuery);

