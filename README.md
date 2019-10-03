Kintone Plug-in Examples
==========================

This is a repository for Kintone plugin-in examples.

## package.sh is now deprecated!

`package.sh` has been deprecated.

Please use [@kintone/plugin-packer](https://www.npmjs.com/package/@kintone/plugin-packer) instead.
It requires [Node.js](https://nodejs.org/).

## Requirement

* Node.js v6 or later

## How to Use

```bash
$ npm install -g @kintone/plugin-packer
$ kintone-plugin-packer <plug-in dir> [--ppk <key file>]
```

For more information, please check the following pages.

* https://github.com/kintone/plugin-packer
* https://developer.cybozu.io/hc/ja/articles/360000910783 (in Japanese)

## Output Files

### Plug-in Package

```bash
plugin.zip
```

### Private Key

```bash
<plug-in id>.ppk
```
**Do not lose the private key!** Keep the .ppk file secret and in a safe place. You'll need it later if you want to update the plug-in.

## Example

```bash
$ cd /tmp
$ git clone https://github.com/kintone/plugin-examples
$ cd plugin-examples
$ npm install -g @kintone/plugin-packer
$ kintone-plugin-packer examples/colorcell
Succeeded: /tmp/plugin-examples/examples/plugin.zip
$ ls examples/*.ppk
examples/dhcpcmonencgafiddfaofdfednmjnbem.ppk
```

## Install Plug-in

See the following document.

en

https://help.cybozu.com/en/k/admin/plugin.html

ja

https://help.cybozu.com/ja/k/admin/plugin.html

## Licence

MIT License

## Copyright

Copyright(c) Cybozu, Inc.
