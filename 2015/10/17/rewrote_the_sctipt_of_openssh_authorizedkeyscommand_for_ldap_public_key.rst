Rewrote the sctipt of OpenSSH AuthorizedKeysCommand for LDAP public key
=======================================================================

OpenSSH 6.2以上で実装された ``AuthorizedKeysCommand`` を使って、LDAPでの公開鍵認証用のシェルスクリプトを Golang で書き換えました。その理由などはいいからコードはよ、という方は、
次のリンク先からドキュメントと合わせてどうぞ。

* `リポジトリ <https://github.com/mkouhei/openssh-ldap-pubkey>`_
* `ドキュメント <http://openssh-ldap-pubkey.rtfd.org/>`_

背景
----

現状、下記のようなシェルスクリプトを ``/etc/ssh/searchkey.sh`` として用意し、

.. code-block:: shell

   #!/bin/sh -e
   
   uri="ldap://ldap.example.org"
   search_base="ou=People,dc=example,dc=org"
   uid=$1
   search_filter="(&(objectClass=posixAccount)(uid=${uid})(description=limited))"
   
   ldapsearch -x -LLL -H $uri -b $search_base $search_filter sshPublicKey |\
   grep -v '^dn:' | sed '
   s/sshPublicKey: //g
   s/^ //g
   ' | tr -d '\n'

   
このスクリプトのパスを ``sshd_config`` の ``AuthorizedKeysCommand`` に設定することで、 `openssh-lpk.schema <https://openssh-lpk.googlecode.com/svn/trunk/schemas/openssh-lpk_openldap.schema>`_ を使ったLDAPでの公開鍵認証を行っています。ちなみにその前(Ubuntu PreciseやDebian Wheezy)では OpenSSHのソースパッケージにopenssh-lpkパッチを適用して、カスタムビルドパッケージを配布していました。 [LPK0]_ [LPK1]_ [LPK2]_

問題発生
--------

