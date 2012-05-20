LXCのマイグレーションを行った話。
========================================================

さくらのVPS 512から1Gに契約を切り替えで、使用しているLXCの移行を先週行いました。が、ちょいとハマったのでメモ。同じ環境の人は多分いないと思うので、同じようにハマる人は少ないと思いますが。

既存環境。
------------------

もともとの512の方は、Debian GNU/Linux LennyをインストールしSqueezeにアップグレードした環境でした。SqueezeではLXCを使うには一部カーネルオプションが無効になっているのでカーネルビルドが必要です。Linux Kernel 2.6.39.1でリビルドし、Debianパッケージで提供されているlxc 0.7.2-1を使っていました。（ :doc:`/2011/05/19/013735` ）

また、2009年に0.6.2だか0.6.3のころから、SidのDebianパッケージで使い始めていましたが、このころは自動起動の仕組みが無く、自分でスクリプト書いていたこともあり、0.7.2に存在する自動起動の仕組みは使わずに使っていました。コンテナのrootfsをインストールしていた先も、パッケージでの標準の/var/lib/lxcではなく、/lxcrootディレクトリを作りこの下にdebootstrapで作ったイメージを置いていました。


新環境。
--------------

1Gでは512を使い始めた時と違い、Squeeze用のインストール用ISOイメージが提供されています。今回はSqueezeをインストールした後、Linux Kernel 3.3.6とDebianパッケージのlxcおよび最新のlxc 0.8.0 rc1を試そうとしました。最終的には元々の環境と同じメインバージョンの、2.6.39.4、lxcはsqueezeの同じDebianパッケージを使いました。

ハマったことその1。
--------------------------------

一つは、最初にインストールしたDebianのディストリビューションの違い。LennyのカーネルではCONFIG_VIRTIO_BLKが無効になっていますが、Squeezeではこれが有効になっているので、Lennyからアップグレードした512の環境ではディスクが/dev/sdaとして認識していました。しかし1Gの環境では/dev/vdaです。1Gの環境で2.6.39.4でビルドする際に512の/boot/config-2.6.39.1をベースにしてビルドしたのですが、このカーネルでもCONFIG_VIRTIO_BLKは無効にしたままだったため、リブート時にinitramfsがrootfsを見つけられなくてブート途中で止まってしまう、という初歩的なミスでハマりました…。


ハマったことその2。
--------------------------------

二つ目は、Linux Kernelのバージョンの違いによるものです。当初、3.3.6でビルドしたカーネルを使おうとしたのですが、SqueezeのDebianパッケージとしてあるlxc 0.7.2-1でも、0.7.2-1のソースパッケージからuscan;uupdateで取得した0.8.0 rc1でも、プロセスすら起動できない、という状況。発生するエラーは、

.. code-block:: bash

   $ sudo lxc-start -n anycontainer
   lxc-start: No such file or directory - failed to rename cgroup /var/local/cgroup//lxc/11783->/var/local/cgroup//lxc/anycontainer

だったはず。2.6.39系だと、cgroup filesystemに作成されるコンテナのメタ情報は、/var/local/cgroup/anycontainerディレクトリの下ですが、3.3系だと、そのパスが変わってしまっている様子。5/19で期間延長が終了予定で、原因追求している時間もとれないので、3.3.6で使うのは今回は諦めました。敗北…。

ハマったことその3。
--------------------------------

3.3系でダメだった際にlxc-0.8.0-rc1のDebianパッケージを作成したので、これも3.3系だけでなく、2.6.39.4で試して見ました。が、こっちもダメ。こちらのエラーも、

.. code-block:: bash

   $ sudo lxc-start -n anycontainer
   lxc-start: No such file or directory - failed to rename cgroup /var/local/cgroup//lxc/11783->/var/local/cgroup//lxc/anycontainer

なので、3.3系は0.8以降で使えるようになるはず？

環境できてれば後は楽。
------------------------------------

コピー先のLXCの環境さえできてしまえば、512の方でlxc-freezeし、コンテナのrootfsとconfig含んだディレクトリをtarballにし、伸長します。コンテナの設定ファイル(anycontainer/config)のうち、

* lxc.rootfs
* lxc.mount.entry=proc
* lxc.mount.entry=devpts
* lxc.mount.entry=sysfs

の4ヶ所のパスを/lxcrootにしていたところを、Debianパッケージのデフォルトの/var/lib/lxcに変更し、次のコマンドを実行します。

.. code-block:: bash

   $ sudo lxc-create -n anycontainer -f /tmp/anycontainer/config -t debian

を実行すると、/var/lib/lxcディレクトリ下にanycontainer/{config,rootfs}がコピーされます。ホストの起動時に自動起動させるには、/var/lib/lxc/anycontainer/configを、/etc/lxc/anycontainer.confにコピーし、/etc/default/lxcを下記のように変更すれば、OKです。

.. code-block:: ini

   RUN=yes <- コメントを外す
   CONF_DIR=/etc/lxc
   CONTAINERS="anycontainer" <-/etc/lxc/ディレクトリ下に置いた*.confのうち、起動させたいコンテナを'.conf'を取り除いた形で列挙する。複数ある場合はスペース区切り


.. author:: default
.. categories:: Ops
.. tags:: lxc, Debian
.. comments::
