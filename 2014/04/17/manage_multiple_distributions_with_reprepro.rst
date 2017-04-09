Manage multiple distributions with reprepro
===========================================

本日Trustyがリリースされるということで、職場で使っているrepreproにTrusty用のローカルアーカイブを追加しました。
Preciseの設定をコピーして列挙すればよいだけですね。

設定内容
--------

conf/distributions
~~~~~~~~~~~~~~~~~~

preciseの部分をtrustyに変えて追記するだけ。

.. code-block:: pkgconfig

   Origin: myrepo
   Label: myrepo
   Suite: precise
   Codename: precise
   Architectures: amd64 i386 source
   Components: custom
   UDebComponents: custom
   Description: my repository for Ubuntu precise
   SignWith: yes
   
   Origin: myrepo
   Label: myrepo
   Suite: trusty
   Codename: trusty
   Architectures: amd64 i386 source
   Components: custom
   UDebComponents: custom
   Description: my repository for Ubuntu trusty
   SignWith: yes


conf/incoming
~~~~~~~~~~~~~

distributionsと同じ。

.. code-block:: pkgconfig

   Name: precise
   IncomingDir: incoming
   TempDir: tmp
   LogDir: log
   Allow: precise
   Default: precise
   
   Name: trusty
   IncomingDir: incoming
   TempDir: tmp
   LogDir: log
   Allow: trusty
   Default: trusty

conf/options
~~~~~~~~~~~~

これは変更なし。

.. code-block:: text

   verbose
   basedir /var/lib/debpkg-custom/ubuntu
   ask-passphrase

DB生成
------

PreciseやWheezy用のローカルアーカイブには、私のメンテナンスしているパッケージやその依存パッケージをバックポートしたり、
社内で開発＆利用しているツールをDebianパッケージにして管理しています。
私のメンテナンスしているパッケージはひと通りTrustyに入っているので、とりあえず必要ないので空のDBを生成します。

.. code-block:: bash

   $ pwd
   /var/lib/debpkg-custom/ubuntu
   $ reprepro export trusty


余談。
------

Wheezy用には、パス自体分けて(/var/lib/debpkg-custom/debian)運用していたのですが、
なんか分けないで混ぜていても良かったなぁと思いました。が、まぁ特に困らないのでいいや。


.. author:: default
.. categories:: Debian
.. tags:: reprepro,Debian,Ubuntu
.. comments::
