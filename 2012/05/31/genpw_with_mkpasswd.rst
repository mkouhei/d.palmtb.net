mkpasswdコマンドを使ってshadowパスワードを生成する。
============================================================================================

passwdコマンドでの対話形式ではなく、任意のshadowパスワードを予め生成しておきたい場合、mkpasswdコマンドを使えますよ、という小ネタ。/etc/shadowの第2フィールドの文字列は、単純に任意の文字列をmd5sumコマンドを使ってもダメですが、mkpasswdコマンドを使うと簡単に生成できます。mkpasswdはwhoisパッケージにあるので、これをインストールしておきます。

.. code-block:: bash

   $ sudo apt-get install whois

インストールした後、生成するには次のコマンドを実行します。

.. code-block:: bash

   $ mkpasswd -S $(head -c 4 /dev/urandom | xxd -p) -m md5
   Password:
   $1$a243949c$w2efZ4cQRTDGxaZNuFDAG/

生成された文字列はvipw -sで任意のユーザアカウントの第2フィールドに記入すれば、入力したパスワードでログインなりsuなりできるようになります。ちなみに上記の文字列を生成するために入力した文字列(パスワード)は、11111111なのでそのまんま使わないようにね。（わら


.. author:: default
.. categories:: Ops 
.. tags:: mkpasswd, Debian, GNU/Linux
.. comments::
