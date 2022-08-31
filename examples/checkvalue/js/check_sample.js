/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */
((PLUGIN_ID) => {
  'use strict';

  // 入力モード
  const MODE_ON = '1'; // 変更後チェック実施

  // 設定値読み込み用変数
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  // 設定値読み込み
  if (!CONFIG) {
    return false;
  }

  const CONFIG_ZIP = CONFIG.zip;
  const CONFIG_TEL = CONFIG.tel;
  const CONFIG_FAX = CONFIG.fax;
  const CONFIG_MAIL = CONFIG.mail;

  // 変更後チェック実施:1、 未実施:0
  const MODE_CONFIG = CONFIG.mode;

  const creatErrorMessage = (num) => {
    let lang = kintone.getLoginUser().language;
    const message = {
      'ja': {
        '1': '郵便番号は7桁の半角数字で入力して下さい。',
        '2': '電話番号は10桁 または 11桁の半角数字で入力して下さい。',
        '3': 'FAX番号は10桁 または 11桁の半角数字で入力して下さい。',
        '4': 'メールアドレスとして認識されませんでした。値を確認して下さい。'
      },
      'zh': {
        '1': '请输入7位邮政编码。',
        '2': '请输入10位或11位半角数字的电话号码。',
        '3': '请输入10位或11位半角数字的传真号码。',
        '4': '非法邮箱。请确认输入值。'
      }
    };
    if (!message[lang]) {
      lang = 'ja';
    }
    return message[lang][num];
  };

  // 郵便番号の入力チェック
  const zipCheck = (event) => {
    // 郵便番号の定義(7桁の半角数字)
    const zip_pattern = /^\d{7}$/;
    // event よりレコード情報を取得します
    const rec = event.record;
    // エラーの初期化
    rec[CONFIG_ZIP].error = null;
    // 郵便番号が入力されていたら、入力値を確認します
    const zip_value = rec[CONFIG_ZIP].value;
    if (zip_value) {
      if (zip_value.length > 0) {
        // 定義したパターンにマッチするか確認します
        if (!(zip_value.match(zip_pattern))) {
          // マッチしない場合は、郵便番号フィールドにエラーの内容を表示するようにします
          rec[CONFIG_ZIP].error = creatErrorMessage(1);
        }
      }
    }
  };

  // 電話番号の入力チェック
  const telCheck = (event) => {
    // TELの定義(10桁または 11桁の半角数字)
    const tel_pattern = /^\d{10,11}$/;
    // event よりレコード情報を取得します
    const rec = event.record;
    // エラーの初期化
    rec[CONFIG_TEL].error = null;

    // TEL が入力されていたら、入力値を確認します
    const tel_value = rec[CONFIG_TEL].value;
    if (tel_value) {
      if (tel_value.length > 0) {
        // 定義したパターンにマッチするか確認します
        if (!(tel_value.match(tel_pattern))) {
          // マッチしない場合は、TEL に対してエラーの内容を記載します
          rec[CONFIG_TEL].error = creatErrorMessage(2);
        }
      }
    }
  };

  // FAXの入力チェック
  const faxCheck = (event) => {
    // FAXの定義(10桁または 11桁の半角数字)
    const fax_pattern = /^\d{10,11}$/;
    // event よりレコード情報を取得します
    const rec = event.record;
    // エラーの初期化
    rec[CONFIG_FAX].error = null;
    // FAX が入力されていたら、入力値を確認します
    const fax_value = rec[CONFIG_FAX].value;
    if (fax_value) {
      if (fax_value.length > 0) {
        // 定義したパターンにマッチするか確認します
        if (!(fax_value.match(fax_pattern))) {
          // マッチしない場合は、FAX に対してエラーの内容を記載します
          rec[CONFIG_FAX].error = creatErrorMessage(3);
        }
      }
    }
  };

  // メールアドレスの入力チェック
  const mailCheck = (event) => {
    // メールアドレスの定義 (簡易的な定義です。さらに詳細に定義する場合は下記の値を変更して下さい)
    const mail_pattern = /^([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+$/;
    // event よりレコード情報を取得します
    const rec = event.record;
    // エラーの初期化
    rec[CONFIG_MAIL].error = null;
    // メールアドレスが入力されていたら、入力値を確認します
    const mail_value = rec[CONFIG_MAIL].value;
    if (mail_value) {
      if (mail_value.length > 0) {
        // 定義したパターンにマッチするか確認します
        if (!(mail_value.match(mail_pattern))) {
          // マッチしない場合は、メールアドレスに対してエラーの内容を記載します
          rec[CONFIG_MAIL].error = creatErrorMessage(4);
        }
      }
    }
  };

  // 登録・更新イベント(新規レコード、編集レコード、一覧上の編集レコード)
  kintone.events.on(['app.record.create.submit',
    'app.record.edit.submit',
    'app.record.index.edit.submit'], (event) => {
    zipCheck(event);
    telCheck(event);
    faxCheck(event);
    mailCheck(event);
    return event;
  });

  // 変更イベント（郵便番号)
  kintone.events.on(['app.record.create.change.' + CONFIG_ZIP,
    'app.record.edit.change.' + CONFIG_ZIP,
    'app.record.index.edit.change.' + CONFIG_ZIP
  ], (event) => {
    if (MODE_CONFIG === MODE_ON) {
      zipCheck(event);
    }
    return event;
  });

  // 変更イベント(電話番号)
  kintone.events.on(['app.record.create.change.' + CONFIG_TEL,
    'app.record.edit.change.' + CONFIG_TEL,
    'app.record.index.edit.change.' + CONFIG_TEL
  ], (event) => {
    if (MODE_CONFIG === MODE_ON) {
      telCheck(event);
    }
    return event;
  });

  // 変更イベント(FAX)
  kintone.events.on(['app.record.create.change.' + CONFIG_FAX,
    'app.record.edit.change.' + CONFIG_FAX,
    'app.record.index.edit.change.' + CONFIG_FAX
  ], (event) => {
    if (MODE_CONFIG === MODE_ON) {
      faxCheck(event);
    }
    return event;
  });

  // 変更イベント(Mail)
  kintone.events.on(['app.record.create.change.' + CONFIG_MAIL,
    'app.record.edit.change.' + CONFIG_MAIL,
    'app.record.index.edit.change.' + CONFIG_MAIL
  ], (event) => {
    if (MODE_CONFIG === MODE_ON) {
      mailCheck(event);
    }
    return event;
  });
})(kintone.$PLUGIN_ID);