Trusty, Jessieから ``AuthorizedKeysCommand`` でのシェルスクリプトに切り替えてから、しばらく問題がなかったのですが、あるタイミングから公開鍵認証ができなくなりました。 [#]_ 

原因は２つ。一つは ``sshPublicKey`` の値が base64 encodeされている場合。上記のスクリプトだとdecodeしていないため、authorized keysとして機能しません。
もうひとつは、複数の公開鍵が登録されている場合。複数行あった場合の処理も行っておらず、複数のエントリがあった場合は一行に連結されてしまいます。

対応検討
--------

最初、シェルスクリプトで対応しようかと思ったのですが、厄介なのが、複数キーを登録しているユーザで、ある鍵は base64 encodeされておらず、ある鍵はencodeされている、というケースが存在すること。シェルスクリプトだとテストコードも書きづらかったこともあり、ピュアGoで書かれている `go-ldap <http://gopkg.in/ldap.v2>`_ を `Gosh <http://gosh.readthedocs.org/en/latest/>`_ で試してみたら、base64 encodedの値も自動的にdecodeしてくれるので、Golangで書き換えることにしました。

openssh-ldap-pubkey での実装
----------------------------

go-ldapでエラー処理など省いて書くと実質的には下記のようになります。

.. code-block:: go

   c, _ := ldap.Dial("tcp", fmt.Sprintf("%s:%d", "<host>", "<port>"))
   defer c.Close()
   bindRequest := ldap.NewSimpleBindRequest("", "", nil)
   c.SimpleBind(bindRequest)
   searchRequest := ldap.NewSearchRequest(
           l.base, ldap.ScopeWholeSubtree, ldap.NeverDerefAliases,
		   0, 0, false,
		   fmt.Sprintf("<filter>", "<uid>"), []string{sshPublicKeyName}, nil)
   sr, _ := c.Search(searchRequest) 
   for _, pubkey := range sr.Entries[0].GetAttributeValues("sshPublicKey") {
		fmt.Println(pubkey)
   }


ただ、Goで書き換えても、 ``openssh-ldap-pubkey`` コマンドのラッパースクリプトを用意して、LDAPサーバや search baseを指定するのはひと手間増えます。これは避けたいなと思いました。通常LDAPを使っている環境では ``nslcd`` も併用していることが多いので、初期リリースとしては ``/etc/nslcd.conf`` があればそこから設定を読み込むようにしました。 `nslcd.confとopenssh-ldap-pubkeyコマンドのオプションの対応表はドキュメントに記載 <http://openssh-ldap-pubkey.readthedocs.org/en/latest/openssh.html#id1>`_ してあります。なお、もしnslcd を利用していない場合はラッパースクリプトを用意する必要があります。この場合も `ドキュメントに記載 <http://openssh-ldap-pubkey.readthedocs.org/en/latest/openssh.html#install-without-nslcd>`_ しておきました。
   
RHEL系は？
----------

皆大好きRHELベースのディストロでは、そもそも `openssh-ldap <https://apps.fedoraproject.org/packages/openssh-ldap>`_ というパッケージが用意されているので、 ``AuthorizedKeysCommand`` を使う必要がありません。設定を合わせたい、という場合には同じやり方でできます。

SSSDの対応は？
~~~~~~~~~~~~~~

DebianシステムでもSSSDパッケージは用意されています。ただ、デフォルトではSSSDになっておらず、個人的にもまだ使っていないので、こちらは未対応です。要望があれば対応するかも or パッチウェルカムです。

IPv6 only host in Dual stack でハマった
---------------------------------------

今の環境は、IPv4/IPv6の dual stackの構成で、IPv6がデフォルトで、ホストはIPv6 onlyまたはIPv4/IPv6のdual stackを選べるようになっています。なのでDNSは基本IPv6のアドレスに問い合わせする構成にしています。LDAPサーバはIPv4しか使えないネットワーク機器も利用するので、例えばldap.example.orgはAAAAレコードとAレコードを設定しています。通常、ldapsearchを行うと基本IPv6経由で行ってくれるので問題ありませんが、今回使ったgo-ldapはdual stackの場合、IPv4で名前解決をしてしまい、アクセスできないとそこで処理を中断してしまうことが分かりました。go-ldapの方を修正して、パッチを投げるのが筋でしょうが、とりあえず、今回はopenssh-ldap-pubkey側で `net.LookupHost <https://golang.org/pkg/net/#LookupHost>`_ を使って、IPv6 onlyのホストでも正常に接続できるように `回避策 <https://github.com/mkouhei/openssh-ldap-pubkey/commit/b572af3074b1ec2474fe1d2c6945adcc2c106dac>`_ をとりました。

まとめ
------

やっつけで作るときはシェルスクリプトやAWK, Sedスクリプトは楽なのですが、メンテナンスを考えると結構しんどいので、テストコード書けるプログラミング言語で実装するほうがやはり良いですね。
２年位前だったら、今回のような場合、Pythonで実装していたと思いますが、クライアントに配布するようなユーティリティで、ディストリビューションの公式パッケージにしていない場合、Golangはシングルバイナリで配布できるのでやはり圧倒的に便利です。

あと、今回のユーティリティは主にDebianシステムが対象なのと、go-ldapは `公式Debianパッケージになって <https://packages.qa.debian.org/g/golang-github-go-ldap-ldap.html>`_ いるのでDebianパッケージ化しておくと、Ubuntu 16.04やDebian Stretch以降で便利です。気が向いたら ITPするかもしれません。


参考文献
--------

.. [LPK0] ":doc:`/2012/10/29/openssh_with_public_key_managed_by_openldap`"
.. [LPK1] ":doc:`/2013/06/20/applying_openssh_lpk_to_wheezy`"
.. [LPK2] ":doc:`/2014/04/12/how_to_build_custom_debian_package_automatically_by_jenkins`"

.. rubric:: footnotes

.. [#] と言ってもカスタムビルドパッケージを使ったPreciseやWheezyでは問題が無く、現環境ではCentOSに比べ、Ubuntuを使っている人そもそも少ないこと、後述のbase64 encodeされているのも一部のユーザであるため、気づいている人が少ないのが現状でした。

.. author:: default
.. categories:: LDAP
.. tags:: Debian,OpenSSH,OpenLDAP,Golang,IPv6
.. comments::
