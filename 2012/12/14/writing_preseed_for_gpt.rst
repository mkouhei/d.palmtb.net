GPT対応のpreseedの書き方
========================

この記事は `Debian/Ubuntu JP Advent Calendar 2012 <http://atnd.org/events/34386>`_ の 12/14(金) の記事です。昨日は岩松さん(`@iwamatsu <http://twitter.com/iwamatsu>`_)による "`namecheck / 同じ名前のパッケージ/プロジェクト名がないか確認する <http://www.nigauri.org/~iwamatsu/d/?date=20121213#p01>`_" でした。今日は、GPTを使う、要は2TBを超えるハードディスクに、preseedを使ってDebian/Ubuntuをインストールする方法について紹介します。

GPTとは
-------

GUIDパーティションテーブル(GUID Partition Table)の略で、EFIの一部であることから、rEFItを使ってIntel Mac、特にMacBookなどにDebianをインストールしている面々には聞きなれた用語かと思います。EFIはx86アーキテクチャのBIOSに、GPTはMBRを置き換えるものとなっています。MBRの場合、2TBの壁がありますが、最近のディスクの大容量化により、2TBを超えるディスクを持っている方も増えているのではないかと思います。

ちなみに我が家では、OpenBlockS 266で使用している40GBとか80GBの5400rpmの2.5インチハードディスクが大半で、普段つかっているMacBook Pro 15インチは120GBのSSD、一番大きい容量でもMac miniの500GBなので、2TBを超えるなんてまだ当面先の話です。

閑話休題。2TBを超えるディスクといえば、1Uサーバでもお目にかかるようになりました。今回、職場で導入するサーバの一部で、2TBを超えるサーバにpreseedでUbuntu 12.04 LTSをインストールすることになったので、説明したいと思います。


Preseedについて
---------------

Preseedでの書き方について触れる前に、そもそもPreseedって何ぞや、という方のために少し説明。PreseedはDebianおよびDebianから派生したディストロで使用される、自動インストールのための仕組みです。みんな大好きRHEL系のディストロではKickStartに相当するものです。Debian系ではKickStartを使ってPXEブートで自動インストールすることもできますが、できることに一部制限があるので、Preseedを使うのがよいでしょう。

preseedでのパーティショニング
-----------------------------

公式ドキュメントの `B.4.7. パーティション分割 <http://www.debian.org/releases/stable/amd64/apbs04.html.ja#preseed-partman>`_ に例が記述されています。細かく指定するには、"partman-auto/expert_recipe"を使うのですが、残念ながらこの指定方法について細かく載っているマニュアルは、ネットで検索してもなかなか出てきません。上記リンク先で説明のあるとおり、debian-installerパッケージに含まれる、/usr/share/doc/debian-installer/devel/partman-auto-recipe.txt.gzを読むのが良いでしょう。公式ドキュメントのサンプルでは、

.. code-block:: bash

   # If not, you can put an entire recipe into the preconfiguration file in one
   # (logical) line. This example creates a small /boot partition, suitable
   # swap, and uses the rest of the space for the root partition:
   #d-i partman-auto/expert_recipe string                         \
   #      boot-root ::                                            \
   #              40 50 100 ext3                                  \
   #                      $primary{ } $bootable{ }                \
   #                      method{ format } format{ }              \
   #                      use_filesystem{ } filesystem{ ext3 }    \
   #                      mountpoint{ /boot }                     \
   #              .                                               \
   #              500 10000 1000000000 ext3                       \
   #                      method{ format } format{ }              \
   #                      use_filesystem{ } filesystem{ ext3 }    \
   #                      mountpoint{ / }                         \
   #              .                                               \
   #              64 512 300% linux-swap                          \
   #                      method{ swap } format{ }                \
   #              .

と記載されていますが、各パラメータについての説明はありません。これは、partman-auto-recipe.txtによると、

.. code-block:: bash

   <limits>::=<minimal size>_<priority>_<maximal size>_<parted fs>

となっています。サイズはmegabytesもしくはディスク容量の割合(%)で指定することができます。minimal sizeは最小サイズを指定します。priorityは小さい値の方が優先度が高くなります。maximalサイズは割り当ての上限サイズを指定し、-1を指定すると無制限となります。parted_fsは割り当てるパーティションの種類です。

つまり、上記では、

* /boot

  * 最低40MB、最大100MBを割り当て
  * ext3ファイルフォーマット
  * 優先度はもっとも高い

* /

  * 最低500MB、最大10^9MBを割り当て
  * ext3ファイルフォーマット
  * 優先度もっとも低い

* swap

  * 最低64MB、最大メモリサイズの300%(3倍)のサイズを割り当て
  * swap領域
  * 優先度は2番めに高い

ということになります。

GPT対応した書き方
-----------------

GPTの場合、1MBのbiosgrubという領域が必ず必要になります。これを忘れると、preseedでの自動インストールの途中、パーティショニングのところで失敗してしまいます。また、$gptonly{ }というパラメータも必要になります。

.. code-block:: bash

   d-i partman-auto/expert_recipe string \
   32 32 32 free \
   $gptonly{ } \
   $primary{ } \
   $bios_boot{ } \
   method{ biosgrub } \
   . \
   boot-root :: \
   300 50 300 ext4 \
   $gptonly{ } \
   $primary{ } $bootable{ } \
   method{ format } format{ } \
   use_filesystem{ } filesystem{ ext4 } \
   mountpoint{ /boot } \
   . \
   500 10000 -1 ext4 \
   $gptonly{ } \
   method{ format } format{ } \
   use_filesystem{ } filesystem{ ext4 } \
   mountpoint{ / } \
   . \
   8192 512 8192 linux-swap \
   $gptonly{ } \
   $primary{ } \
   method{ swap } format{ } \
   .


上記での場合、1MBのbiosgrub領域、300MBの/boot、8GBのswap領域、そして残りはすべて / ファイルシステムになる、ということです。この辺は、 `Re: GPT preseed [ almost solved ] <http://lists.debian.org/debian-user/2012/06/msg00119.html>`_ に掲載されています。なお、2TB未満のシステムであってもこれはそのまま使えます。(もしかしたら、そのまま使えるのはUEFI対応の機器だけかも知れませんが、その点は未検証です。)

さあ、これでもう迷わず preseed でパーティショニングの一番面倒な設定部分を書けるようになりましたね。おめでとうございます。

さーて、明日のAdvent Calendarは？
---------------------------------

さあ、誰なんでしょうね。俺にも書かせろ、という方はぜひAdvent Calendarに参加してみてください。

See also
--------

* `付録 B. preseed を利用したインストールの自動化 <http://www.debian.org/releases/stable/amd64/apb.html.ja>`_
* `事前設定ファイルのサンプル <http://www.debian.org/releases/squeeze/example-preseed.txt>`_
* `Re: GPT preseed [ almost solved ] <http://lists.debian.org/debian-user/2012/06/msg00119.html>`_

.. author:: default
.. categories:: Debian
.. tags:: preseed,DebianUbuntuAdvent2012,GPT,Ubuntu
.. comments::
