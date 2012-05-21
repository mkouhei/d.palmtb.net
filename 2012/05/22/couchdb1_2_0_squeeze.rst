CouchDB 1.2.0をようやく導入した話。
==============================================================

CouchDB 1.2.0がリリースされて早一ヶ月。なかなか導入する暇が無かったので放置していました。が、さくらのVPSの移行のタイミングで1.1.0で動かしている :doc:`こまちゃん監視カメラのビューワ </2011/07/12/181629>` を1.2.0にすることにしました。

`こまちゃん監視カメラ <https://github.com/CouchDB-JP/watchcat>`_ の現在の仕様はWebカメラでひたすら動体検知や明度の変化を検知した瞬間の写真をJSONに変換してCouchDBに保存し、不連続での過去10時間分を閲覧できるものです。昨年の震災をきっかけにした不在中のこまちゃんの様子を確認するためのツールなので、古い画像は必要ありません。が、画像及び画像を内部ドキュメントとして格納したドキュメントは定期的に削除していません。1画像あたり8-10KB程度なのでスマホでも簡単に確認できるのでますが、塵も積もればなんとやらで、移行時点で既に4GBを超える量。さくらのVPS 512では20GBのディスクで、LXCでのDebianのコンテナが5,6個動かしていたので圧縮して移行する余裕はありません。なので、新しくSqueezeのコンテナを作り、そこでDebianパッケージを作ることにしました。

Debianパッケージの作成事前準備。
------------------------------------------------------

CouchDBのビルドに必要なパッケージを手っ取り早くインストールするために、SqueezeのCouchDB 0.11.0に依存するビルド環境を整えます。

.. code-block:: bash

   $ sudo apt-get build-dep couchdb

次にCouchDBのソースパッケージをダウンロードします。

.. code-block:: bash

   $ apt-get source couchdb

devscriptsのuscan && uupdateでCouchDBのソースパッケージをアップデートしてみましたが、残念ながらSidでの1.1.1までしかアップグレードされません。原因は1.2.0からパスが変更されたため、debian/watchのパスと異なるためです。下記のように書き換えます。

.. code-block:: diff

   $ diff -u a/debian/watch b/debian/watch 
   --- a/debian/watch      2012-05-22 01:22:34.000000000 +0900
   +++ b/debian/watch      2012-05-22 01:22:39.000000000 +0900
   @@ -1,3 +1,3 @@
    version=3
   
   -http://www.apache.org/dist/couchdb/([\d\.]+)/apache-couchdb-([\d\.]+)\.tar\.gz
   +http://www.apache.org/dist/couchdb/releases/([\d\.]+)/apache-couchdb-([\d\.]+)\.tar\.gz

変更したら、ソースパッケージをアップグレードします。

.. code-block:: bash

   $ uscan
   couchdb: Newer version (1.2.0) available on remote site:
    http://www.apache.org/dist/couchdb/releases/1.2.0/apache-couchdb-1.2.0.tar.gz
    (local version is 1.1.1)
   couchdb: Successfully downloaded updated package apache-couchdb-1.2.0.tar.gz
       and symlinked couchdb_1.2.0.orig.tar.gz to it
   $ uupdate ../apache-couchdb-1.2.0.tar.gz 1.2.0
   New Release will be 1.2.0-1.
   -- Untarring the new sourcecode archive ../apache-couchdb-1.2.0.tar.gz
   Unpacking the debian/ directory from version 1.1.1-2 worked fine.
   Remember: Your current directory is the OLD sourcearchive!
   Do a "cd ../couchdb-1.2.0" to see the new package

Backportのパッケージ入手。
----------------------------------------------

CouchDB 1.2.0は、Erlang R15B以上でなければなりません。SqueezeはR14Aなのでbackports.debian.orgを使い、置き換えることにしました。/etc/apt/soruces.listに下記を追記します。

.. code-block:: sh
   
   deb http://backports.debian.org/debian-backports squeeze-backports main
   deb-src http://backports.debian.org/debian-backports squeeze-backports main

sudo apt-get updateを実行後、CouchDBのビルドに必要なパッケージを下記のようにsqueeze-backportsを指定してインストールします。


.. code-block:: bash
   
   $ sudo apt-get -t squeeze-backports install erlang-base erlang-crypto erlang-dev \
               erlang-syntax-tools autoconf erlang-eunit erlang-inets erlang-os-mon \
	       erlang-tools erlang-xmerl libjs-jquery

ソースコードを元に普通に./configure && make && sudo make installをできることを確認します。問題なくビルドできたら、いよいよDebianパッケージの作成です。

Debianパッケージのビルド。
--------------------------------------------

