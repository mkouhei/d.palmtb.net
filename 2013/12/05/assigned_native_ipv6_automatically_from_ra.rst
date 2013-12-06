Assigned native IPv6 automatically from RA
==========================================

`Debian/Ubuntu JP Advent Calendar 2013 <http://atnd.org/events/45968>`_ の五日目の記事です。nozzy nozzyさんが五日目の記事ではなく六日目の記事として `公開されていた <http://nozzy123nozzy.blogspot.jp/2013/12/how-can-i-help.html>`_ ので、またしても例のトリック( :doc:`/2013/12/03/how_to_change_timezone_in_debian` )を使っています。（いつまでこの穴埋め続けるんや…。）

先日、某同僚から `今の環境ではデフォルトでRAでIPv6アドレスをアサインしている <http://www.slideshare.net/KojiHasebe/2-v2-28915618>`_ という資料が公開されていましたが、OSの初期インストール時は、DHCPでのIPv4アドレスを使用しており、ネットワーク設定ではIPv6がデフォルトにはなりません。そこで、Ubuntu 12.04 LTS(presice) とWheezyでは次のように preseed の late_commandを使って /etc/network/interfaces を書き換え、IPv6 もしくは IPv6/IPv4 デュアルスタックの設定を行っています。

IPv6 onlyの場合は、

.. code-block:: ini

   iface eth0 inet6 auto

を使いますが、デュアルスタックの場合は、

.. code-block:: ini

   iface eth0 inet dhcp

を追加しています。


presice の場合
--------------

.. code-block:: sh

   cp -f /dev/null /etc/resolvconf/resolv.conf.d/original

   sed -i 's/domain-name-servers, //' /etc/dhcp/dhclient.conf

   cat << 'EOF' >  /etc/network/interfaces
   
   auto lo
   iface lo inet loopback
   
   auto eth0
   {% if host.ipv4 %}
   iface eth0 inet dhcp{% endif %}
   iface eth0 inet6 auto
       dns-nameservers {{ dns_ipv6 }}
       dns-search {{ subdomain }}.{{ dns_suffix }} {{ dns_suffix }}
   EOF

wheezy の場合
-------------

.. code-block:: sh

   apt-get install -y resolvconf
   cp -f /dev/null /etc/resolvconf/resolv.conf.d/original
   
   sed -i 's/domain-name-servers, //' /etc/dhcp/dhclient.conf
   
   cat << 'EOF' >  /root/interfaces
   auto lo
   iface lo inet loopback
   
   auto eth0
   {% if host.ipv4 %}
   iface eth0 inet dhcp{% endif %}
   iface eth0 inet6 auto
       dns-nameservers {{ dns_ipv6 }}
       dns-search {{ subdomain }}.{{ dns_suffix }} {{ dns_suffix }}
   EOF

   sed -i 's/{{ host }}.bad/{{ host }}.{{ subdomain }}.{{ dns_suffix }}/g' /etc/hosts
   echo '{{ host }}.{{ subdomain }}.{{ dns_suffix }}' > /etc/mailname
   test -x /usr/sbin/postconf && /usr/sbin/postconf -e mydomain='{{ subdomain }}.{{ dns_suffix }}'

preciseとの違いとして、resolvconfをインストールとPostfixの設定を行っています。これらはUbuntu, DebianとでOSインストール後の設定や挙動を同じにするためです。preciseではresolvconfがデフォルトでインストールされますが、wheezyではインストールされません。また、後者はDebianではデフォルトMTAはEximなのでこれをPostfixに変更しているのですが [#]_ 、これらの設定を行わないと、localhost.localdomainのままになっているからです。

/etc/resolvconf/resolv.conf.d/originalを/dev/nullで上書きし、/etc/dhcp/dhclient.confでdomain-name-serversを削除していますが、これらは、前述のOSインストール時にはIPv4を使い、インストール後にはIPv6をデフォルト、必要に応じてデュアルスタックにする、というところに副作用があるためです。

このoriginalファイルはインストール時の情報を元に下記のように設定されます。wheezyの場合は、resolvconfパッケージをインストールした時点で、/etc/resolv.confの情報を元に設定されます。

.. code-block:: ini

   search sub.example.org example.org
   nameserver 192.0.2.1

しかしIPv6をデフォルトとしている環境なので、nameserverは、IPv6アドレスになっていることが本来の期待値です。

なので、これをこのままにしておくと、再起動やnetworkingの再起動時などの/etc/network/if-up.d/000resolvconfでresolvconf -aが実行されると、/etc/resolv.confの内容が書き換えられてしまう、という問題が発生します。なので、originalの中身を消しておけば、OS起動時などにRAで通知される値が正しく割り当てられます。

また、デュアルスタックを使用している場合には、DHCPのリース更新時や、dhclientの手動実行、あるいはservice networking restart実行時に、/etc/resolv.confのnameserverの値がIPv4に設定されてしまいます。これは、上述のdomain-name-serversを削除することによって、IPv6アドレスのままになります。なお、domain-nameを同様に削除すると、dhclient実行時に、下記のようなエラーが発生してしまうため、これは削除しません。

.. code-block:: sh

   $ sudo dhclient eth0
   RTNETLINK answers: File exists
   chmod: cannot access `/etc/resolv.conf.dhclient-new.1276': No such file or directory
   mv: cannot stat `/etc/resolv.conf.dhclient-new.1276': No such file or directory


今の職場環境の特殊事情ではありますが、もし同様なケースの場合には参考にしてみてはいかがでしょうか。

.. rubric:: Footnotes

.. [#] ごめんなさい、小室さん


.. author:: default
.. categories:: Debian
.. tags:: IPv6,Debian,Ubuntu,DebianUbuntuAdvent2013
.. comments::
