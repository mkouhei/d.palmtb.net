I made debsign of Python libary that can be run without a TTY
=============================================================

この辺の話の続きです。

* :doc:`/2014/03/27/issue_deploying_jenkins_to_tomcat7_debian_package_in_wheezy`
* :doc:`/2014/04/12/how_to_build_custom_debian_package_automatically_by_jenkins`
* :doc:`/2014/04/16/retrieve_and_generate_debian_package_of_oracle_jdk`
* :doc:`/2014/04/17/manage_multiple_distributions_with_reprepro`

諸事情で、ローカル環境でDebianパッケージをbackportsしたり、
オリジナルのパッケージを諸事情で公式パッケージではなく、非公開パッケージとして、
それらをローカルアーカイブに突っ込むのに、Jenkinsで全て完結させたいなと思い、 [#]_
いろいろ試行錯誤したところ、どう頑張っても `debsing` で署名することだけはできないことが分かりました。

`debsign` コマンド自体がつぎのように標準入力からパスフレーズを受け取ってプロンプトで代入する、ということができません。

.. code-block:: sh

   $ echo -e "passphrase\npassphrase\n" | debsign some.changes

同じように試行錯誤している人はいるみたいですが、解決している人はいなさそうでした。
一方、 `gpg` コマンドは、 `--batch` および `--no-tty` というオプションがあります。
で、GnuPGのPythonバインディングである `python_gnupg <https://pythonhosted.org/python-gnupg/>`_ はこの機能を使えることが分かりました。

`debsign` コマンドの挙動としては、まず.dscファイルを署名し、署名後のファイルサイズとmd5, sha1, sha256のチェックサムを取得し、.changesのエントリを書き換え、.changesファイルを署名します。
で.changesファイルを `sed` コマンドなどで書き換えるのはちょいと面倒だなと思っていたら、.changesファイルを扱う、deb822というモジュールがありました。これは、python-debianパッケージとして提供されています。 [#]_
これを使うと、.changesファイルの情報をDictに似たデータとして扱えます。

で、これらを使って、pydebsignというPythonライブラリを作りました。

* https://github.com/mkouhei/pydebsign
* https://pypi.python.org/pypi/pydebsign

このライブラリで debsign と同等の処理を、JenkinsなどのCIで実行させることができます。
そのサンプルが、 `これ <https://gist.github.com/mkouhei/b2a5ed1d7d518984a2bd>`_ です。

このコードでJenkinsでパッケージビルド＆署名＆reprepro管理のローカルアーカイブへの登録まで全部自動で行えるようになりましたよ、
というお話でした。 [#]_


.. rubric:: footnote

.. [#] 一からソースパッケージを作るところの自動化は除く。
.. [#] PyPI でも公開されています。 https://pypi.python.org/pypi/python-debian
.. [#] リンク先のGistのコードを使うために、JenkinsおよびRepreproにも設定が必要なのですが、それはまた別の話。

.. author:: default
.. categories:: Debian
.. tags:: Python,debsign,Jenkins,python_gnupg,python_debian,GnuPG
.. comments::
