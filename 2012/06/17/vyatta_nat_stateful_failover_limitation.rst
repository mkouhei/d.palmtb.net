VyattaでNAT stateful failoverを使う場合の制限。
========================================================================================

VyattaでVRRPを使っている場合、VRRPのfailoverが発生してもBackupに引き継いでそのまま通信できるようにNAT stateful failverを使うと思います。が、NATテーブルのエントリ数がある一定を超えると、failoverが発生してからNATテーブルのエントリが引き継がれる途中でBackupがカーネルごと落ちてしまう、という事象に遭遇しました。もうそのまんまなので特にひねりもないのですが、一応検証を行った条件を掲載しておきます。


環境。
----------

* メモリ 2GB
* Vyatta core 6.3 64bit

CPUとかディスクとかは実質ほとんど影響ないので省略。

条件。
----------

VyattaでNATします。負荷検証には、専用のアプライアンスを使い、Webサーバに対してApacheのindex.htmlをGETするだけの負荷をかけました。fail overの基準とする数値はNATテーブルのエントリ数で、/proc/sys/net/netfilter/nf_conntrack_countの値を下記のような感じで監視しました。実際には下記のコマンドでこの数値を観察しながらfailoverさせました。

.. code-block:: sh

   $ mkfifo nf_conntrack_count
   $ while true; do date > nf_conntrack_count; cat /proc/sys/net/netfilter/nf_conntrack_count > nf_conntrack_count; sleep 1; done &
   $ tail -f nf_conntrack_count

ネットワーク構成は下記。Vyatta0の10.0.10.10-10.0.10.250はNAT用のIPアドレス。

.. nwdiag::

   diagram {
   network {
   address = '10.0.20.0/24';
   web0;web1;
   router [address = '10.0.20.1'];
   }
   network {
   address = '10.0.10.0/24';
   router [address = '10.0.10.1'];
   vyatta0 [address = '10.0.10.252, VIP:10.0.10.254, 10.0.10.10-, 10.0.10.250'];
   vyatta1 [address = '10.0.10.253, VIP:10.0.10.254'];
   }
   network {
   address = '10.0.0.0/24';
   vyatta0 [address = '10.0.0.252, VIP:10.0.0.254'];
   vyatta1 [address = '10.0.0.252, VIP:10.0.0.254'];
   'performance test' [address = '10.0.0.10-, 10.0.0.250'];
   }
   }


結果。
------------

最初、200万程度NATテーブルにエントリがある状態で通信させている状態でfailoverさせてみたところ、Backup側に当初は切り替わりましたが、途中で通信できなくなりBackup側もカーネルごとrebootまたは落ちてしまいました。エントリ数を下げてやってみたところ、7万程度ならfailoverできることは確認しました。これがメモリを2GBから増やした場合変わるのかどうかも気にはなったものの、そもそもこんな低い値では使い物になりません。Masterが落ちた場合に全面ダウンしてしまいます。なので、NAT stateful failover自体を行わないことにしました。単体でNAT処理させる場合は、メモリ2GBのIAサーバでもNATテーブルのエントリが200万は処理できた(それ以上はアプライアンス側の制約で負荷を掛けられず)ので、fail over時の通信およびスイッチのMACアドレス学習までの数秒は諦める、ということにしました。

.. author:: default
.. categories:: Ops
.. tags:: Vyatta, Linux
.. comments::
