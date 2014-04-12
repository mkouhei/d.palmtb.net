How to build custom Debian package automatically by Jenkins
===========================================================

以前、OpenSSH LDAP Public key パッチ(openssh-lpk)を、Ubuntu 12.04 LTS(Precise)とDebian GNU/Linux WheezyのそれぞれのOpenSSHに適用したカスタムビルドパッケージを作りました。 [#]_  [#]_
OpenSSHのパッケージが更新される度に、

#. このパッチを適用し
#. pbuilderを使ってPrecise, Wheezyでビルド
#. 実環境にインストールしてテスト
#. GPG key sign
#. reprepro管理下のローカルアーカイブに登録

するという作業を行っています。といっても、PreciseやWheezyでもOpenSSHのパッケージ自体のアップデートが最近までほとんどなかったので、手動でメンテナンスを行っていたのですが、この1ヶ月くらいで何回かアップデートがあったことや、先日Jenkinsを作ったこと (:doc:`/2014/03/27/issue_deploying_jenkins_to_tomcat7_debian_package_in_wheezy`)もあったこと、職場で私以外に作業できる人がいない、という問題があるので、Jenkinsでビルドするようにしました。

OpenSSHパッケージのDebianバージョンとOpenSSH LPKパッチの関係
------------------------------------------------------------

これを図にすると下記のようになります。
Debianのパッケージが更新されるたびに、”+cust1”を付加したバージョンをリリースするわけです。

.. graphviz::

   digraph changelog {
   node [fontsize="10"];
   edge [fontsize="10"];

   w2c[label="1:6.0p1-4+deb7u2+cust1", style=dotted, fontcolor="#888888"];
   w2[label="1:6.0p1-4+deb7u2", style=dotted, fontcolor="#888888"];
   w1c[label="1:6.0p1-4+deb7u1+cust1"];
   w1[label="1:6.0p1-4+deb7u1"];
   w0c[label="1:6.0p1-4+cust1"];
   w0[label="1:6.0p1-4"];
   w2 -> w2c [style=dotted, label="apply openssh-lpk"];
   w1 -> w1c [label="applied openssh-lpk"];
   w0 -> w0c [label="applied openssh-lpk"];
   w2 -> w1 [style=dotted, dir=back];
   w1 -> w0 [dir=back];
   {rank = same; w0; w0c}
   {rank = same; w1; w1c}
   {rank = same; w2; w2c}
   }

Preciseの場合も基本的に同じです。

.. graphviz::

   digraph changelog {
   node [fontsize="10"];
   edge [fontsize="10"];

   u4c[label="1:5.9p1-5ubuntu1.4+cust1", style=dotted];
   u4[label="1:5.9p1-5ubuntu1.4", style=dotted];
   u3c[label="1:5.9p1-5ubuntu1.3+cust1"];
   u3[label="1:5.9p1-5ubuntu1.3"];
   u2c[label="1:5.9p1-5ubuntu1.2+cust1"];
   u2[label="1:5.9p1-5ubuntu1.2"];
   u1c[label="1:5.9p1-5ubuntu1.1+cust1"];
   u1[label="1:5.9p1-5ubuntu1.1"];
   u0c[label="1:5.9p1-5ubuntu1+cust1"];
   u0[label="1:5.9p1-5ubuntu1"];
   u4 -> u4c [label="apply openssh-lpk", style=dotted];
   u3 -> u3c [label="applied openssh-lpk"];
   u2 -> u2c [label="applied openssh-lpk"];
   u1 -> u1c [label="applied openssh-lpk"];
   u0 -> u0c [label="applied openssh-lpk"];
   u4 -> u3 [style=dotted, dir=back];
   u3 -> u2 -> u1 -> u0[dir=back];
   {rank = same; u0; u0c}
   {rank = same; u1; u1c}
   {rank = same; u2; u2c}
   {rank = same; u3; u3c}
   {rank = same; u4; u4c}
   }

pbuilderのイメージ準備
----------------------

Jenkinsを動かしているのは前回の通りWheezyなので、Wheezy用のbase.tgzは次のように作成します。

.. code-block:: sh

   $ sudo pbuilder --create --distribution wheezy --basetgz /var/cache/pbuilder/wheezy-base.tgz

一方、Precise用のbase.tgzは、別途Preciseをインストールしたサーバ上で同様に作成し、そのtarballを/Jenkins用のサーバに転送＆配置します。 [#]_

WheezyやPrecise用のbase.tgzのAPT Lineにはupdatesやsecurityのものは含まれていないので、

.. code-block:: sh

   $ sudo pbuilder --login --save-after-login --basetgz /vat/cache/pbuilder/wheezy-base.tgz

でchroot環境にログインし、変更しておきます。 [#]_
また、合わせて、repreproで作成したローカルアーカイブ用のGPG公開鍵をapt-key addコマンドで追加しておきます。

パッチ置き場と一次ビルドの出力先の作成
--------------------------------------

openssh-lpkパッチと、debian/rulesのパッチをを任意のWebサーバにWheezy用、Precise用とそれぞれ用意しました。下記のようなURLです。

* http://repo.example.org/wheezy/openssh-lpk.patch
* http://repo.example.org/wheezy/rules.patch
* http://repo.example.org/precise/openssh-lpk.patch
* http://repo.example.org/precise/rules.patch

また、一次ビルドで出力するソースパッケージは、/var/tmp/resultディレクトリを作成し、後述のスクリプトでそこに出力するようにします。

.. code-block:: sh

   $ sudo install -d -o tomcat7 -g tomcat7 --mode 0700 /var/tmp/result

一次ビルド、といっているのはパッチを適用した状態で、一度debuildを実行して出力されるソースパッケージのことです。その出力されたソースパッケージを用いて、pbudilerでクリーンビルドする、という流れです。

ソースツリーからpbuilderを実行するpdebuildコマンドを使えば、そんな面倒なことをする必要はありません。が、Wheezy上でPreciseの公開鍵をインポートしなくてはいけない点と、PreciseとWheezyとで基本的に同じ手順で行いたい、という二点から、pbuilderを2回実行する形にしました。

ジョブ用のスクリプト
--------------------

Wheezy, preciseとで基本同じなので、先頭の2行のみを環境に合わせて変更します。Wheezyの場合は、codenameをwheezy, distroにはstableにしますが、Preciseの場合には両方共preciseです。 [#]_

.. code-block:: sh

   codename=wheezy
   distro=stable
   bin_package=openssh-server
   src_package=openssh
   arch=$(dpkg-architecture -qDEB_HOST_ARCH)

   # check version
   cat << EOF > check_version.sh
   apt-cache show $bin_package | grep Version: | sort | tail -1 | grep -v +cust > /var/tmp/result/${BUILD_ID}.txt
   EOF
   sudo pbuilder --update --basetgz /var/cache/pbuilder/${codename}-base.tgz
   sudo pbuilder --execute --basetgz /var/cache/pbuilder/${codename}-base.tgz --bindmounts "/var/tmp/result /tmp" -- check_version.sh
   test -s /var/tmp/result/${BUILD_ID}.txt || exit

   deb_version=$(awk -F: '{print $3}' /var/tmp/result/${BUILD_ID}.txt)
   orig_version=$(echo $deb_version | awk -F"-" '{print $1}')

   # retrieve source package and patches
   cat << EOF > build.sh
   apt-get -qq -y install curl devscripts quilt patch libdistro-info-perl fakeroot libldap2-dev
   apt-get -qq -y build-dep $bin_package

   apt-get source $src_package

   curl -O http://repo.example.org/${codename}/openssh-lpk.patch
   curl -O http://repo.example.org/${codename}/rules.patch
   (
   export DEBFULLNAME="Auto Build"
   export DEBEMAIL=autobuild@example.org

   cd ${src_package}-${orig_version}
   echo "### applying patch ###"
   patch -p1 --dry-run < ../openssh-lpk.patch || exit 1
   patch -p1 < ../openssh-lpk.patch

   echo "### commiting patch ###"
   echo | dpkg-source --commit . openssh-lpk.patch ../openssh-lpk.patch

   echo "### update Build-Depends ###"
   sed -i 's/^\(Build-Depends: .*\)$/\1, libldap2-dev/' debian/control

   echo "### update compile options ###"
   patch -p1 --dry-run < ../rules.patch
   patch -p1 < ../rules.patch

   echo "### update changelog ###"
   dch -l+cust -D${distro} "Applied OpenSSH LPK patch."

   echo "### build package ###"
   debuild -us -uc
   )

   cp -f ${src_package}_${deb_version}+cust1.debian.tar.gz ${src_package}_${orig_version}.orig.tar.gz ${src_package}_${deb_version}+cust1.dsc /var/tmp/result/
   EOF

   sudo pbuilder --execute --basetgz /var/cache/pbuilder/${codename}-base.tgz --bindmounts "/var/tmp/result /tmp" -- build.sh

   # clean build
   sudo pbuilder --build --basetgz /var/cache/pbuilder/${codename}-base.tgz /var/tmp/result/${src_package}_${deb_version}+cust1.dsc

   # installing test
   sudo piuparts -b /var/cache/pbuilder/${codename}-base.tgz -d $codename --keep-sources-list /var/cache/pbuilder/result/${src_package}_${deb_version}+cust1_${arch}.changes

大まかな流れとしては次のとおりです。

#. カスタムビルドパッケージよりも更新されたバージョンがリリースされていないかのチェック
#. pbuilderを使い、chroot環境内でのソースパッケージとパッチの取得・適用及びビルド
#. ビルドして生成されたソースパッケージを用い、pbuilderでクリーンビルド
#. クリーンビルドしてできたパッケージを、piupartsでインストールテスト

公式パッケージで更新されてパッチ適用したバージョンよりも新しいバージョンがリリースされている場合、このジョブを実行すると、パッチ適用してビルドされたパッケージが、Jenkinsサーバの/var/cache/pbuilder/resultディレクトリ下に作成されます。

後は別のジョブでdebsignでGPG key signし、repreproのincomingディレクトリにpushすれば良いわけです。 [#]_


この記事のオチ
--------------

さて、これで自動ビルドできるようになったので楽できるわー、と思ったら、このジョブを仕込んた翌日に、
`OpenSSH 6.2 <http://openbsd.nuug.no/openssh/txt/release-6.2>`_ 以降で

* AuthorizedKeysCommand
* AuthorizedKeysCommandUser

というオプションが使えるようになったことを同僚に教えてもらいました。つまり、「もはやOpenSSH LPKなんて不要になった！」ワケです。素晴らしい。

来週リリース予定のUbuntu 14.04 LTS(Trusty)ではOpenSSH 6.6ですし、WheezyでもBackportsに6.5にあるのでわざわざこんな手の混んだことをしなくても、ミラーをすればよいのです。
なので、このジョブそのものはたった一日で不要になってしまいました。

ただし、Precise用にはWheezyのBackportsのソースパッケージをリビルドする必要があるので、今回やった事自体は役立ちそうです。このジョブに比べたら（リビルドさえちゃんと確認できれば）なんてこと無いですね。

もっと簡単にマルチディストリビューション向けに自動(カスタム)クリーンビルドする方法があれば、どなたか教えて下さい。


.. rubric:: Footnotes

.. [#] :doc:`/2012/10/29/openssh_with_public_key_managed_by_openldap`
.. [#] :doc:`/2013/06/20/applying_openssh_lpk_to_wheezy`
.. [#] cowbuildreを使うことも検討したのですが、Precise上で cowbuilder –create すると失敗するためpbuilderを使うことにしました。
.. [#] exitコマンドではなく、Ctrl + dでログアウトすると、"–save-after-login" オプションをつけていても変更が保存されないようです。
.. [#] Wheezyでは、dchコマンドの"-D"オプションでのディストリビューションの指定には、Ubuntuと違ってコードネームの"wheezy"ではなく、"stable"でないとエラーになります。
.. [#] 今回はdebsign, repreproへのpushについては書きませんが。

.. author:: default
.. categories:: Debian
.. tags:: pbuilder,Jenkins,openssh-lpk,reprepro,Wheezy,Precise,piuparts
.. comments::
