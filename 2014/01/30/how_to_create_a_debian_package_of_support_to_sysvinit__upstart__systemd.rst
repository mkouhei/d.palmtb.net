How to create a Debian package of support to sysvinit, upstart, systemd
=======================================================================

最近、サイボウズラボさんが開発した、yrmcdsというmemcached互換のKVSをDebianパッケージにして、main入りしました。 [#]_ 
いつもパッケージスポンサーをお願いしている `岩松さん <https://twitter.com/iwamatsu>`_ 、upstreamの `山本さん <https://twitter.com/ymmt2005>`_ のご協力のおかげです。
特に問題なければ、Ubuntuの次のLTSにも取り込まれるのではないかと思います。
お二人には、この場を借りてお礼申し上げます。

Python以外で、また、デーモンのパッケージ化は今回初めて行いました。 [#]_ sysvinitだけでなく、upstart, systemd対応も行ったので、デーモンのDebianパッケージを作成する場合のsysvinit, upstart, systemd対応の方法についてメモを残します。

sysvinit対応
------------

sysvinitの対応は、dh_makeコマンドで生成されるテンプレートのdebian/init.dを使います。シングルバイナリパッケージの場合、ファイル名はdebian/init.dのままでも良いのですが、マルチバイナリパッケージの場合には、バイナリパッケージの名前をprefixにつけて、debian/<パッケージ名>.initのように変更します。yrmcdsのinit.dは `sources.debian.net <http://sources.debian.net>`_ の次のURLで確認できます。 [#]_

http://sources.debian.net/src/yrmcds/1.0.3-4/debian/yrmcds.init

check_for_upstart関数を定義し、/lib/lsb/init-functionsで定義されているinit_is_upstart関数を使って、upstartを使っている場合は、このスクリプト（つまり/etc/init.d/yrmcds)が実行されないようにしています。

upstart対応
-----------

upstartはテンプレートがありません。ファイル名は、debian/<パッケージ名>.upstartとして、upstart scriptを用意します。yrmcdsの場合、upstream側でetc/upstartが用意されています。upstreamのupstart scriptは、keepalivedの制御が入っていますが、Debianパッケージとしてはkeepalivedに依存するわけではないので、この部分はコメントアウトして、 `debian/yrmcds.upstart <http://sources.debian.net/src/yrmcds/1.0.3-4/debian/yrmcds.upstart>`_ としました。

systemd対応
-----------

systemdの場合は、debhelperのadd onとして、dh-systemdが用意されています。
ですので、まず、 `debian/control <http://sources.debian.net/src/yrmcds/1.0.3-4/debian/control>`_ のBuild-Dependsに、dh-systemdを追記します。

.. code-block:: ini

   Build-Depends: debhelper (>= 8.0.0), (snip), dh-systemd (>= 1.5), (snip)

次に、 `debian/rules <http://sources.debian.net/src/yrmcds/1.0.3-4/debian/rules>`_ の%ターゲットのdhコマンドのオプションとして、systemdを追記します。

.. code-block:: make

   %:
        dh $@ --with quilt,systemd

systemd用の設定ファイルは、upstartと同様テンプレートは用意されていません。debian/<パッケージ名>.serviceとして用意します。`debian/yrmcds.service <http://sources.debian.net/src/yrmcds/1.0.3-4/debian/yrmcds.service>`_ として作成します。

上記のみで、あとはdh-systemdが良きように設定してくれるのですが、これだけではpurge(apt-get purge)の時に残骸が残ります。
ですので、 `postrm <http://sources.debian.net/src/yrmcds/1.0.3-4/debian/yrmcds.postrm>`_ で下記のファイルを削除します。

* /etc/systemd/system/yrmcds.service
* /etc/systemd/system/multi-user.target.wants/yrmcds.service
* /var/lib/systemd/deb-systemd-helper-enabled/yrmcds.service.dsh-also
* /var/lib/systemd/deb-systemd-helper-enabled/multi-user.target.wants/yrmcds.service
* /var/lib/systemd/deb-systemd-helper-masked/yrmcds.service

initの切替
----------

debuildして作成したパッケージは、最小構成で作っておいたSidのVMを使ってテストを行います。パッケージ側ではsysvinit, upstart, systemdの切替の際に特に設定をすることはありません。
Debianはデフォルトではsysvinitになっているので、sysvinitからの切替が必要になります。upstartの場合は、upstartパッケージをインストールするだけで、sysvinitから自動的に切り替わります。
一方、systemdの場合は、systemdパッケージをインストールするだけでは、切り替わりません。今はブートローダーにGRUBを使っていることがほとんどだと思いますが、/etc/default/grubの **GRUB_CMDLINE_LINUX_DEFAULT** に **init=/lib/systemd/systemd** を追記し、 **update-grub** を実行する必要があります。 [#]_


.. rubric:: Footnotes

.. [#] 2014/01/30現在のバージョンは 1.0.3-4 で、対応アーキテクチャは、linux-anyです。
.. [#] 某所のローカルアーカイブ用には、FlaskやDjangoアプリ用にsysvinit対応のパッケージは作成していましたが、公式パッケージとしては初めてです。
.. [#] 現状ではテンプレートの不要な処理をコメントアウトしただけの箇所が多いので、次のアップデートの時に削除する予定です。
.. [#] https://wiki.debian.org/systemd#Issue_.231:_sysvinit_vs._systemd-sysv


.. author:: default
.. categories:: Debian
.. tags:: sysvinit, upstart, systemd, yrmcds
.. comments::
