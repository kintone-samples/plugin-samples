/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
(function(pluginId) {
  'use strict';

  const Msg = {
    en: {
      description1: 'This Plug-in uses the User selection field '
                        + 'and Number field to record data of "Likes" given to a record.',
      description2: 'Select the relative field names for the settings below.',
      description3: 'To view the Like button on the Record List view, '
                        + 'include the Record Number field into the view.',
      labelOfVoteField: 'Users who Liked the record',
      labelOfCountfield: 'Like Count',
      descriptionOfVoteField1: 'Select a User Selection field from the list.',
      descriptionOfVoteField2: 'Users who like (or unlike) the record will be automatically '
                        + 'added to (or removed from) this field.',
      descriptionOfCountField1: 'Select a Number field from the list.',
      descriptionOfCountField2: 'The number of Likes will be recorded into this field.',
      btnSave: 'Save'
    },
    ja: {
      description1: 'ユーザー選択フィールドと数値フィールドを使って、「いいね」した人のリストと「いいね」された数を表示します。',
      description2: '下記の設定に対するフィールド名を選択してください',
      description3: 'レコード一覧にいいねボタンを表示したい場合は、一覧にレコード番号フィールドを追加してください。',
      labelOfVoteField: '「いいねした人」に使うフィールド',
      labelOfCountfield: '「いいねの数」に使うフィールド',
      descriptionOfVoteField1: 'リストからユーザー選択フィールドを選択してください。',
      descriptionOfVoteField2: 'いいねボタンをクリックするユーザーの情報がこのフィールドに記録されます。',
      descriptionOfCountField1: 'リストから数値フィールドを選択してください。',
      descriptionOfCountField2: 'いいねの数がこのフィールドに保存されます。',
      btnSave: '保存する'
    },
    zh: {
      description1: '使用用户选择字段和数值字段来显示“点了顶的人”和“点了顶的人数”。',
      description2: '从下拉框选择字段代码。',
      description3: '要在记录列表页面中查看“顶”按钮，请在列表中包含“记录编号”字段。',
      labelOfVoteField: '用于显示“点了顶的人”的字段',
      labelOfCountfield: '用于显示“点了顶的人数”的字段',
      descriptionOfVoteField1: '从下拉框中选择一个“选择用户”字段。',
      descriptionOfVoteField2: '在记录上点了顶（或取消顶）的人将会被自动添加到此字段（或从此字段中删除）。',
      descriptionOfCountField1: '从下拉框中选择一个“数值”字段。',
      descriptionOfCountField2: '点了顶的人数将显示在此字段中。',
      btnSave: '保存'
    }
  };

  const Loading = {
    setting: {
      style: {
        spinner: '.kintoneCustomizeloading{position: fixed; width: 100%; height:100%;'
                + 'top: 0; left:0; z-index:1000; background:rgba(204, 204, 204, 0.3)}'
                + '.kintoneCustomizeloading:before{position: fixed; top: calc(50% - 25px);'
                + 'content: "";left: calc(50% - 25px);'
                + 'border:8px solid #f3f3f3;border-radius:50%;border-top:8px solid #3498db;width:50px;'
                + 'height:50px;-webkit-animation:spin .8s linear infinite; animation:spin .8s linear infinite}'
                + '@-webkit-keyframes'
                + 'spin{0%{-webkit-transform:rotate(0)}100%{-webkit-transform:rotate(360deg)}}'
                + '@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}'
      }
    },
    loading: null,
    addStyleOnHead: function(css) {
      const head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

      style.type = 'text/css';
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    },
    show: function(status) {
      const idLoading = 'kintoneCustomizeloading',
        divSpinnerExists = document.getElementById(idLoading),
        divSpinner = document.createElement('div');
      if (this.loading && divSpinnerExists) {
        return;
      }
      if (status === false) {
        if (divSpinnerExists) {
          divSpinnerExists.parentNode.removeChild(divSpinnerExists);
        }
        return;
      }
      divSpinner.className = idLoading;
      divSpinner.id = idLoading;
      document.body.appendChild(divSpinner);
      this.loading = true;
    },
    hide: function() {
      this.loading = false;
      this.show(false);
    }
  };

  function Dropdown(settings) {

    this.settings = settings;
    this.data = {
      name: '-----',
      value: null
    };
  }
  Dropdown.prototype = {
    template: {
      container: '<div class="kintoneplugin-dropdown-container">'
            + '    <div class="kintoneplugin-dropdown-outer">'
            + '        <div class="kintoneplugin-dropdown">'
            + '            <div class="kintoneplugin-dropdown-selected">'
            + '                <span class="kintoneplugin-dropdown-selected-name"></span>'
            + '            </div>'
            + '        </div>'
            + '    </div>'
            + '        <div class="kintoneplugin-dropdown-list"></div>'
            + '</div>',
      item: '<div class="kintoneplugin-dropdown-list-item"></div>'
    },
    render: function() {
      const wrap = document.createElement('div');
      wrap.innerHTML = this.template.container.trim();
      this.$el = wrap.firstElementChild;
      this.catchElement();
      this.renderItemList(this.settings.itemList);
      this.setSelectedValue();
      this.bindEvent();
      this.getSelectedData();
      return this.$el;
    },
    getSelectedData: function() {
      return this.data;
    },
    setSelectedValue: function(data) {
      const arrItem = [];
      if (data) {
        this.$listOption.querySelectorAll('.kintoneplugin-dropdown-list-item').forEach((item) => {
          if (data === item.dataset.value) {
            arrItem.push(item);
          }
        });
        this.data.value = data;
        if (arrItem[0]) {
          this.data.name = arrItem[0].textContent;
        }
      }
      const itemSelected = this.$el.querySelector('.kintoneplugin-dropdown-list-item-selected');
      if (itemSelected) {
        itemSelected.classList.remove('kintoneplugin-dropdown-list-item-selected');
      }
      if (!this.data.value) {
        const firstItem = this.$el.querySelector('.kintoneplugin-dropdown-list-item');
        if (firstItem) {
          firstItem.classList.add('kintoneplugin-dropdown-list-item-selected');
        }
      } else if (arrItem[0]) {
        arrItem[0].classList.add('kintoneplugin-dropdown-list-item-selected');
      }
      this.$select.textContent = this.data.name;
    },
    renderItemList: function() {
      const $itemList = this.$el.querySelector('.kintoneplugin-dropdown-list');
      let $item = document.createElement('div');
      $item.className = 'kintoneplugin-dropdown-list-item';
      $item.textContent = this.data.name;
      $itemList.appendChild($item);

      for (const item of this.settings.itemList) {
        $item = document.createElement('div');
        $item.className = 'kintoneplugin-dropdown-list-item';
        $item.textContent = item.name;
        $item.dataset.value = item.value;
        $itemList.appendChild($item);
      }

    },
    catchElement: function() {
      this.$select = this.$el.querySelector('.kintoneplugin-dropdown-selected-name');
      this.$listOption = this.$el.querySelector('.kintoneplugin-dropdown-list');
    },
    bindEvent: function() {
      this.handleDropdownOuterClick();
      this.handleDropdownListClick();
      this.handleOutsideDropdownListClick();
    },
    handleDropdownOuterClick: function() {
      const self = this;
      this.$el.querySelector('.kintoneplugin-dropdown-outer').addEventListener('click', () => {
        const list = self.$listOption;
        if (list.style.display === 'none' || getComputedStyle(list).display === 'none') {
          list.style.display = 'block';
        } else {
          list.style.display = 'none';
        }
      });
    },
    handleDropdownListClick: function() {
      const self = this;
      this.$listOption.addEventListener('click', (e) => {
        const row = e.target.closest('.kintoneplugin-dropdown-list-item');
        if (!row || !self.$listOption.contains(row)) {
          return;
        }
        self.data.name = row.textContent;
        self.data.value = row.dataset.value;
        self.setSelectedValue(self.data.value);
        const list = self.$listOption;
        if (list.style.display === 'none' || getComputedStyle(list).display === 'none') {
          list.style.display = 'block';
        } else {
          list.style.display = 'none';
        }
      });
    },
    handleOutsideDropdownListClick: function() {
      const self = this;
      document.body.addEventListener('click', (event) => {
        const isClickOnDropdown = self.$el.contains(event.target);
        if (!isClickOnDropdown) {
          self.$listOption.style.display = 'none';
        }
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

  function createVoteDescription(text) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(' ' + text));
    return p;
  }
  function createVoteLabel(text) {
    const div = document.createElement('div');
    div.className = 'kintoneplugin-label';
    div.textContent = text;
    return div;
  }
  function createVoteField(language) {
    const $container = document.createElement('div');
    $container.className = 'kintoneplugin-row';
    $container.appendChild(createVoteLabel(Msg[language].labelOfVoteField));
    $container.appendChild(createVoteDescription(Msg[language].descriptionOfVoteField1));
    $container.appendChild(createVoteDescription(Msg[language].descriptionOfVoteField2));
    $container.appendChild(document.createElement('br'));
    const slot = document.createElement('div');
    slot.className = 'vote-dropdown';
    $container.appendChild(slot);
    return $container;
  }
  function createCountfield(language) {
    const $container = document.createElement('div');
    $container.className = 'kintoneplugin-row';
    $container.appendChild(createVoteLabel(Msg[language].labelOfCountfield));
    $container.appendChild(createVoteDescription(Msg[language].descriptionOfCountField1));
    $container.appendChild(createVoteDescription(Msg[language].descriptionOfCountField2));
    $container.appendChild(document.createElement('br'));
    const slot = document.createElement('div');
    slot.className = 'count-dropdown';
    $container.appendChild(slot);
    return $container;
  }
  function createForm(name, language) {
    const $form = document.createElement('form');
    $form.setAttribute('name', name);
    $form.appendChild(createVoteField(language));
    $form.appendChild(createCountfield(language));
    return $form;
  }
  function createVoteSaveBtn(language) {
    const btn = document.createElement('button');
    btn.className = 'kintoneplugin-button-dialog-ok';
    btn.type = 'button';
    btn.id = 'setting_submit';
    btn.appendChild(document.createTextNode(Msg[language].btnSave));
    return btn;
  }
  function renderConfigUI(language) {
    const $Container = document.getElementById('vote-plugin-container');
    $Container.appendChild(createVoteDescription(Msg[language].description1));
    $Container.appendChild(createVoteDescription(Msg[language].description2));
    $Container.appendChild(createVoteDescription(Msg[language].description3));
    $Container.appendChild(document.createElement('br'));
    $Container.appendChild(createForm('setting', language));
    $Container.appendChild(createVoteSaveBtn(language));
  }

  async function initConfigPage() {
    const loginInfo = kintone.getLoginUser();
    const lang = getLanguage(loginInfo.language);
    renderConfigUI(lang);

    let voteDropdown;
    let countDropdown;
    Loading.addStyleOnHead(Loading.setting.style.spinner);
    Loading.show();
    try {
      const resp = await kintone.api(
        kintone.api.url('/k/v1/preview/app/form/fields', true),
        'GET',
        {
          'app': kintone.app.getId()
        }
      );
      const settingVoteField = {itemList: []};
      const settingCountField = {itemList: []};
      for (const property of Object.values(resp.properties)) {
        const data = {
          name: property.label,
          value: property.code
        };
        if (property.type === 'NUMBER') {
          settingCountField.itemList.push(data);
        } else if (property.type === 'USER_SELECT') {
          settingVoteField.itemList.push(data);
        }
      }

      voteDropdown = new Dropdown(settingVoteField);
      document.querySelector('.vote-dropdown').appendChild(voteDropdown.render());

      countDropdown = new Dropdown(settingCountField);
      document.querySelector('.count-dropdown').appendChild(countDropdown.render());

      const config = kintone.plugin.app.getConfig(pluginId);
      if (config.vote_field && config.vote_count_field) {
        voteDropdown.setSelectedValue(config.vote_field);
        countDropdown.setSelectedValue(config.vote_count_field);
      }
    } catch (error) {
      console.error(error);
    } finally {
      Loading.hide();
    }

    document.getElementById('setting_submit').addEventListener('click', () => {
      const config = {};
      const voteValue = voteDropdown.getSelectedData().value;
      config.vote_field = !voteValue ? '' : voteValue;

      const countValue = countDropdown.getSelectedData().value;
      config.vote_count_field = !countValue ? '' : countValue;

      kintone.plugin.app.setConfig(config);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfigPage);
  } else {
    initConfigPage();
  }
})(kintone.$PLUGIN_ID);
