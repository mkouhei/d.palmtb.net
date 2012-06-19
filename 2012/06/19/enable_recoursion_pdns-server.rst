PowerDNS Authoritative Serverで再起問い合わせを有効にする。
============================================================================================================

ローカルDNSでコンテンツサーバとして使用しているPowerDNS Authoritative Serverで諸事情により再起問い合わせを行わせることにしました。PowerDNSの公式ドキュメントは充実しているのですが、PowerDNS recursor(pdns-recursor)を導入せずに再起問い合わせさせる方法については記載が無かったのでメモしておきました。 [#pdns]_


環境。
------------

* Ubuntu 10.04
* pdns-server 2.9.22

設定。
------------

/etc/powerdns/pdns.conf の下記を設定します。

* allow-recursion

  * 再起問い合わせを許可するホスト(クライアント)のIPアドレスを指定します。複数指定はカンマ区切りで、ネットワークアドレスをprefix lengthで指定することもできます。が、ハマったのが0.0.0.0は指定できないということ。これを指定すると再起問い合わせ自体が有効になりませんでした

* recursive-cache-ttl

  * 再起問い合わせのキャッシュ時間。デフォルトは10秒

* recursor

  * 再起問い合わせ先のDNSのIPアドレスを指定します

* lazy-recursion

  * 上記で設定した再起問い合わせを許可するためのフラグ。許可する場合はyesを指定

実際に設定すると下記のような感じ。

.. code-block:: diff

   diff --git a/powerdns/pdns.conf b/powerdns/pdns.conf
   index eb5e473..80a49a2 100644
   --- a/powerdns/pdns.conf
   +++ b/powerdns/pdns.conf
   @@ -8,7 +8,7 @@ allow-axfr-ips=127.0.0.1
    #################################
    # allow-recursion      List of netmasks that are allowed to recurse
    #
   -allow-recursion=127.0.0.1
   +allow-recursion=10.0.0.0/8
   
    #################################
    # allow-recursion-override   Local data even about hosts that don't exist will
   @@ -84,7 +84,7 @@ launch=gmysql
    #################################
    # lazy-recursion       Only recurse if question cannot be answered locally
    #
   -lazy-recursion=no
   +lazy-recursion=yes
   @@ -189,12 +189,12 @@ module-dir=/usr/lib/powerdns
    #################################
    # recursive-cache-ttl  Seconds to store packets in the PacketCache
    #
   -# recursive-cache-ttl=10
   +recursive-cache-ttl=10
   
    #################################
    # recursor     If recursion is desired, IP address of a recursing nameserver
    #
   -#recursor=
   +recursor=10.0.1.1
   
    #################################
    # setgid       If set, change group id to this gid for more security



.. rubric:: footnote

.. [#pdns] 設定する各パラメータについては説明がありますが、どれを設定するのか、という説明がないということです。

.. author:: default
.. categories:: Ops
.. tags:: PowerDNS
.. comments::
