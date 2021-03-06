自宅サーバから始まったDebianとのお付き合い
==========================================

この記事は「 `自宅サーバの思い出 Advent Calendar 2016 <http://www.adventar.org/calendars/1587>`_ 」、 `８日目 <http://www.adventar.org/calendars/1587#list-2016-12-08>`_ のエントリです。

いろいろ記憶が曖昧なところがありますが、思い出を振り返ってみました。

----

自宅サーバ事始め
----------------

自宅サーバを始めたのは、社会人になった頃、仕事と関係なくJavaとかXMLとかを独学で勉強しながら、なんか作って公開したいな、と思ったのがきっかけでした。当時、Windows 2000をデスクトップで使っており、ライセンス的に無理だったので、ベアボーンで RedHat 9か VineLinuxあたりをインストールしたような記憶。GNU/Linuxを使い始めたのもこれが最初。いくつかディストリビューションを試して、インストーラーと、パッケージ管理の操作性が簡単だったことから、VineLinuxを使うようになった記憶。もう15年くらい前になると記憶が定かではないですね。

サーバ公開するのにセキュアなサーバにするのはどうしたら良いんだろう？と思ったことから、趣味も仕事もセキュリティに興味を持ち、そこからサーバやネットワーク絡みの構築＆運用が中心になっていったのは余談。 [#]_

ベアボーンにする、のはやめた
----------------------------

当初は、ベアボーンで使うときだけ起動していました。で、じきに常時稼働を始めようとして、すぐにやめました。理由は、 **うるさいから** 。当時1Kロフト付きのアパートに住んでおり、ロフトで寝ていたのですが、狭いのでファンがうるさいので眠れないわけです。さらに、消費電力考えると電気代もかさみます。ということですぐにやめました。

OpenBlockSとの出会い
--------------------

はじめて購入したマイクロサーバーは、 `ぷらっとホームのOpenBlockS 266 <http://openblocks.plathome.co.jp/products/266/>`_ (64MBモデル）でした。オンラインショップだったのか、今は亡き、秋葉原にあった店舗だった [#]_ のか、どちらで先に購入したのかは覚えていません。どちらで？というのは、その後OpenBlockS 266は順調に５台まで増えるからです。

OpenBlockSを選んだ理由は、消費電力が小さいこと、ファンレスだったこと、Linuxだったことです。その後OpenBlockS以外のマイクロサーバーとしては、

自分で購入したのが

* `Armadillo-J <http://armadillo.atmark-techno.com/armadillo-j>`_
* `Armadillo-9 <http://armadillo.atmark-techno.com/armadillo-9>`_
* `OpenMicroServer <http://openblocks.plathome.co.jp/products/oms400/>`_ 2台
* `OpenBlockS 600 <http://openblocks.plathome.co.jp/products/600/>`_
* `玄箱 <https://ja.wikipedia.org/wiki/%E7%8E%84%E7%AE%B1>`_

譲っていただいたのが

* `OpenBlockSS <http://www.plathome.co.jp/support/labo/obssr/>`_
* `GLAN Tank <https://ja.wikipedia.org/wiki/GLAN_Tank>`_

という感じで順調に増えました。
今でも、Armadillo-J、OpenBlockS 600は現役です。（他は休眠中）

当初はセルフビルドだったんだ
----------------------------

OpenBlockS 266を使うにあたり、SSD/Linuxが割と使いやすかったのでそのまま、クロスコンパイルを環境を作ろうとしました。

もともとWindows 2000を入れていたPCをデュアルブートにして、何らかのGNU/Linuxディストリビューションをインストールしていました。多分、当時は巡りめぐって結局Vine Linuxを使っていたように記憶しています。が、ライブラリのバージョン絡みでうまくできなかったので、OpenBlockS自体でセルフビルド行っていました。

ApacheとかPostfix、SpamAssassin、Hobbitはまあそんなに時間がかからなかったのですが、PostgreSQLが確か６〜８時間、NET-SNMPが１２時間オーバーだったような。ビルドしている間は放置していたのですが、まぁ、そんなのにいつまでも耐えられるわけはありません。


そしてDebianとの出会い
----------------------

ちょうどそんなときにぷらっとホームからDebianのHDDイメージが公開されました。多分2005年ごろ。

VineLinuxで(APT-RPMの) 「``apt-get`` 便利だわー。お、DebianでもAPT使えるのかー、これは使うしかないわー」と思い、OpenBlockS 266でDebianを使い始めたのがDebianとの出会い。APT-RPMがDebianのAPTから派生したものだと知るのはこの後の話です。

でちょうど同じくらいのタイミングで、OSC Tokyoで東京エリアDebian勉強会を知り、参加するようになり、OpenBlockSだけでなく、PCもDebianに変更し、という感じで基本Debianだけを使うようになりました。

自宅サーバの最初の転機
----------------------

その後、アパートから今のマンションに引っ越し、前述の通り順調にマイクロサーバーも増えていくのですが、最初に訪れた転機は妻と結婚してから猫（こまめ、こまちゃん）を飼いだしたこと。飼いだした当初はまだ生後３ヶ月程度で、色々噛むので電源コードなどを噛んで感電しないように、という対策を打つようになりました。 [#]_

* :doc:`/2009/08/17/002000`

こまちゃん対策ではさらに、3.11のとき、妻と二人して帰宅できなかったことから、OpenBlockS 600を使って、こまちゃん監視カメラを作りました。

* :doc:`/2011/03/14/024742`
* :doc:`/2011/07/12/181629`


自由に置けなくなる
------------------

次の転機としては、長女（おまめ一号）が産まれ、ママ友が自宅を訪れるようになってからです。
前述のこまちゃん監視カメラは、こまちゃんの滞在時間が一番長いリビングに設置していたのですが、これが「監視されているようで嫌だ」と不評で、撤去する羽目に。 [#]_

さらに次女（おまめ二号）が産まれ、僅かなスペースと僅かな電力消費の節約で台数削減ということで、停止して片付けて台数減らしました。

グローバルIPアドレスが使えなくなった
------------------------------------

今のマンションに入居して結構時間が経ち、マンション全体で加入している回線の帯域が狭いこともあり、ISPの切り替えに伴い、NAT下でのプライベートIPアドレスになりました。数年前から公開サーバ自体は主にVPSにしていることもあり、特に困らないのですが、なんか書いていたらちょっとさみしくなってきました。


そして今
--------

現状動かしているのは、Armadillo-JでDHCPサーバとOpenBlockS 600でルーターを動かしています。マンションの回線入れ替え前までは、PoEで動かせるOpenMicroServerをルーター兼ファイアウォールとして動かしていたのですが、スループットの問題でOpenBlockS 600に切り替えました。

ちなみに目的が目的なので、これらはDebianではありません。現在、Debianは（公私問わず）開発環境としてのワークステーションと、公開用のサーバとしてVPSにつかっています。

OpenBlockS 600でもNAPTすると速度がかなり遅くなるので、YAMAHAルーターあたりが欲しいなぁ、と思う今日この頃です。


.. rubric:: Footnote

.. [#] 前職でプライベートクラウドの開発を行って、現職では認証や管理機能の開発をやっています。
.. [#] ２台目以降は店舗で購入していた記憶です。理由は、ジャンクパーツの Xeonのヒートシンクをおまけでもらえたので。これをOpenBlockS 266に載せて、扇風機を当てるだけで１０℃近く冷却できるのでした。
.. [#] ちなみに噛んで感電というと、大学の卒業研究で在籍していた研究室で、実験用ラットをトレッドミルで走らせていたのですが、そのうちの一匹が電極を噛んで感電死したことを思い出します。
.. [#] 動体検知での監視が目的なので、そりゃそうなんですけどね。

.. author:: default
.. categories:: Debian
.. tags:: 自宅サーバの思い出 Advent Calendar 2016,OpenBlockS
.. comments::
