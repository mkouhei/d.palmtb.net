============================================
 Drawing tool of the Python package digraph
============================================

ふと `Heroku <https://www.heroku.com/>`_ で遊んでみようと思い、 `「Webブラウザで Python パッケージの依存関係を表す有向グラフ」を描画するツール <http://pgraph.palmtb.net>`_ を作ってみました。

誰得で、またつまらぬモノを作って公開してしまった、が後悔はしていない。
機能的には個人的には欲しかったモノなのと、最小構成の無料の範囲で遊べているので。

特徴
----

* ナビゲーションバーの"`Example <http://pgraph.palmtb.net/example>`_"をクリックするとpgraphの最新バージョンの依存関係を描画します
* ``search packages`` のフォームから検索すると、 `PyPI <https://pypi.python.org/pypi>`_ のAPIでの検索したパッケージ一覧の結果を表示します
* 描画されたグラフは、ノードをクリックしてドラッグして、グリグリ動かしたり、グラフの拡大・縮小ができます

グリグリ動かす？拡大・縮小？
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

グラフをグリグリ動かしたり、拡大・縮小するのに使っているのは、 `Linkdraw <https://github.com/mtoshi/linkdraw>`_ というライブラリです。ご存知でしょうか？

元同僚の mtoshi さんが開発したトポロジを描画するツールで、`大統一Debian勉強会 2013 <http://gum.debian.or.jp/2013/>`_ で `発表 <http://gum.debian.or.jp/2013/session/448.html>`_ も `されました <http://www.slideshare.net/mtoshi/20130629-linkdraw>`_ 。ここ数年、一番感銘を受けたソフトウェアで、「mtoshiスゲー！！」を引き起こした一番のシロモノです。

このツールは、ネットワークのトポロジを描画するものなので、今のところ `Wiki <https://github.com/mtoshi/linkdraw/wiki>`_ から辿れる `サンプル <http://linkdraw.org/sample.html>`_ と `デモ <http://linkdraw.org/demo.html>`_ くらいしか表に出ているものが無いので、他の活用例があると良いなぁと思い、今回使ったという次第です。

pgraphのexample
+++++++++++++++

