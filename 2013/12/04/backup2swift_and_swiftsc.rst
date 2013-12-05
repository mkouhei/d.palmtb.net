backup2swift and swiftsc
========================

`Debian/Ubuntu JP Advent Calendar 2013 <http://atnd.org/events/45968>`_ の四日目の記事です。早速前日のネタ( :doc:`/2013/12/03/how_to_change_timezone_in_debian` )を使うハメになるとは…。前日のネタを使っても、もはや１時間もありませんので、以前、作成＆Debianパッケージ化したツールの紹介をしたいと思います。

ツールの名前は表題のとおりです。

* backup2swift

  * https://github.com/mkouhei/backup2swift
  * https://pypi.python.org/pypi/backup2swift
  * http://packages.qa.debian.org/b/backup2swift.html

* swiftsc

  * https://github.com/mkouhei/swiftsc
  * https://pypi.python.org/pypi/swiftsc
  * http://packages.qa.debian.org/s/swiftsc.html

前者はOpenStack Swiftにバックアップを取るためのコマンドラインツールです。後者はbackup2swiftが使用しているswift用のクライアントライブラリです。前者はswiftにバックアップを取りたいというよくありふれた欲求から開発しました。後者はpython-swiftclientパッケージを使えばそもそも必要ありませんが、それまで全くswiftを使ったことなかった上、Swift絡みで情報交換をしようという機会があり、そのコーディネートを私がやることになったこともあったので、じゃあクライアントライブラリも作ったるか、ということで、これらのツールを作りました。

Swiftの認証は、TempAuthとKeyStoneに対応してます。職場で使っている認証プラグインにも対応していますが、名称を忘れてしまったので思い出したらそのうち追記しておきます。

PKG-OpenStack team のThomas Goirand 氏にパッケージスポンサーをして頂き、python-backup2swift, python-swiftscとしてDebianパッケージになっています。また、Ubuntuにもuniverseとしてパッケージになっているようです。

ということで、Swiftを使っている方はぜひ使ってみて下さい。

なお、開発時には `石川さん <https://twitter.com/ishikawa84g>`_ に助言頂いておりました。石川さん、改めてお礼申し上げます。

.. author:: default
.. categories:: Debian
.. tags:: OpenStack,Python,DebianUbuntuAdvent2013
.. comments::
