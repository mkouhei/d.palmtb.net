I have user registration to HP Helion Public Cloud in order to use the Swift
============================================================================

自分で作っているバックアップ用のツール(`backup2swift <https://github.com/mkouhei/backup2swift>`_)とそのライブラリ(`swiftsc <https://github.com/mkouhei/swiftsc>`_)のIdentity API v3対応のため、KeyStoneとSwiftの環境を作るのが面倒だったのでHP Helion Public Cloudに登録してみました、という使ってみた系のお話です。

結論からいうと、 `OpenStack Days Tokyo 2015 <http://openstackdays.com/>`_ で個人情報と引き換えにもらった

.. raw:: html

   <div class="amazlet-box" style="margin-bottom:0px;"><div class="amazlet-image" style="float:left;margin:0px 12px 1px 0px;"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B00SV4V33K/palmtb-22/ref=nosim/" name="amazletlink" target="_blank"><img src="http://ecx.images-amazon.com/images/I/519BVxgV-yL._SL160_.jpg" alt="OpenStackクラウドインテグレーション オープンソースクラウドによるサービス構築入門" style="border: none;" /></a></div><div class="amazlet-info" style="line-height:120%; margin-bottom: 10px"><div class="amazlet-name" style="margin-bottom:10px;line-height:120%"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B00SV4V33K/palmtb-22/ref=nosim/" name="amazletlink" target="_blank">OpenStackクラウドインテグレーション オープンソースクラウドによるサービス構築入門</a><div class="amazlet-powered-date" style="font-size:80%;margin-top:5px;line-height:120%">posted with <a href="http://www.amazlet.com/" title="amazlet" target="_blank">amazlet</a> at 15.08.31</div></div><div class="amazlet-detail">翔泳社 (2015-01-28)<br />売り上げランキング: 40,426<br /></div><div class="amazlet-sub-info" style="float: left;"><div class="amazlet-link" style="margin-top: 5px"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B00SV4V33K/palmtb-22/ref=nosim/" name="amazletlink" target="_blank">Amazon.co.jpで詳細を見る</a></div></div></div><div class="amazlet-footer" style="clear: left"></div></div>

この本の最初の方で紹介されているHP Helion Public Cloudの登録方法を見れば分かるはずだと思います。 [#]_

手間取った点
------------

ユーザーアカウント登録時
~~~~~~~~~~~~~~~~~~~~~~~~

一つは、ユーザーアカウント登録の時。まず、contact infoの登録で住所の部屋番号を間違えて登録した記憶がありました。
その後支払い情報を登録するときにも、住所を登録する必要があります。この時には正しく入力しました。
その登録直後に表示されたメッセージには、セキュリティ上の問題があるやらなんやらで確認するのにしばらくかかるよ、みたいな内容が表示されました。なので住所間違えたのがまずかったかな？と思ったわけですが、しばらく(10分くらい?)したらaccount activatedのメールが来たので、メール来るまでの間、なんか面倒なことになってないだろうか嫌だなぁ、ともやもやしていただけで、結果的には杞憂に過ぎませんでした。 [#]_

Identity API用の情報確認
~~~~~~~~~~~~~~~~~~~~~~~~

Identity API v2.0 とv3とで、エンドポイント以外に、認証に必要な情報が異なるため、Helionのダッシュボードから探すのに手間取りました。
前者ではユーザー名はユーザーアカウント登録時に設定した ``User Name`` 、パスワード、および自動生成される ``Project Name`` 、後者では User Nameと対で自動生成される ``User ID`` と自分で設置したパスワード、および やはり自動生成される ``Project ID`` となんか微妙に異なります。ぱっとみ ``Project Name`` は ``Project ID`` に ``-Project`` というSuffixを付与すればええんだな、と思ってよく見たら実は違うし。

そういえば、Horizonの画面触ったのはEssex以来で、今同じ部門で進んでいるOpenStackの導入にはまーったく絡んでいないですし [#]_　。
あとIdentity API v3を触ってたのも v3 がリリースされる前の時だったしなぁ、という言い訳をしておきます。

ConoHaは？
~~~~~~~~~~

Helion登録する前に `ConoHa by GMO <https://www.conoha.jp/>`_ でもよいかなと思ったのですが、こちらは `まだ Identity API v2.0のみでv3には対応していません <https://www.conoha.jp/docs/identity-get_version_list.html>`_ でした。残念。


気になっている点
----------------

アカウント削除後、再登録できるのか？
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Helion は3ヶ月は無料となっているのですが、既に `対応 <https://pypi.python.org/pypi/swiftsc/0.7.0>`_ は `済んだ <https://pypi.python.org/pypi/backup2swift/0.9.3>`_ ので、ほったらかして忘れてしまい課金されてた！というのを避けるために、もう解約しようと思っているのですが、また何らかの理由で必要になったときに、再度新規登録すればまた使えるのかなぁ、というところですね。無料試用期間も復活するとさらに良いのですが。

そういえば日本語情報無いですね
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

HP Helion関係の日本人エンジニアの方、いると思っているのですが日本語ブログとか無いなぁ、と気づいたのですが、HP Helion Pubilc Cloudを売るのが仕事ではないからなんでしょうかね、と勝手にトスを上げてみて、終わります。

.. rubric:: footnote

.. [#] 職場で同僚に貸してしまっていて、手元に無いので実際に登録するときにはこの本見てません。
.. [#] 実際にこの後contact infoを確認したらやっぱり住所間違えていました。
.. [#] 私はというと、5月から引き継いだシステムのいわゆる「技術的負債の返済」を先週までやっていました。

.. author:: default
.. categories:: Cloud
.. tags:: Python,Swift,OpenStack
.. comments::
