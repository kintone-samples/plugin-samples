/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */

(function(pluginId) {
  'use strict';

  const APPID = kintone.mobile.app.getId();
  const config = kintone.plugin.app.getConfig(pluginId);
  const VOTE_FIELD = config.vote_field;
  const VOTE_COUNT_FIELD = config.vote_count_field;


  const Msg = {
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

  const NotifyPopup = {
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
      const popup = document.createElement('div');
      popup.className = 'customization-notify error';

      const notifyTitle = document.createElement('div');
      notifyTitle.className = 'notify-title';

      const closeButton = document.createElement('div');
      closeButton.className = 'close-button';

      const closeButtonIcon = document.createElement('div');
      closeButtonIcon.className = 'close-button-icon';

      const icon1 = document.createElement('div');
      icon1.className = 'icon-1';

      const icon2 = document.createElement('div');
      icon2.className = 'icon-2';

      icon1.appendChild(icon2);
      closeButtonIcon.appendChild(icon1);
      closeButton.appendChild(closeButtonIcon);
      popup.appendChild(notifyTitle);
      popup.appendChild(closeButton);

      this.control.popup = popup;
      document.body.appendChild(this.control.popup);

      this.bindEvent();

      return this.control.popup;
    },
    showPopup: function(message) {
      this.control.popup.querySelector('.notify-title').textContent = message;

      const popupWidth = this.control.popup.offsetWidth;
      this.control.popup.style.left = '-' + popupWidth / 2 + 'px';

      this.control.popup.classList.add('notify-slidedown');
    },
    hidePopup: function() {
      this.control.popup.classList.remove('notify-slidedown');
    },
    bindEvent: function() {
      this.control.popup.addEventListener('click', () => {
        this.hidePopup();
      });
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

  function VoteModel(record, language) {
    const recordId = Number(record.$id.value);
    let voteUsers = record[VOTE_FIELD].value;
    let revision = Number(record.$revision.value);

    function createErrorMessage(e) {
      let message;
      switch (e.code) {
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
      message += '(id:' + e.id + ', code:' + e.code + ')';
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
        return voteUsers.filter((user) => {
          return user.code === kintone.getLoginUser().code;
        }).length !== 0;
      },
      toggleLoginUser: function() {
        const that = this;
        const promise = this.fetch().then(() => {
          if (that.isLoginUserVoted()) {
            voteUsers = voteUsers.filter((user) => {
              return user.code !== kintone.getLoginUser().code;
            });
          } else {
            voteUsers.push({
              'code': kintone.getLoginUser().code
            });
          }
        }).then(() => {
          return that.update();
        });
        return promise;
      },
      fetch: function() {
        return new Promise((resolve) => {
          kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
            'app': APPID,
            'id': recordId
          }, (evt) => {
            voteUsers = evt.record[VOTE_FIELD].value;
            revision = evt.record.$revision.value;
            resolve();
          });
        });
      },
      update: function() {
        return new Promise((resolve, reject) => {
          const newRecord = {};
          newRecord[VOTE_FIELD] = {'value': voteUsers};
          newRecord[VOTE_COUNT_FIELD] = {'value': voteUsers.length};
          kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
            'app': APPID,
            'id': recordId,
            'record': newRecord,
            'revision': revision
          }, resolve, (e) => {
            NotifyPopup.showPopup(createErrorMessage(e));
            reject(e);
          });
        });
      }
    };
  }

  function fetchVoteModel(language) {
    return new Promise((resolve) => {
      const id = kintone.mobile.app.record.getId();
      kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
        'app': APPID,
        'id': id
      }, (evt) => {
        const record = {
          '$id': {'value': id},
          '$revision': evt.record.$revision
        };
        record[VOTE_FIELD] = evt.record[VOTE_FIELD];
        resolve(new VoteModel(record, language));
      });
    });
  }


  function VoteView(model) {
    const $element = document.createElement('span');
    $element.className = 'vote-plugin-show';
    let clickable = true;

    function updateImg(voted) {
      $element.querySelector('.vote-plugin-img').classList.toggle('vote-plugin-voted', voted);
    }

    function updateCounterEl(usercount) {
      $element.querySelector('.vote-plugin-count')?.remove();
      if (usercount !== 0) {
        const span = document.createElement('span');
        span.classList.add('vote-plugin-count');
        span.textContent = usercount;
        $element.appendChild(span);
      }
    }

    function handleClick() {
      if (!clickable) {
        return;
      }
      clickable = false;
      model.toggleLoginUser().then(() => {
        updateImg(model.isLoginUserVoted());
        updateCounterEl(model.countVoteUsers());
        clickable = true;
      }).catch(() => {
        clickable = true;
      });
    }

    function renderImgAndCounter() {
      // createImg
      const $imgEl = document.createElement('span');
      $imgEl.className = 'vote-plugin-img';
      $element.appendChild($imgEl);
      updateImg(model.isLoginUserVoted());

      // createCounter
      updateCounterEl(model.countVoteUsers());

      $element.addEventListener('click', handleClick);
    }

    return {
      append: function($parentEl) {
        $parentEl.appendChild($element);
        renderImgAndCounter();
      },

      prepend: function($parentEl) {
        $parentEl.prepend($element);
        renderImgAndCounter();
      }
    };
  }

  kintone.events.on(['mobile.app.record.create.show', 'mobile.app.record.edit.show'], (evt) => { // 'app.record.index.edit.show'
    const record = evt.record;
    const users = record[VOTE_FIELD].value;
    if (evt.reuse) {
      for (let i = 0; i < users.length; i++) {
        record[VOTE_FIELD].value = [];
      }
      record[VOTE_COUNT_FIELD].value = '';
    } else {
      record[VOTE_FIELD].disabled = true;
      record[VOTE_COUNT_FIELD].disabled = true;
    }
    return evt;
  });

  kintone.events.on('mobile.app.record.detail.show', (appId, record, recordId) => {
    const loginInfo = kintone.getLoginUser();
    const lang = getLanguage(loginInfo.language);

    NotifyPopup.createPopup();

    fetchVoteModel(lang).then((voteModel) => {
      const $labelEl = kintone.mobile.app.getHeaderSpaceElement();
      new VoteView(voteModel).prepend($labelEl);
    });
  });

})(kintone.$PLUGIN_ID);
