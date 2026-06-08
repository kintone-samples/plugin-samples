/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
(function(pluginId) {
  'use strict';

  const APPID = kintone.app.getId();
  const config = kintone.plugin.app.getConfig(pluginId);
  const VOTE_FIELD = config.vote_field;
  const VOTE_COUNT_FIELD = config.vote_count_field;

  const Msg = {
    en: {
      recordNumFieldNotFound: 'To use the Like Plug-in on the record list,'
                                    + ' the Record number field must be included in the list view display fields.',
      updatedWhileClicking: 'Someone updated the record while you were clicking "Like".'
                                    + ' Please click the "Like" button again.',
      notHavePermissionToEdit: 'Users who do not have permission to edit the record'
                                    + ' cannot click the "Like" button.'
                                    + ' Please contact the Administrator of this App to resolve this issue.',
      errorOccurred: 'An error occurred. Please contact the Administrator of this App to resolve this issue.'
    },
    ja: {
      recordNumFieldNotFound: 'いいねプラグインを一覧で使うためには、一覧の表示フィールドにレコード番号を含める必要があります。',
      updatedWhileClicking: 'いいね中に誰かがレコードを更新しました。もう一度いいねしてください。',
      notHavePermissionToEdit: 'レコード編集権限がないユーザはいいねできません。アプリ管理者にお問い合わせ下さい。',
      errorOccurred: 'エラーが発生しました。アプリ管理者にお問い合わせ下さい。'
    },
    zh: {
      recordNumFieldNotFound: '要在记录列表中使用顶！插件，需在列表的显示字段中包含记录编号字段。',
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
    createPopup: function(e) {
      const tpl = document.createElement('template');
      tpl.innerHTML = this.template;
      this.control.popup = tpl.content.firstElementChild;
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
      const self = this;
      this.control.popup.addEventListener('click', function() {
        self.hidePopup();
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

  function getRecordNumberFieldCode(fields) {
    let code = '';
    for (const [fieldCode, value] of Object.entries(fields)) {
      if (value.type === 'RECORD_NUMBER') {
        code = fieldCode;
        break;
      }
    }
    return code;
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
      toggleLoginUser: async function() {
        await this.fetch();
        if (this.isLoginUserVoted()) {
          voteUsers = voteUsers.filter((user) => {
            return user.code !== kintone.getLoginUser().code;
          });
        } else {
          voteUsers.push({
            'code': kintone.getLoginUser().code
          });
        }
        await this.update();
      },
      fetch: async function() {
        const evt = await kintone.api(
          kintone.api.url('/k/v1/record', true),
          'GET',
          {
            'app': APPID,
            'id': recordId
          }
        );
        voteUsers = evt.record[VOTE_FIELD].value;
        revision = evt.record.$revision.value;
      },
      update: async function() {
        const newRecord = {};
        newRecord[VOTE_FIELD] = {'value': voteUsers};
        newRecord[VOTE_COUNT_FIELD] = {'value': voteUsers.length};
        try {
          await kintone.api(
            kintone.api.url('/k/v1/record', true),
            'PUT',
            {
              'app': APPID,
              'id': recordId,
              'record': newRecord,
              'revision': revision
            }
          );
        } catch (e) {
          NotifyPopup.showPopup(createErrorMessage(e));
          throw e;
        }
      }
    };
  }

  async function fetchVoteModel(language) {
    const id = kintone.app.record.getId();
    const evt = await kintone.api(
      kintone.api.url('/k/v1/record', true),
      'GET',
      {
        'app': APPID,
        'id': id
      }
    );
    const record = {
      '$id': {'value': id},
      '$revision': evt.record.$revision
    };
    record[VOTE_FIELD] = evt.record[VOTE_FIELD];
    return new VoteModel(record, language);
  }

  async function fetchVoteModels(language) {
    const query = kintone.app.getQuery();
    const evt = await kintone.api(
      kintone.api.url('/k/v1/records', true),
      'GET',
      {
        'app': APPID,
        'query': query,
        'fields': ['$id', VOTE_FIELD, '$revision']
      }
    );
    const models = [];
    for (let i = 0; i < evt.records.length; i++) {
      const model = new VoteModel(evt.records[i], language);
      models.push(model);
    }
    return models;
  }

  function VoteView(model) {
    const $element = document.createElement('button');
    $element.type = 'button';
    $element.className = 'vote-plugin-show';
    let clickable = true;

    function updateImg(voted) {
      $element.querySelector('.vote-plugin-img').classList.toggle('vote-plugin-voted', voted);
    }

    function updateButtonLabel(usercount, voted) {
      const countText = usercount + '人のいいね。';
      const votedText = voted ? 'いいねしました' : 'いいねする';
      $element.setAttribute('aria-label', countText + votedText);

    }
    function updateCounterEl(usercount) {
      $element.querySelector('.vote-plugin-count')?.remove();
      if (usercount !== 0) {
        const span = document.createElement('span');
        span.className = 'vote-plugin-count';
        span.textContent = String(usercount);
        $element.appendChild(span);
      }
    }

    async function handleClick() {
      if (!clickable) {
        return;
      }
      clickable = false;
      try {
        await model.toggleLoginUser();
        updateImg(model.isLoginUserVoted());
        updateButtonLabel(model.countVoteUsers(), model.isLoginUserVoted());
        updateCounterEl(model.countVoteUsers());
      } finally {
        clickable = true;
      }
    }

    function renderImgAndCounter() {
      // createImg
      const $imgEl = document.createElement('span');
      $imgEl.className = 'vote-plugin-img';
      $element.appendChild($imgEl);
      updateImg(model.isLoginUserVoted());

      // createCounter
      updateButtonLabel(model.countVoteUsers(), model.isLoginUserVoted());
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

  kintone.events.on(['app.record.create.show', 'app.record.index.edit.show', 'app.record.edit.show'], (evt) => {
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

  kintone.events.on('app.record.index.show', async (event) => {
    if (event.records.length === 0) {
      return event;
    }

    const loginInfo = kintone.getLoginUser();
    const lang = getLanguage(loginInfo.language);

    NotifyPopup.createPopup();

    const RECORD_FIELD = getRecordNumberFieldCode(event.records[0]);
    if (!RECORD_FIELD) {
      NotifyPopup.showPopup(Msg[lang].recordNumFieldNotFound);
      return event;
    }

    try {
      const voteModels = await fetchVoteModels(lang);
      const cellEls = kintone.app.getFieldElements(RECORD_FIELD) || [];
      if (cellEls.length === 0) {
        NotifyPopup.showPopup(Msg[lang].recordNumFieldNotFound);
        return event;
      }
      cellEls.forEach((val) => {
        const recordId = Number(val.textContent.split('-').pop());
        const voteModel = voteModels.filter((elem) => {
          return elem.getRecordId() === recordId;
        })[0];
        if (voteModel) {
          let $parentEl = val;
          const descendants = val.querySelectorAll('*');
          outer: for (let i = 0; i < descendants.length; i++) {
            const el = descendants[i];
            for (let j = 0; j < el.childNodes.length; j++) {
              const v = el.childNodes[j];
              if (v.nodeType === 3) {
                $parentEl = v.parentElement;
                break outer;
              }
            }
          }
          new VoteView(voteModel).append($parentEl);
        }
      });
    } catch (e) {
      let message;
      switch (e.code) {
        case 'GAIA_CO02':
          message = Msg[lang].updatedWhileClicking;
          break;
        case 'CB_NO02':
          message = Msg[lang].notHavePermissionToEdit;
          break;
        default:
          message = Msg[lang].errorOccurred;
          break;
      }
      message += '(id:' + e.id + ', code:' + e.code + ')';
      NotifyPopup.showPopup(message);
    }
    return event;
  });

  kintone.events.on('app.record.detail.show', async (event) => {
    const loginInfo = kintone.getLoginUser();
    const lang = getLanguage(loginInfo.language);

    NotifyPopup.createPopup();

    const voteModel = await fetchVoteModel(lang);
    const $labelEl = kintone.app.record.getFieldElement(VOTE_FIELD);
    new VoteView(voteModel).prepend($labelEl);
    return event;
  });

})(kintone.$PLUGIN_ID);
