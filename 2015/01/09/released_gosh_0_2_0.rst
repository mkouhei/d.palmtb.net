Released Gosh 0.2.0
===================

Golang用の対話形式シェル `Gosh <https://github.com/mkouhei/gosh/>`_ の `0.2.0 <https://github.com/mkouhei/gosh/releases/tag/v0.2.0>`_ をリリースしました。

前回のブログ(:doc:`/2014/11/17/interactive_shell_for_golang`)の時は、 `0.1.5 <https://github.com/mkouhei/gosh/tree/v0.1.5>`_ でしたので、そこからの変更点をまとめると次の通りです。

* main関数の宣言を省略可能にしました
* 型および関数の宣言のパーサーの機能強化しました
* 関数宣言の再宣言可能にしました
* Go 1.2のサポート廃止しました
* 各種バグの修正

などです。実装としてはregexpパッケージの正規表現から、go/scanner, go/tokenパッケージを利用した字句解析に変更しています。

main関数の省略
--------------

`README <https://github.com/mkouhei/gosh/blob/v0.2.0/README.rst#basic-usage>`_ にも記載していますが、簡単に紹介します。

Goshの実行方法
~~~~~~~~~~~~~~

.. code-block:: bash

   $ $GOPATH/bin/gosh


fmt.PrintlnでのHello world
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: pycon

   >>> fmt.Println("Hello world")
   Hello world
   >>>

変数の宣言と演算
~~~~~~~~~~~~~~~~

.. code-block:: pycon

   >>> var i = 10
   >>> i++
   >>> fmt.Println(i)
   11
   >>>

省略形式の変数宣言でも大丈夫です。

.. code-block:: pycon

   >>> i := 10
   >>> i += 100
   >>> fmt.Println(i)
   111
   >>>

パッケージのインポート
~~~~~~~~~~~~~~~~~~~~~~

Goshを作ったそもそもの動機である、パッケージのインポートはもちろん使えます。
次は `github.com/bitly/go-simplejson <https://github.com/bitly/go-simplejson>`_ を使った場合の例です。

.. code-block:: pycon

   >>> import "github.com/bitly/go-simplejson"
   >>> r, _ := http.Get("http://d.palmtb.net/_static/glaneuses.json")
   >>> defer r.Body.Close()
   >>> j, _ := simplejson.NewFromReader(r.Body)
   >>> fmt.Println(j)

表示は省略しましたが、simplejson.Json型のデータが出力されます。

main関数の宣言のリセット
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: pycon

   >>> func main(){}

とするとmain関数の宣言を省略して宣言した変数はクリアされます。

fmt.Print*の実行は一回のみ
~~~~~~~~~~~~~~~~~~~~~~~~~~

``fmt.Println("hello")`` などを実行後、その後に他の入力を続けても、最初に実行された ``fmt.Println("hello")`` は実行されないようにしました。つまり、次のようになります。

.. code-block:: pycon

   >>> i := 1
   >>> fmt.Println(i)
   1
   >>> i++
   >>> fmt.Println(i)
   2
   

既知の問題
----------

* main関数を入力した後、Enterをもう一度入力しないとプロンプトが表示されない [#]_

  * `0.2.2 <https://github.com/mkouhei/gosh/releases/tag/v0.2.2>`_ で修正しました(2015-01-14追記)

* 型の再宣言ができない

余談
----

前のブログでは matsuu さんの `tweet <https://twitter.com/matsuu/status/538554866008719360>`_ やHacker Newsへの `投稿 <https://news.ycombinator.com/item?id=8673092>`_ でかなりStarsがつきました。海外の方が多いのは結構モチベーションが上がりますね。matsuuさん、ありがとうございました。

あとは、実際に使ってissues登録やpull requestしてくれる方が出てくると嬉しいですね。


.. rubric:: Footnotes

.. [#] 上記の例で空白行を掲載しているのはそのためです。


.. author:: default
.. categories:: Golang
.. tags:: Gosh,Golang,REPL
.. comments::
