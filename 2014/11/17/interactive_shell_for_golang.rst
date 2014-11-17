Interactive shell for Golang
============================

Golang用の対話形式シェル `Gosh <https://github.com/mkouhei/gosh>`_ を作りましたよ、というお話です。

Golangでコードを書き始めた今年の年初くらいから、iPythonのような対話形式のシェルがほしいなと思っていました。気になるライブラリをちょっと試してみたいときに、 ``go get`` して、Emacsでコード書いて、 ``go run`` を実行する、というのは億劫で、 ``import`` したらそのまま ``go get`` して実行できれば良いな、と思っていました。
そういったツールが無いかと調べて、`go-eval <https://github.com/sbinet/go-eval>`_ や `igo <https://github.com/sbinet/igo>`_ や `Go playground <http://play.golang.org/>`_ [#]_ にはたどり着いたのですが、パッケージをインポートする機能がないので自分の欲しい機能とは違う、ということでエイヤっと作ってみました。

特徴
----

現在の特徴としては次のとおりです。

* Go 1.2 以上対応
* 対話形式のシェル
* ``package main`` の入力省略 [#]_
* 標準ライブラリの ``import`` 省略可
* 標準ライブラリ以外のライブラリの ``import`` 可 [#]_
* ``import`` 文の重複入力を無視
* ``import`` しても未使用のパッケージを無視
* ``Ctrl + d`` で終了

やっていることとしては、単に入力したコードからを、一時ファイル作って ``go run`` を実行するだけの簡単な内容です。

インストール方法や使い方は、 `README <https://github.com/mkouhei/gosh>`_ を読んでください。

今後
----

* ``main()`` を入力しないと実行できないので省略できるようにする
* タブ補完
* DebianパッケージなどでシステムグローバルにインストールしたGolangライブラリなどの ``import`` を省略できるようにする

などを考えています。良かったら使ってみて下さい。

.. rubric:: Footnotes

.. [#] ブラウザで実行したいわけではないので、Go Playgroundだと更に自分のほしいのと違うのですよね。
.. [#] 入力を省略できる、というか、入力するとエラーになります。
.. [#] ``import example.org/foo/bar`` のように実行すると、 ``go get`` します。


.. author:: default
.. categories:: Golang
.. tags:: Gosh,Golang
.. comments::
