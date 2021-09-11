Google Nest Hub, Google Home mini 復活
======================================

ある時期から Google Nest Hubがネットワーク障害になり、Google Home mini も同様の問題が発生して困っていたところ、タイムリーな `記事 <https://techracho.bpsinc.jp/baba/2021_08_23/111001>`_ を見つけました。この記事ではEDNSが原因の可能性ありそうというい仮設を立てられていますが、そういえば我が家でもに `dig` コマンドが `+noedns` オプションが必要になっていたことを思い出し、これの可能性が高そうです。

我が家のネットワーク環境ではRTX830 を利用しており、購入後にファームウェアを 15.02.03 にアップデートしたままになっていてので、最新の15.02.20 にアップデートしたところビンゴ。

digコマンド `+noedns` オプションが不要になり、Google Nest Hub, Google Home mini いずれも正常稼働するように戻りました。良かったよかった。参考にした記事の著者に感謝。


.. author:: default
.. categories:: network
.. tags:: RTX830,Google Nest Hub, Google Home mini
.. comments::
