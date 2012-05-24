名前付きパイプを知らない？
==========================================

名前付きパイプを知らないという人が意外といるみたいなので、小ネタとして紹介します。名前付きパイプとは、パイプ'|'の代わりに使える特殊ファイルです。mkfifoコマンドで作成します。

.. code-block:: bash

   $ mkfifo hoge

このhogeというファイルをreadしておき、別のプロセスでこのファイルに何らかの出力を書き込んでやると、hogeをreadしている側でその書き込まれた出力が読めます。

たとえば、Netfilterのカウンター(/proc/sys/net/netfilter/nf_conntrack_count)を見たい場合、

.. code-block:: bash

   $ watch cat /proc/sys/net/netfilter/nf_conntrack_count

とかでも良いですが、上記を名前付きパイプに常に書き込む用にしてやっても良いわけです。この値だけを書き込むだけならあまり意味がありませんが、ちょっと加工したい場合に便利です。

.. code-block:: bash

   $ mkfifo hoge
   $ while true
   do
     date > hoge;
     cat /proc/sys/net/netfilter/nf_conntrack_count > hoge
     sleep 1
   done &
   $ tail -f hoge

こうしてやると、

.. code-block:: bash

   Thu May 24 21:00:28 JST 2012
   21130
   Thu May 24 21:00:29 JST 2012
   21173
   Thu May 24 21:00:30 JST 2012
   21201
   Thu May 24 21:00:31 JST 2012
   21216
   (snip)

というように見ることができます。ssh経由で扱うこともできます。


.. code-block:: bash
   
   $ ssh remotehost tail -f hoge
   Thu May 24 21:07:08 JST 2012
   20587
   Thu May 24 21:07:09 JST 2012
   20585
   Thu May 24 21:07:10 JST 2012
   20594


ログはローカルに吐きたくないけれど、ログ監視はしたい、でもsyslogで転送したくない、という場合は、これを使うとできますね。どんなケースだ、それ。

.. author:: default
.. categories:: Ops
.. tags:: Linux
.. comments::
