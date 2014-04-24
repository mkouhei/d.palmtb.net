Infinite loop using chord of Celery
===================================

Cronのような使い方としては、既に `Celery <http://www.celeryproject.org/>`_ を使っていたのですが、複数のキューを並列実行かつ、各キュー自体はFIFOで処理させられないかなと、チュートリアルを順にやっていた時に見つけたバグです。 `チュートリアル <http://docs.celeryproject.org/en/latest/getting-started/next-steps.html#chords>`_ にある下記のコードを実行すると、

.. code-block:: python

   >>> from celery import chord
   >>> from proj.tasks import add, xsum
   
   >>> chord((add.s(i, i) for i in xrange(10)), xsum.s())().get()


次のようなログが出て無限ループします。::

   [2014-04-25 00:04:45,623: INFO/MainProcess] Received task: celery.chord_unlock[dba8e0f8-cb96-4c91-948c-2acd5ccc3ae8] eta:[2014-04-25 00:04:46.620008+09:00]

Debian GNU/Linux Sidの今のCeleryのパッケージ(python-celery)のバージョンが、3.1.9なのですが、
このバグが修正されているのは、3.1.11に含まれる `コミット <https://github.com/celery/celery/commit/b77c8d3bb29d55b122a471ab65edd183ac7be53a>`_ です。

3.1.9から3.1.11の間には、他にもchordに関するバグが結構修正されているので、3.1.11をパッケージにしてもらうように、 `BTSに登録して <https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=745734>`_ おきました。

なお、group()の方は問題ないので、3.1.11未満で同じことをしたければ、

.. code-block:: python

   >>> (group(add.s(i, i) for i in xrange(10)) | xsum.s())().get()

の方を使えば大丈夫です。


`このコミットのパッチ <https://github.com/celery/celery/commit/b77c8d3bb29d55b122a471ab65edd183ac7be53a.patch>`_ を適用したdebdiffの結果も送付しようかと思ったのですが、現在の環境では、これとは別でテストがコケるFTBFSも存在したので `それを報告して <https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=745739>`_ おきました。


.. author:: default
.. categories:: Python
.. tags:: Debian,Celery
.. comments::
