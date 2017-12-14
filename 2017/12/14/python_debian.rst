再びpython-debianのお話
=======================

この記事は `Debian/Ubuntu Advent Calendar 2017 <https://qiita.com/advent-calendar/2017/debian-ubuntu>`_ 12月14日の記事です。

昨日で投稿が止まってしまいそうだったので急遽書いてみました。

python-debianとは
-----------------

`python-debian <https://tracker.debian.org/pkg/python-debian>`_ は :code:`debian/control` や :code:`.changes` などのフォーマットを扱うのに便利ならライブラリです。Debianパッケージとして提供されているので、 :code:`sudo apt install python-debian` としてインストールすることができます。

使い方
------

オンラインマニュアルは無いのですが、`Debian Sourcesのpython-debianのページ <https://sources.debian.org/src/python-debian/>`_ から任意のバージョンの :code:`README`, :code:`README.deb822` や、 :code:`examples` 以下のサンブルコードを参考にすることはできます。

でも結局Debianパッケージをインストールしないと使えないので、 :code:`/usr/share/doc/python-debian` 以下を参照すれば良いだけですが。

なぜ「再び」かというと
----------------------

:doc:`/2014/05/28/i_made_debsign_of_python_libary_that_can_be_run_without_a_tty` でもpython-debianのネタを書いていました。JenkinsでDebianパッケージのカスタムビルドパッケージをビルドして、GPGサインしてローカルアーカイブにアップロードするために:code:`debsign` コマンドの代わりに `python-debianを使ったPythonパッケージを作った <https://github.com/mkouhei/pydebsign>`_ ときのネタでした。

changesファイルを読み取り、GPGで署名後のハッシュで上書きする
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

やっていることは上記の記事に書いてあるのですが、実際の処理は書いていなかったので抜き出してみると、下記のような感じです。

.. code-block:: python

   import deb822

   with open('path/to/changes_file', 'rb') as fileobj:
       changes = deb822.Changes(fileobj)

   return [changes['Files'],
           changes['Checksums-Sha1'],
           changes['Checksums-Sha256']]

ビルドしたdebianパッケージの :code:`.changes` ファイルのmd5, sha1, sha256のチェックサムを読み取って、 :code:`.changes` ファイルのエントリを書き換え、署名するのですが、python-debian パッケージに含まれる、 :code:`deb822.Changes` クラスでバイナリモードで読み取った :code:`.changes` を読み込むだけで、上記のように簡単に対象のエントリにアクセスできる便利なやつです。

python-debianに含まれるモジュール
---------------------------------

deb822以外にも

- arfile
- changelog
- copyright
- debfile
- debian_support
- debtags

などが含まれるのでpython-debianパッケージをインスールしていれば、 :code:`pydoc` コマンドでdocstringのドキュメントを読むことができます。実際に使うときはそちらを参照するのが良いでしょう。

まとめ
------

- python-debianという便利なDebianパッケージがあるよ
- 以前作ったPythonパッケージでは、 :code:`deb822.Changes` だけでアクセスできて便利だったよ
- ドキュメントはpython-debianパッケージ自体に含まれているよ

というお話でした。

.. author:: default
.. categories:: Python
.. tags:: Debian,Python,python-debian
.. comments::
