/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function(pluginId, $) {
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
      this.$el = $(this.template.container);
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
        this.$listOption.find('.kintoneplugin-dropdown-list-item').each((index, item) => {
          if (data === $(item).data('value')) {
            arrItem.push($(item));
          }
        });
        if (arrItem.length) {
          this.data.value = data;
          this.data.name = arrItem[0].text();
        }
      }
      const itemSelected = this.$el.find('.kintoneplugin-dropdown-list-item-selected');
      itemSelected.removeClass('kintoneplugin-dropdown-list-item-selected');
      if (!this.data.value) {
        const $selected = $(this.$el.find('.kintoneplugin-dropdown-list-item')[0]);
        $selected.addClass('kintoneplugin-dropdown-list-item-selected');
      } else {
        arrItem[0].addClass('kintoneplugin-dropdown-list-item-selected');
      }
      this.$select.text(this.data.name);
    },
    renderItemList: function() {
      const self = this;
      const $itemList = this.$el.find('.kintoneplugin-dropdown-list');
      let $item = $(this.template.item);
      $item.text(this.data.name);
      $itemList.append($item);

      $.each(this.settings.itemList, (index, item) => {
        $item = $(self.template.item);
        $item.text(item.name);
        $item.data('value', item.value);
        $itemList.append($item);
      });

    },
    catchElement: function() {
      this.$select = this.$el.find('.kintoneplugin-dropdown-selected-name');
      this.$listOption = this.$el.find('.kintoneplugin-dropdown-list');
    },
    bindEvent: function() {
      this.handleDropdownOuterClick();
      this.handleDropdownListClick();
      this.handleOutsideDropdownListClick();
    },
    handleDropdownOuterClick: function() {
      const self = this;
      this.$el.find('.kintoneplugin-dropdown-outer').click(() => {
        self.$listOption.toggle();
      });
    },
    handleDropdownListClick: function() {
      const self = this;
      this.$listOption.on('click', '.kintoneplugin-dropdown-list-item', (e) => {
        self.data.name = $(e.target).text();
        self.data.value = $(e.target).data('value');
        self.setSelectedValue(self.data.value);
        self.$listOption.toggle();
      });
    },
    handleOutsideDropdownListClick: function() {
      const self = this;
      $('body').on('click', (event) => {
        const isClickOnDropdown = $(event.target).closest(self.$el).length > 0;
        if (!isClickOnDropdown) {
          self.$listOption.hide();
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
    return $('<p> ' + text + '</p>');
  }
  function createVoteLabel(text) {
    return $('<div class="kintoneplugin-label">' + text + '</div>');
  }
  function createVoteField(language) {
    const $container = $('<div class="kintoneplugin-row"></div>');
    $container.append(createVoteLabel(Msg[language].labelOfVoteField));
    $container.append(createVoteDescription(Msg[language].descriptionOfVoteField1));
    $container.append(createVoteDescription(Msg[language].descriptionOfVoteField2));
    $container.append('</br>');
    $container.append($('<div class="vote-dropdown"></div>'));
    return $container;
  }
  function createCountfield(language) {
    const $container = $('<div class="kintoneplugin-row"></div>');
    $container.append(createVoteLabel(Msg[language].labelOfCountfield));
    $container.append(createVoteDescription(Msg[language].descriptionOfCountField1));
    $container.append(createVoteDescription(Msg[language].descriptionOfCountField2));
    $container.append('</br>');
    $container.append($('<div class="count-dropdown"></div>'));
    return $container;
  }
  function createForm(name, language) {
    const $form = $('<form name = "' + name + '"></form>');
    $form.append(createVoteField(language));
    $form.append(createCountfield(language));
    return $form;
  }
  function createVoteSaveBtn(language) {
    return $('<button class="kintoneplugin-button-dialog-ok" type="button" id="setting_submit">'
         + Msg[language].btnSave + '</button>');
  }
  function renderConfigUI(language) {
    const $Container = $('#vote-plugin-container');
    $Container.append(createVoteDescription(Msg[language].description1));
    $Container.append(createVoteDescription(Msg[language].description2));
    $Container.append(createVoteDescription(Msg[language].description3));
    $Container.append('</br>');
    $Container.append(createForm('setting', language));
    $Container.append(createVoteSaveBtn(language));
  }

  $(document).ready(() => {
    const loginInfo = kintone.getLoginUser();
    const lang = getLanguage(loginInfo.language);
    renderConfigUI(lang);

    let voteDropdown;
    let countDropdown;
    Loading.addStyleOnHead(Loading.setting.style.spinner);
    Loading.show();
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {
      'app': kintone.app.getId()
    }, (resp) => {
      const settingVoteField = {itemList: []};
      const settingCountField = {itemList: []};
      $.each(resp.properties, (index, property) => {
        const data = {
          name: property.label,
          value: property.code
        };
        if (property.type === 'NUMBER') {
          settingCountField.itemList.push(data);
        } else if (property.type === 'USER_SELECT') {
          settingVoteField.itemList.push(data);
        }
      });

      voteDropdown = new Dropdown(settingVoteField);
      $('.vote-dropdown').append(voteDropdown.render());

      countDropdown = new Dropdown(settingCountField);
      $('.count-dropdown').append(countDropdown.render());

      const config = kintone.plugin.app.getConfig(pluginId);
      if (config.vote_field && config.vote_count_field) {
        voteDropdown.setSelectedValue(config.vote_field);
        countDropdown.setSelectedValue(config.vote_count_field);
      }

      Loading.hide();
    });

    $('#setting_submit').click(() => {
      const config = {};
      const voteValue = voteDropdown.getSelectedData().value;
      config.vote_field = !voteValue ? '' : voteValue;

      const countValue = countDropdown.getSelectedData().value;
      config.vote_count_field = !countValue ? '' : countValue;

      kintone.plugin.app.setConfig(config);
    });
  });
})(kintone.$PLUGIN_ID, jQuery);
