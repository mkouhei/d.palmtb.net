LXCをlibvirtd経由で起動させる。
========================================================

Sidでlxcを使うには、lxcパッケージをインストールし、README.Debianにあるとおり/etc/fstabに

.. code-block:: sh

   cgroup /sys/fs/cgroup cgroup defaults 0 0


と記述し、cgroupをマウントすれば使えます。一方、libvirtd経由で起動させる場合、

.. code-block:: xml

   <domain type='lxc'>
     <name>vm1</name>
     <memory>100000</memory>
     <os>
       <type>exe</type>
       <init>/bin/sh</init>
     </os>
     <vcpu>1</vcpu>
     <clock offset='utc'/>
     <on_poweroff>destroy</on_poweroff>
     <on_reboot>restart</on_reboot>
     <on_crash>destroy</on_crash>
     <devices>
       <emulator>/usr/lib/libexec/libvirt_lxc</emulator>
       <interface type='network'>
         <source network='default'/>
       </interface>
       <console type='pty' />
     </devices>
   </domain>

のようなlibvirtの定義ファイルを用意してやります。

.. code-block:: bash

   $ sudo virsh --connect lxc:/// define vm1
   $ sudo virsh --connect lxc:/// start vm1

これで起動できる！と思ったら大間違い。下記のようなエラーを吐いてこけます。

.. code-block:: sh

   2012-07-10 15:44:06.531+0000: 24033: error : lxcVmStart:1783 : internal error Unable to find 'memory' cgroups controller mount

このワークアラウンドは `Debian Wiki <http://wiki.debian.org/LXC>`_ に記述されており、/etc/default/grubに下記の設定を行い、update-grub2を実行しkernelを再起動してやればOKです。

.. code-block:: sh

   GRUB_CMDLINE_LINUX="cgroup_enable=memory" 

`kernel 2.6.39-1でFixされている <http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=534964>`_ ようなのですが、実際には kernel 3.0.0-1でも同じ問題に遭遇します。

とりあえず、これで無事起動できるようになった筈です。実際に実行してみます。

.. code-block:: bash

   $ sudo virsh --connect lxc:/// start vm1
   Domain vm1 started
   
   $ sudo virsh --connect lxc:/// list --all
   Id    Name                           State
   ----------------------------------------------------
   5511  vm1                            running
   
   $ sudo virsh --connect lxc:/// console vm1
   Connected to domain vm1
   Escape character is ^]
   #

無事起動できましたね。今回はshを起動しているだけなのでネットワークの設定は行う意味がありませんが、debootstrapで作成したDebianイメージはあらかじめブリッジの設定をしておかないと、

.. code-block:: sh

  error: Failed to start domain vm1
  error: Unable to add bridge virbr0 port veth0: No such device

のようなエラーを吐いてコンテナ自体を起動できないので注意。debootstrapで作成したDebianイメージもlibvirtで問題なく起動できるか否かは未確認。

.. author:: default
.. categories:: Ops
.. tags:: Debian, LXC
.. comments::