`実はCouchDB 1.2.0はJavaScriptエンジンとして、Spidermonkeyの1.8.5が必要 <http://yasu-2.blogspot.jp/2012/05/debian-wheezycouchdb-120.html>`_ です。が、Squeezeにも、Backportsにもありません。Sidにはlibmozjs185-1.0, libmozjs185-devがパッケージになっているので、Sidの環境でソースパッケージを取得し、ビルドに必要なパッケージをインストール後、このソースパッケージを使ってSqueeze向けのlibmozjs185を作ります。


.. code-block:: bash

   $ sudo apt-get install libffi-dev zip pkg-kde-tools
   $ debuild
   $ sudo dpkg -i ../libmozjs185-1.0_1.8.5-1.0.0+dfsg-3_amd64.deb \
		../libmozjs185-dev_1.8.5-1.0.0+dfsg-3_amd64.deb


ビルドしてできたlibmozjs185パッケージをインストールしたら、CouchDBのビルドを行います。debian/ディレクトリ以下のファイルの設定が一部不足しているので、以下のようにしました。


debian/control
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: diff

   $ diff -u couchdb-1.1.1/debian/control  couchdb-1.2.0/debian/control 
   4,5c4,5
   < Maintainer: Erlang Packaging Team <pkg-erlang-devel@lists.alioth.debian.org>
   < Uploaders: Sergei Golovan <sgolovan@debian.org>, Sam Bisbee <sbisbee@computervip.com>, Elliot Murphy <elliot@ubuntu.com>
   ---
   > Maintainer: Kouhei Maeda <mkouhei@palmtb.net>
   > Build-Depends: debhelper (>= 7.0.50~), autotools-dev, erlang-eunit, erlang-base, erlang-crypto, erlang-dev, erlang-syntax-tools, autoconf, libmozjs185-dev, cdbs
   7,9d6
   < Build-Depends: cdbs (>= 0.4.42), debhelper (>= 7.2.11),
   <  erlang-dev (>= 1:13.b.1-dfsg-3), help2man, libcurl4-openssl-dev,
   <  libicu-dev, libmozjs-dev, libreadline-dev
   11,12d7
   < Vcs-Svn: svn+ssh://svn.debian.org/svn/pkg-erlang/couchdb
   < Vcs-Browsern: http://svn.debian.org/viewsvn/pkg-erlang/couchdb
   16,17c11,12
   < Depends: ${misc:Depends}, ${shlibs:Depends}, ${erlang:Depends},
   <  ${erlang-abi:Depends}, adduser, libjs-jquery, lsb-base, procps, mawk
   ---
   > Depends: ${shlibs:Depends}, ${misc:Depends}, ${erlang:Depends},
   >  ${erlang-abi:Depends}, adduser, libjs-jquery, lsb-base, procps, mawk, libmozjs185-1.0
   29c24
   <  languages and environments.
   ---
   >  languages and environments.


debian/rules
~~~~~~~~~~~~

DEB_CONFIGURE_USER_FLAGの指定が肝ですね。

.. code-block:: diff

   $ diff ../couchdb-1.1.1/debian/rules  debian/rules 
   15a16,17
   > DEB_CONFIGURE_USER_FLAGS += \
   >        --with-js-lib-name=mozjs185
   34a37
   >       mkdir -p debian/couchdb/usr/share/lintian/overrides/
   39,41c42,44
   <       chmod 660 debian/couchdb/etc/couchdb/local.ini
   <       chmod 750 debian/couchdb/var/lib/couchdb
   <       chmod 750 debian/couchdb/var/log/couchdb
   ---
   >       chmod 664 debian/couchdb/etc/couchdb/local.ini
   >       chmod 755 debian/couchdb/var/lib/couchdb
   >       chmod 755 debian/couchdb/var/log/couchdb


/etc/init/coudhb.tpl.inの修正
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: diff

    $ quilt diff | sed 's/^/    /g'
    Index: couchdb-1.2.0/etc/init/couchdb.tpl.in
    ===================================================================
    --- couchdb-1.2.0.orig/etc/init/couchdb.tpl.in      2012-05-20 01:02:37.495545236 +0900
    +++ couchdb-1.2.0/etc/init/couchdb.tpl.in   2012-05-20 01:09:00.859545321 +0900
    @@ -84,6 +84,7 @@
         # Start Apache CouchDB as a background process.
     
         mkdir -p "$RUN_DIR"
    +    chown "$COUCHDB_USER":"$COUCHDB_USER" "$RUN_DIR"
         command="$COUCHDB -b"
         if test -n "$COUCHDB_STDOUT_FILE"; then
             command="$command -o $COUCHDB_STDOUT_FILE"


これでdebuildし、できたパッケージをインストールすれば、上記のリンク先の問題もクリアした上でSqueeze向けの 1.2.0を使えるようになります。

.. author:: default
.. categories:: Ops
.. tags:: Debian, CouchDB
.. comments::
