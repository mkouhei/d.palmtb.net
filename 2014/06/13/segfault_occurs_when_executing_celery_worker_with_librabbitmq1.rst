Segfault occurs when executing celery worker with librabbitmq1
==============================================================

Ubuntu Trustyのpython-celeryパッケージを使って、celery workerを実行すると、プロセスが突然死ぬ、という現象に遭遇しました。
原因は、AMQPクライアントライブラリであるlibrabbitmq1がsegfaultを起こしていたためでした。

.. code-block:: pypy

   [881933.805893] celery[12704]: segfault at 0 ip 00007f23cd79f6ab sp 00007fff5afe3f70 error 4 in librabbitmq.so.1.1.1[7f23cd797000+10000]

celerybeatを使うと、segfaultは起きないものの、RabbitMQにジョブだけたまり、ちっとも処理されない、という現象が発生します。

Sidで開発していたときには発生しなかった問題だったので、比較してみたらSidではlibrabbitmq1とこのライブラリに依存するpython-librabbitmqは使っておらず [#]_ 、python-amqpを使っていました。依存関係としては下図のようになります。

.. blockdiag::

   blockdiag {
   orientation = portrait;
   python-celery -> python-kombu -> python-librabbitmq -> librabbitmq1;
   python-kombu -> python-amqp;
   }   


python-amqpもインストールされていたのですが、python-librabbitmqがインストールされているとこちらが優先されるようです。


workaround
----------

librabbitmq1とpython-librabbitmq [#]_ をアンインストールすると、この問題は解決します。ちなみにSidでこれらのパッケージをインストールしてみましたが再現しなかったのでTrusty(のパッケージのバージョン)だけでの問題のようです。


.. rubric:: Footnotes

.. [#] パッケージ自体インストールしていませんでした。
.. [#] librabbitmq1パッケージをアンインストールすれば、依存関係でpython-librabbitmqも自動的にアンインストールされます。


.. author:: default
.. categories:: Celery
.. tags:: Ubuntu,Debian,RabbitMQ,Celery
.. comments::
