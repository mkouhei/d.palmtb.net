Upgraded Squeeze to Wheezy LXC host and containers
==================================================

長らくSqueezeで動かしていた、さくらのVPSのLXCのホスト＆コンテナをWheezyにアップグレードしたので、その時のメモです。

うちのLXCは、Lennyの時のユーザランド管理ツールが 0.6.5 頃から使っている (:doc:`/2009/10/31/020431`) 秘伝のタレみたいなやつ [#]_ なので、安定稼働して当たり前で、最近の事情はあまり知らないのですが、最近、LXC流行っているみたいですね。 [#]_

今回の味付け変更のトピック
--------------------------

で秘伝のタレはDebianのバージョンアップのタイミングで味付けが変わるのですが、LennyからSqueezeの時はそんなに大きな違いはなかったのですが、今回のSqueezeからWheezyに変わったタイミングで、地味ですが一つ嬉しい変更がありました。 [#]_ それは、コンテナのconfigに、"lxc.network.ipv4.gateway"を追加すると、default gatewayが自動設定されるということです。 [#]_ これ、使い始めた当時(2009年ごろ)欲しかった機能の一つでした。 [#]_ 便利になったものですね。


今回のアップグレードのまとめ
----------------------------

では、今回やったアップグレードのメモを残しておきます。
テスト自体は、さくらのVPSで稼働中のVMイメージを、さくらのクラウドにアーカイブし、そのアーカイブからさくらのクラウドで起動し、そのイメージでアップグレードテストを行いました。

共通
~~~~

* apt-get update && apt-get upgrade後、apt lineを変更してapt-get upgrade && apt-get dist-upgrade
* sysstatのデータは互換性がないので削除し、debconfの設定はメンテナバージョンを使用
* /etc/sudoersはメンテナバージョンを使用し、普段管理用に使用しているユーザをあとでsudoグループに追加
* /etc/logrotate.d/rsyslog は現状のままにしておき、あとで下記を変更

.. code-block:: diff

   -               invoke-rc.d rsyslog reload > /dev/null
   +               invoke-rc.d rsyslog rotate > /dev/null

* /etc/rsyslog.conf も現状のままにし、あとで下記を変更

.. code-block:: diff

   -*.emerg
   +*.emerg                                :omusrmsg:*

ホスト
~~~~~~

* lxc が 0.7.2-1 から 0.8.0~rc1-8+deb7u2 にアップグレード
* Squeezeではカーネルオプションを変更してビルドした Linux Kernel 2.6.39.4を使っていたので、パッケージのアップデート完了後、再起動前に linux-image-3.2.0-4-amd64 をインストールし、それをGRUB_DEFAULTで指定、update-grubを実行
* ネットワーク関連の設定は、post-upでシェルスクリプトでブリッジの設定をやっていたのですが、それをやめ、interfacesを下記のように変更。

.. code-block:: ini

   auto lo
   iface lo inet loopback

   # The primary network interface
   allow-hotplug br0
   iface br0 inet static
       bridge_ports eth0
       bridge_fd 0
       address 192.0.2.100
       netmask 255.255.255.0
       gateway 192.0.2.1


nginx用のコンテナ
~~~~~~~~~~~~~~~~~

* /etc/logrotate.d/nginx をメンテナバージョンを使用するようにし、後ほど、rotate回数を 52から 365に変更
* 他は無し

CouchDB用のコンテナ
~~~~~~~~~~~~~~~~~~~

* CouchDBはもともと1.2.0-1のバックポートを使用していたので、アップグレードのタイミングで、backports.debian.orgのAPT lineをコメントアウトしただけ。
* /etc/login.defsをメンテナバージョンを使用するように変更

redmine用のコンテナ
~~~~~~~~~~~~~~~~~~~

* mysql

  * /etc/mysql/my.cnfはメンテナバージョンを使用
  * debconfでrootのパスワードは変更しない

* dist-upgradeでpostfixのアップグレードが失敗したので、再度upgrade実行することで正常にアップグレード
* RubyGemでインストールしたredmine 1.2.1が稼働しており、DBにはMySQLを使用していましたが、Wheezyにするとこれは動かなくなる。

  * なので、これをDebianパッケージ( 1.4.4+dfsg1-2+deb7u1 ) に変更
  * redmine, redmine-mysqlパッケージをインストール

	* debconfの設定ではredmine/instances/defaultのDBをdbconfig-commonで設定
	* DBにはmysqlを選択
	* 既存のredmine用の管理権限ユーザのパスワードを設定

  * これだけでは実はだめなので、インストール完了後に、dpkg-reconfigure -plow redmineを実行

	* 管理者名をrootからredmineに変更
	* DB名をredmine_defaultからredmineに変更
	* /opt/redmineが/opt/redmine-1.2.1へのsymlinkになっているので、これをDebianパッケージの/usr/share/redmineへのsymlinkに変更
	* apache2を再起動すればアップグレード完了

Rails用のコンテナ
~~~~~~~~~~~~~~~~~

* Apacheの設定が変更になり、/etc/apache/httpd.confが削除されたため、/etc/apache/apache2.confの207行目のInclude httpd.confを削除
* アップグレード時に/var/wwwのowner, groupが変更されてしまうため、Passenger用のowner, groupに変更する

余談
----

コンテナを止めずにホストのアップグレードをしてしまったので、稼働中のカーネルではlxcのwheezyのバージョンに対応しておらず、ホストのカーネル再起動のときにコンテナも一緒に（自動的に）停止する、ということになってしまったですが、ホスト再起動後、前述のlxc.network.ipv4.gatewayを設定していなかったのにも関わらず、コンテナを起動してもなぜかdefault gatewayが設定される、という現象が発生しました。 [#]_ アップグレード前に正常停止させなかったから停止前の状態が残っていたのかもしれません。


ちなみに、このブログの冒頭の話をFaebookに書いたら、ITエンジニアではない方から「宇宙語？」と突っ込まれたのが本日のトピックです。w

追記
----

アップグレード後に新たにコンテナを追加したら、

.. code-block:: ini

   lxc.cap.drop = sys_module mac_admin mac_override sys_time

が追加されていたので、既存のコンテナにも追加しました。日本語でのCapability関連は tenforward さんの `メモ <http://guinan.ten-forward.ws/wiki/doku.php?id=lxc:%E5%AE%9F%E9%A8%93%E3%83%A1%E3%83%A2#cap%E9%96%A2%E4%BF%82>`_ が詳しいです。

.. rubric:: Footnotes

.. [#] ちなみに、Lennyの時は当然さくらのVPSではありませんでしたが、さくらのVPSに移行するときには、Lennyで使っていたLXC関連の設定とコンテナのrootfsはそのままそっくり移行しました。
.. [#] というかDockerですかね。
.. [#] まぁ、今までと挙動が変わったでハマった原因でもあります。
.. [#] 裏を返せば、秘伝のタレの我が家のコンテナは、/etc/network/interfacesにgateway設定していたのだから(ry
.. [#] 当時は、debootstrapでrootfsを作ったあと、コンテナ起動前に/path/to/container/rootfs/etc/network/interfaces を変更する、ということをやっていた訳です。
.. [#] なのでコンテナを一度停止してから再度稼働させるとデフォルトゲートウェイが設定されておらずハマった、という…。

.. author:: default
.. categories:: Debian
.. tags:: Lenny,Squeeze,Wheezy,lxc,redmine
.. comments::
