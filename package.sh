#!/bin/sh
BASE_DIR=$(cd $(dirname $0); pwd)

if [ $# -lt 1 ]; then
    echo "usage: $0 PLUGIN_DIR [PRIVATE_KEY_FILE]"
    exit 1
fi

if [ "$(basename $1)" = "." ]; then
    PLUGIN_DIR=$(cd $(dirname $1); pwd)
else
    PLUGIN_DIR=$(cd $(dirname $1); pwd)/$(basename $1)
fi
if [ -f "$2" ]; then
    PPK_FILE=$(cd $(dirname $2); pwd)/$(basename $2)
fi

# ディレクトリ、ファイルのチェック
if [ ! -d $PLUGIN_DIR ]; then
    echo "Plugin directory $PLUGIN_DIR not found."
    exit 1
fi

if [ ! -f "$PLUGIN_DIR/manifest.json" ]; then
    echo "Manifest file $PLUGIN_DIR/manifest.json not found."
    exit 1
fi

DOT_FILES=`find $PLUGIN_DIR -name ".*" | grep -v "/\.$"`
if [ "$DOT_FILES" != "" ]; then
    echo "Dot files or directories cannot be contained."
    for DOT_FILE in $DOT_FILES; do
        echo $DOT_FILE
    done
    exit 1
fi

# コマンド
if [ -x /bin/sed ]; then
    SED="/bin/sed"
elif [ -x /usr/bin/sed ]; then
    SED="/usr/bin/sed"
else
    echo "missing sed."
    exit 1
fi

# 秘密鍵を作成
if [ ! -f "$PPK_FILE" ]; then
    /bin/mkdir $BASE_DIR/keys >/dev/null 2>&1
    PPK_FILE=$BASE_DIR/keys/tmp.ppk
    PPK_FILE_TMP=$PPK_FILE
    /usr/bin/openssl genrsa -out $PPK_FILE 1024 >/dev/null 2>&1
fi

# パッケージ用の一時ディレクトリを作成
PACKAGE_DIR=$BASE_DIR/tmp
/bin/rm -rf $PACKAGE_DIR
/bin/mkdir $PACKAGE_DIR

# プラグインディレクトリを圧縮してコンテンツファイルを作成
CONTENTS_FILE=$PACKAGE_DIR/contents.zip
cd $PLUGIN_DIR
/usr/bin/zip -r $CONTENTS_FILE ./ >/dev/null

# 公開鍵と署名を作成
PUB_FILE=$PACKAGE_DIR/PUBKEY
SIG_FILE=$PACKAGE_DIR/SIGNATURE
/usr/bin/openssl sha1 -sha1 -binary -sign $PPK_FILE < $CONTENTS_FILE > $SIG_FILE 
/usr/bin/openssl rsa -pubout -outform DER < $PPK_FILE > $PUB_FILE 2>/dev/null

UUID=`/usr/bin/openssl dgst -sha256 < $PUB_FILE | $SED 's/^.* //' | /usr/bin/cut -c 1-32 | /usr/bin/tr '0-9a-f' 'a-p'`

# 秘密鍵をリネーム
if [ "$PPK_FILE_TMP" != "" ]; then
    PPK_FILE=$(cd $(dirname $PPK_FILE); pwd)/`basename $PLUGIN_DIR`.$UUID.ppk
    /bin/mv $PPK_FILE_TMP $PPK_FILE
fi

# パッケージファイルを作成
OUTPUT_DIR=$BASE_DIR/plugins/$UUID
/bin/mkdir $BASE_DIR/plugins >/dev/null 2>&1
/bin/mkdir $OUTPUT_DIR > /dev/null 2>&1

OUTPUT_FILE=$OUTPUT_DIR/plugin.zip
/bin/rm $OUTPUT_FILE >/dev/null 2>&1

cd $PACKAGE_DIR
/usr/bin/zip -r $OUTPUT_FILE ./ >/dev/null

# 後片付け
cd $BASE_DIR
/bin/rm -rf $PACKAGE_DIR

echo "Plugin ID: $UUID"
echo "Plugin file: $OUTPUT_FILE"
if [ "$PPK_FILE_TMP" != "" ]; then
    echo "Private key file: $PPK_FILE"
fi
