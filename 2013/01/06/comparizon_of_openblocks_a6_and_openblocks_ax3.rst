Comparison OpenBlockS A6 and OpenBlockS AX3
===========================================

I rented OpenBlockS A6 and OpenBlockS AX3 from Plat'Home Co., Ltd.(Thanks!) last early summer. I will write blog post about A6 and AX3 several times. I wrote blog post about comparison of A6 and AX3 at this entry.

.. figure:: /img/obsa6_ax3_0.jpg

   *Opening ceremony of OpenBlockS A6 and AX3*


ES version of A6
----------------

OpenBlockS A6 I rented the first was ES(engineering sample) version. It was exchanged to the product version on the way. The difference of both on the appearance was screws of body. The diameter of the screw hole of product version is smaller than ES version. The storage installed of ES version was ADATA's 2.5 inch SSD 396 30GB, that of product version was HalfSlim SSD 16GB MLC.

.. figure:: /img/obsa6_ax3_1.jpg

   *Left is OpenBlockS AX3, right is OpenBlockS A3 (ES version)*

.. figure:: /img/obsa6_ax3_2.jpg

   *Bottom view*

.. figure:: /img/obsa6_ax3_3.jpg

   *Another angle*


Comaprison v.s. OpenBlockS 600
------------------------------

I compare their bodies against OpenBlockS 600. OpenBlockS A3 is slightly larger than OpenBlockS 600.

.. figure:: /img/obsa6_ax3_4.jpg

   *Side view of OpenBlockS 600, OpenBlockS A3, OpenBlockS AX3*

.. figure:: /img/obsa6_ax3_5.jpg

   *Bird view of OpenBlockS 600, OpenBlockS A3, OpenBlockS AX3*


Filesystem
----------

I was formatted storage because The storage of ES version was not formatted.
It is the same that case I bought OpenBlockS AX3 J. The storatge of product version was already mounted with UnionFS. It was the same that case I had rented OpenBlockS AX3.

.. code-block:: bash
 
   $ df -h
   Filesystem Size Used Avail Use% Mounted on
   /dev/ram0 124M 92M 27M 78% /
   udev 10M 88K 10M 1% /dev
   tmpfs 64M 4.0K 64M 1% /dev/shm
   /dev/sda1 14G 618M 13G 5% /.rw
   unionfs 14G 618M 13G 5% /etc
   unionfs 14G 618M 13G 5% /bin
   unionfs 14G 618M 13G 5% /home
   unionfs 14G 618M 13G 5% /lib
   unionfs 14G 618M 13G 5% /sbin
   unionfs 14G 618M 13G 5% /usr
   unionfs 14G 618M 13G 5% /var
   unionfs 14G 618M 13G 5% /root
   unionfs 14G 618M 13G 5% /opt
   unionfs 14G 618M 13G 5% /srv
   unionfs 14G 618M 13G 5% /media


It is /etc/mtab as folloing.

.. code-block:: bash

   $ cat /etc/mtab
   /dev/ram0 / ext2 rw 0 0
   proc /proc proc rw,noexec,nosuid,nodev 0 0
   sysfs /sys sysfs rw,noexec,nosuid,nodev 0 0
   udev /dev tmpfs rw,mode=0755 0 0
   tmpfs /dev/shm tmpfs rw,nosuid,nodev,size=64m 0 0
   devpts /dev/pts devpts rw,noexec,nosuid,gid=5,mode=620 0 0
   /dev/sda1 /.rw ext4 rw,relatime,barrier=1,data=ordered 0 0
   unionfs /etc unionfs rw,relatime,dirs=/.rw/etc=rw:/etc=ro 0 0
   unionfs /bin unionfs rw,relatime,dirs=/.rw/bin=rw:/bin=ro 0 0
   unionfs /home unionfs rw,relatime,dirs=/.rw/home=rw:/home=ro 0 0
   unionfs /lib unionfs rw,relatime,dirs=/.rw/lib=rw:/lib=ro 0 0
   unionfs /sbin unionfs rw,relatime,dirs=/.rw/sbin=rw:/sbin=ro 0 0
   unionfs /usr unionfs rw,relatime,dirs=/.rw/usr=rw:/usr=ro 0 0
   unionfs /var unionfs rw,relatime,dirs=/.rw/var=rw:/var=ro 0 0
   unionfs /root unionfs rw,relatime,dirs=/.rw/root=rw:/root=ro 0 0
   unionfs /opt unionfs rw,relatime,dirs=/.rw/opt=rw:/opt=ro 0 0
   unionfs /srv unionfs rw,relatime,dirs=/.rw/srv=rw:/srv=ro 0 0
   unionfs /media unionfs rw,relatime,dirs=/.rw/media=rw:/media=ro 0 0


This UnionFS is controlled by "/etc/init.d/openblocks-setup" and "/etc/default/openblocks". This init script also controls hardware specific to OpenBlockS. Other are the same as a normal Debian system.


OpenBlockS 600
~~~~~~~~~~~~~~

OpenBlockS 600 with CF boot is invisible the storage device.

.. code-block:: bash

   $ df -h
   Filesystem            Size  Used Avail Use% Mounted on
   tmpfs                 507M     0  507M   0% /lib/init/rw
   udev                   10M   48K   10M   1% /dev
   tmpfs                 507M     0  507M   0% /dev/shm
   rootfs                7.4G  869M  6.2G  13% /


"/etc/mtab" is as following.

.. code-block:: bash

   $ cat /etc/mtab 
   tmpfs /lib/init/rw tmpfs rw,nosuid,mode=0755 0 0
   proc /proc proc rw,noexec,nosuid,nodev 0 0
   sysfs /sys sysfs rw,noexec,nosuid,nodev 0 0
   udev /dev tmpfs rw,mode=0755 0 0
   tmpfs /dev/shm tmpfs rw,nosuid,nodev 0 0
   devpts /dev/pts devpts rw,noexec,nosuid,gid=5,mode=620 0 0
   rootfs / rootfs rw 0 0

I think OpenBlockS A series are easier to manage than OpenBlockS 600, because storage device of A series is visible.

.. author:: default
.. categories:: gadget
.. tags:: OpenBlockS
.. comments::
