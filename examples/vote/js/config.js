/*
 * vote Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function(pluginId, $) {
    'use strict';

    var Msg = {
        ja: {
            header: 'Vote extension',
            description1: 'ユーザー選択フィールドと数値フィールドをつかって、いいねした人といいねの数を実現します。',
            description2: 'それぞれのフィールドコードをドロップダウンより選択してください。',
            labelOfVoteField: '「いいねした人」に使うフィールド:',
            labelOfCountfield: '「いいねの数」に使うフィールド:',
            btnSave: '保存する'
        },
        en: {
            header: 'Vote extension',
            description1: 'Use the User selection field and the Numeric field to display number of people' 
                        + ' who say like and number of like.',
            description2: 'Select each field code from the dropdown.',
            labelOfVoteField: 'Field is used for "people who said like"',
            labelOfCountfield: 'Field is used for "number of like"',
            btnSave: 'Save'
        }
    };

    var Loading = {
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
            var head = document.head || document.getElementsByTagName('head')[0],
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
            var idLoading = 'kintoneCustomizeloading',
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
            container: '<div>'
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
            this.getSelectedValue();
            return this.$el;
        },
        getSelectedValue: function() {
            return this.data;
        },
        setSelectedValue: function(data) {
            var arrItem = [];
            if (data) {
                this.$listOption.find('.kintoneplugin-dropdown-list-item').each(function(index, item) {
                    if (data === $(item).data('value')) {
                        arrItem.push($(item));
                    }
                });
                this.data.value = data;
                this.data.name = arrItem[0].text();
            }
            var itemSelected = this.$el.find('.kintoneplugin-dropdown-list-item-selected');
            itemSelected.removeClass('kintoneplugin-dropdown-list-item-selected');
            if (!this.data.value) {
                var $selected = $(this.$el.find('.kintoneplugin-dropdown-list-item')[0]);
                $selected.addClass('kintoneplugin-dropdown-list-item-selected');
            } else {
                arrItem[0].addClass('kintoneplugin-dropdown-list-item-selected');
            }
            this.$select.text(this.data.name);
        },
        findItemInList: function() {

        },
        renderItemList: function() {
            var self = this;
            var $itemList = this.$el.find('.kintoneplugin-dropdown-list');
            var $item = $(this.template.item);
            $item.text(this.data.name);
            $itemList.append($item);

            $.each(this.settings.itemList, function(index, item) {
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
        },
        handleDropdownOuterClick: function() {
            var self = this;
            this.$el.find('.kintoneplugin-dropdown-outer').click(function() {
                self.$listOption.toggle();
            });
        },
        handleDropdownListClick: function() {
            var self = this;
            this.$listOption.on('click', '.kintoneplugin-dropdown-list-item', function() {
                self.data.name = $(this).text();
                self.data.value = $(this).data('value');
                self.setSelectedValue(self.data.value);
                self.$listOption.toggle();
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

    function createVoteHeader(text) {
        return $('<h1> ' + text + '</h1>');
    }
    function createVoteDescription(text) {
        return $('<p> ' + text + '</p>');
    }
    function createVoteLabel(text) {
        return $('<div class="kintoneplugin-label">' + text + '</div>');
    }
    function createVoteField(language) {
        var $container = $('<div class="kintoneplugin-row"></div>');
        $container.append(createVoteLabel(Msg[language].labelOfVoteField));
        $container.append($('<div class="vote-dropdown"></div>'));
        return $container;
    }
    function createCountfield(language) {
        var $container = $('<div class="kintoneplugin-row"></div>');
        $container.append(createVoteLabel(Msg[language].labelOfCountfield));
        $container.append($('<div class="count-dropdown"></div>'));
        return $container;
    }
    function createForm(name, language) {
        var $form = $('<form name = "' + name + '"></form>');
        $form.append(createVoteField(language));
        $form.append(createCountfield(language));
        return $form;
    }
    function createVoteSaveBtn(language) {
        return $('<button class="kintoneplugin-button-dialog-ok" type="button" id="setting_submit">'
         + Msg[language].btnSave + '</button>');
    }
    function renderConfigUI(language) {
        var $Container = $('#vote-plugin-container');
        $Container.append(createVoteHeader(Msg[language].header));
        $Container.append(createVoteDescription(Msg[language].description1));
        $Container.append(createVoteDescription(Msg[language].description2));
        $Container.append(createForm('setting', language));
        $Container.append(createVoteSaveBtn(language));
    }

    $(document).ready(function() {
        var loginInfo = kintone.getLoginUser();
        var lang = getLanguage(loginInfo.language);
        renderConfigUI(lang);

        var voteDropdown;
        var countDropdown;
        Loading.addStyleOnHead(Loading.setting.style.spinner);
        Loading.show();
        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {
            'app': kintone.app.getId()
        }, function(resp) {
            var settingVoteField = {itemList: []};
            var settingCountField = {itemList: []};
            $.each(resp.properties, function(index, property) {
                var data = {
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

            var config = kintone.plugin.app.getConfig(pluginId);
            if (config.vote_field && config.vote_count_field) {
                voteDropdown.setSelectedValue(config.vote_field);
                countDropdown.setSelectedValue(config.vote_count_field);
            }

            Loading.hide();
        });

        $('#setting_submit').click(function() {
            var config = {};
            var voteValue = voteDropdown.getSelectedValue().value;
            config.vote_field = !voteValue ? '' : voteValue;

            var countValue = countDropdown.getSelectedValue().value;
            config.vote_count_field = !countValue ? '' : countValue;

            kintone.plugin.app.setConfig(config);
        });
    });
})(kintone.$PLUGIN_ID, jQuery);