上記のExampleのリンクから pgraph のグラフを表示すると、pgraph 自体はパッケージの依存関係が多いため、パッケージのノードを動かすとモッサリすることもあります。これはJavaScriptでSVGを処理しているので完全にクライアントのリソース次第です。Linkdraw自体は有向グラフではないので、依存関係の方向性はlineのdescriptionに ``->`` を表示しています。これは `py-deps <http://py-deps.readthedocs.org/>`_ というライブラリで生成しています。Pythonパッケージの依存関係を調べ、各種グラフに変換するために実装したライブラリです。 [#]_

pgraphの構成
------------

Webフレームワークには `Pyramid <http://docs.pylonsproject.org/projects/pyramid/>`_ [#]_ 、パッケージの検索、依存関係の分析および Linkdraw用のデータ生成には、自作の py-deps、py-depsに依存関係の分析を実行させる処理は `Celery <http://www.celeryproject.org/>`_ でタスクキューに投げ非同期で実行し、分析した結果はキャッシュに格納します。ローカルで実行する時と、Herokuで実行する時とで、それぞれCeleryのBrokerとキャッシュのバックエンドを変更できるようにしています。

py-depsの機能
~~~~~~~~~~~~~

パッケージの検索には `PyPIの XML-RPC メソッド <https://wiki.python.org/moin/PyPIXmlRpc>`_ を使っています。パッケージの依存関係の分析には `pip <https://pip.pypa.io/>`_ のライブラリを使いました。 [#]_ パッケージによっては、依存パッケージが多く、パッケージのダウンロードに時間が掛かることもあるので、前述の通りCeleryを使っています。キャッシュはPickleでのファイルキャッシュかMemcachedをpy-depsで選べるようにしています。

今回ハマったこと
----------------

Herokuでも当初ローカルと同様の構成にしようと、Celeryのバックエンドには `CloudAMQP <https://addons.heroku.com/cloudamqp>`_ 、キャッシュはPickleでのファイルキャッシュにしていましたが、いろいろ問題がありました。また、Linkdrawでパッケージの依存関係を表示すること自体にも問題がありました。最後にそれらをまとめて紹介します。

Linkdrawでノードとエッジが離れて動いたりする問題
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

現在のLinkdrawの仕様で一部の使えない文字が原因でした。このため、setuptoolsのextras_requireを表示するのに、 ``foo[bar]`` を ``foo____bar`` と変換しています。

なお、使用できない文字は `ドキュメントに追記して <https://github.com/mtoshi/linkdraw/wiki#configuration>`_ おいてもらいました。

celerydが起動しているように見えるのに、タスクが登録されない問題
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

これは単に、Herokuではworkerがデフォルトでは起動しない、というのを私が知らなかっただけなので、

.. code-block:: shell

   $ heroku ps:scale worker=1

で起動することで解決しました。

キャッシュファイルが作成されない問題
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Herokuではpipでパッケージをインストールできるのだから、アプリから一時ファイルの生成もできるんじゃないか、と誤解していたため、当初依存関係の結果をPickle化してファイルキャッシュとしていました。

しかし、実際に作ってからHeroku上で動かしたところ、ファイルは作成できてもすぐに削除されることを知り、キャッシュのバックエンドには `pylibmc <http://sendapatch.se/projects/pylibmc/>`_ を使って、Memcachedを使えるようにしました。 [#]_

HerokuではAddonの `Memcached Cloud <https://addons.heroku.com/memcachedcloud>`_ を使っています。

pylibmcがビルドできない問題
~~~~~~~~~~~~~~~~~~~~~~~~~~~

pylibmcは libmemcachedの C bindingのPythonパッケージなので、Herokuで使うには `build-pack-python <https://github.com/heroku/heroku-buildpack-python>`_ を使ってビルドを行う必要があります。build-pack-pythonは ``requirements.txt`` にビルド対象のパッケージが記載されていることをトリガーにして、ビルドを実行します。

で、これでハマりました。

普段、Pythonパッケージを作るとき、requirements.txtはsetup.pyの ``install_requies`` から自動生成するようにしています。今回も同様にしていました。しかしこれが原因でpylibmcがビルドされない問題に当たりました。setup.pyでのrequirements.txtの生成は、build-packによるビルドより先に実行されることを期待していました。しかし実際にはbuild-packでのビルドの方が先であり、build-packでのビルド時にはrequirements.txtが無いため、pylibmcがビルドされないということでした。

この問題は、Heroku用のブランチのみrequirements.txtをindexに追加することで解決しました。

CloudAMQPのメッセージがすぐ上限に達しそうな問題
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

当初、パッケージ依存関係を分析するタスクをCloudAMQPに登録していましたが、タスクの結果を `celery.result.AsyncResult <http://celery.readthedocs.org/en/latest/reference/celery.result.html#celery.result.AsyncResult>`_ でチェックするだけでメッセージカウンターが上がってしまうのでした。。最小構成での無料の範囲で動かそうとすると、CloudAMQPの一ヶ月のメッセージの上限が100万なのに一週間で上限の7割に達してしまいました。これはアカン。

ということで、Celeryのバックエンドを `Heroku Postgres <https://addons.heroku.com/heroku-postgresql>`_ に変更することで回避しました。

Heroku Postgresの最小構成の制限はメッセージ数ではなく、1万行までのデータなので、CeleryのBrokerとして使うのであればタスクが正常に完了するか、あるいは失敗してrevokeさせれば、レコードは削除されます。ですのでメッセージ数はもちろん、レコード数の制約も特に気にする必要がありません。

Price planが変わった問題
~~~~~~~~~~~~~~~~~~~~~~~~

遊びだしてからSpin downしないように `New Relic APM <https://addons.heroku.com/newrelic>`_ を使って polling していたのですが、なんか Heroku からメールが来るなぁと思ったら、 `DynosのPricingが変更されて <https://blog.heroku.com/archives/2015/6/15/dynos-pricing-ga>`_ おり、最低6時間はSleep が必要になっていました。

とりあえず、誰得ツールなので polling するのをやめれば大丈夫でしょう。

終わりに
--------

特にまとめはありませんが、ぜひグリグリ遊んでみてください。

.. rubric:: footnote

.. [#] 開発自体はpy-depsの方が先です。現状、Linkdrawと `NetworkX <https://networkx.github.io/>`_ だけに対応しています。 `blockdiag <http://blockdiag.com/ja/blockdiag/>`_ にもそのうち対応する予定です。
.. [#] 仕事では `Flask <http://flask.pocoo.org/>`_, `Django <https://www.djangoproject.com/>`_ および `django REST framework <http://www.django-rest-framework.org/>`_ が多かったのでたまには別のものも使ってみるか、というノリです。
.. [#] pip コマンドではありません。       
.. [#] ローカルで動かす場合にはPickleを使う構成に現在もできます。なお、手元でmemcachedをバックエンドにしてテストするときには、普段yrmcdsをインストールしているのでそっちを使っています。
       
.. author:: default
.. categories:: Python
.. tags:: Python,Linkdraw,Celery,pylibmc,Pyramid,Heroku
.. comments::
