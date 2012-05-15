dnsmasqで複数N/Wそれぞれにdefault gatewayを設定する。
==============================================================================================

もともとdnsmasqサーバにのみアクセスさせる用途で使っていたのですが、他のネットワークにもアクセスする必要がでたので調べてみました。

ます、複数のNICを持つサーバで、dnsmasqを使ってDHCPサーバを立てる場合、払い出すNICとDHCPの範囲を指定します。

.. code-block:: ini

   interface=eth1
   interface=eth2
   interface=eth3
   interface=eth4
   interface=eth5
   interface=eth6
   
   dhcp-range=10.0.0.10,10.0.0.250,30m
   dhcp-range=10.0.1.10,10.0.1.250,30m
   dhcp-range=10.0.2.10,10.0.2.250,30m
   dhcp-range=10.0.3.10,10.0.3.250,30m
   dhcp-range=10.0.4.10,10.0.4.250,30m
   dhcp-range=10.0.5.10,10.0.5.250,30m

しかし、これだとデフォルトゲートウェイが設定されません。上記のネットワークはそれぞれ24bitなので、デフォルトゲートウェイも別々に設定したいですね。dhcp-optionで、option:routerを使うと一つのネットワークに対してデフォルトゲートウェイを設定できますが、そのままでは複数のネットワークに対して設定できません。そこで、tagを使います。tagでつける名前は任意の半角英数の文字列です。

.. code-block:: ini

    dhcp-range=tag:eth1,10.0.0.10,10.0.0.250,30m
    dhcp-range=tag:eth2,10.0.1.10,10.0.1.250,30m
    dhcp-range=tag:eth3,10.0.2.10,10.0.2.250,30m
    dhcp-range=tag:eth4,10.0.3.10,10.0.3.250,30m
    dhcp-range=tag:eth5,10.0.4.10,10.0.4.250,30m
    dhcp-range=tag:eth6,10.0.5.10,10.0.5.250,30m

    dhcp-option=tag:eth1,option:router,10.0.0.1
    dhcp-option=tag:eth2,option:router,10.0.1.1
    dhcp-option=tag:eth3,option:router,10.0.2.1
    dhcp-option=tag:eth4,option:router,10.0.3.1
    dhcp-option=tag:eth5,option:router,10.0.4.1
    dhcp-option=tag:eth6,option:router,10.0.5.1

あとはdnsmasqを再起動すれば、セグメント毎にデフォルトゲートウェイを設定できます。 `dnsmasqのマニュアル <http://www.thekelleys.org.uk/dnsmasq/docs/dnsmasq-man.html>`_ には他の設定もいろいろ記載されています。コマンドラインで使うオプションを、設定ファイル(/etc/dnsmasq.conf)でそのまま使えるのが良いですね。


.. author:: default
.. categories:: Ops
.. tags:: dnsmasq
.. comments::
