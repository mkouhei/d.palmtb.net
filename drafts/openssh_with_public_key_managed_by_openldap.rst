OpenSSH LDAP publich key
========================

Debian and Ubuntu don't have official debian package of openssh-lpk package. So I applied openssh with openssh-lpk patch from `Gentoo <http://distfiles.gentoo.org/distfiles/openssh-lpk-5.9p1-0.3.14.patch.gz>`_.

Build package

.. code-block:: bash

   $ wget http://distfiles.gentoo.org/distfiles/openssh-lpk-5.9p1-0.3.14.patch.gz
   $ gzip -d openssh-lpk-5.9p1-0.3.14.patch.gz
   $ sudo apt-get build-dep openssh
   $ sudo apt-get install libldap2-dev quilt
   $ apt-get source openssh
   $ cd openssh-5.9p1
   $ patch < ../openssh-lpk-5.9p1-0.3.14.patch
   $ dpkg-source --commit

When fail building why this patch has a bug, remove line.

.. code-block:: bash

   $ vi ./auth-rsa.c (234 line delete)


patch refresh

.. code-block:: bash

   $ quilt refresh

Edit debian/rules

.. code-block:: bash

   $ vi debian/rules
    --- a/rules	2012-04-02 10:38:04.000000000 +0000
    +++ b/rules	2012-06-12 21:46:43.000000000 +0000
    @@ -81,6 +81,7 @@

     # The deb build wants xauth; the udeb build doesn't.
     confflags += --with-xauth=/usr/bin/xauth
    +confflags += --with-ldap
     confflags_udeb += --without-xauth

     # Default paths. The udeb build has /usr/bin/X11 and /usr/games removed.
    @@ -93,6 +94,7 @@
     cflags := $(default_cflags)
     cflags += -DLOGIN_PROGRAM=\"/bin/login\" -DLOGIN_NO_ENDOPT
     cflags += -DSSH_EXTRAVERSION=\"$(SSH_EXTRAVERSION)\"
    +cflags += -DWITH_LDAP_PUBKEY
     cflags_udeb := -Os
     cflags_udeb += -DSSH_EXTRAVERSION=\"$(SSH_EXTRAVERSION)\"
     confflags += --with-cflags='$(cflags)'


Append libldap2-dev to Build-Depends of debian/control.

.. code-block:: bash

   $ vi debian/control
   (append)
   Build-Depends: ..., libldap2-dev


Update debian/changelog

.. code-block:: bash

   $ dch -i
   openssh (1:5.9p1-5ubuntu1+cust1) precise; urgency=low
    
      * with ldap option
    
     -- Kouhei Maeda <mkouhei@palmtb.net>  Fri, 14 Sep 2012 11:13:38 +0900
    
    openssh (1:5.9p1-5ubuntu1) precise; urgency=low
    
      * Resynchronise with Debian.  Remaining changes:
	- Add support for registering ConsoleKit sessions on login.
	- Drop openssh-blacklist and openssh-blacklist-extra to Suggests.
	- Convert to Upstart.  The init script is still here for the benefit of
	  people running sshd in chroots.
	- Install apport hook.
	- Add mention of ssh-keygen in ssh connect warning.
      * Sync up pkg-config variable used in configure's ConsoleKit test with
	that used for libedit.
    (snip)

Build package.

.. code-block:: bash
    
    $ debuild
    $ cd ..
    $ pbuilder --update (If you use pbuilder firstly, use --create option)
    $ pbuilder --build openssh_5.9p1-5ubuntu1+cust1.dsc
    $ cd /var/cache/pbuilder/result/
    $ ls -l *cust1*
    -rw-r--r-- 1 maeda_kohei cy_admin 249343 Sep 14 11:36 openssh_5.9p1-5ubuntu1+cust1.debian.tar.gz
    -rw-r--r-- 1 maeda_kohei cy_admin   1733 Sep 14 11:36 openssh_5.9p1-5ubuntu1+cust1.dsc
    -rw-r--r-- 1 maeda_kohei cy_admin 996310 Sep 14 11:38 openssh-client_5.9p1-5ubuntu1+cust1_amd64.deb
    -rw-r--r-- 1 maeda_kohei cy_admin 338568 Sep 14 11:38 openssh-server_5.9p1-5ubuntu1+cust1_amd64.deb
    -rw-r--r-- 1 maeda_kohei cy_admin   1284 Sep 14 11:38 ssh_5.9p1-5ubuntu1+cust1_all.deb
    -rw-r--r-- 1 maeda_kohei cy_admin  61472 Sep 14 11:38 ssh-krb5_5.9p1-5ubuntu1+cust1_all.deb
    -rw-r--r-- 1 maeda_kohei cy_admin  69866 Sep 14 11:38 ssh-askpass-gnome_5.9p1-5ubuntu1+cust1_amd64.deb
    -rw-r--r-- 1 maeda_kohei cy_admin 235956 Sep 14 11:38 openssh-client-udeb_5.9p1-5ubuntu1+cust1_amd64.udeb
    -rw-r--r-- 1 maeda_kohei cy_admin 267754 Sep 14 11:38 openssh-server-udeb_5.9p1-5ubuntu1+cust1_amd64.udeb
    -rw-rw-r-- 1 maeda_kohei cy_admin   3909 Sep 14 11:38 openssh_5.9p1-5ubuntu1+cust1_amd64.changes


You install openssh-client, openssh-server, these two package at lease.

.. code-block:: bash

   $ sudo dpkg -i openssh-client_5.9p1-5ubuntu1+cust1_amd64.deb openssh-server_5.9p1-5ubuntu1+cust1_amd64.deb


/etc/ssh/sshd_config
^^^^^^^^^^^^^^^^^^^^

.. code-block:: ini

   UseLPK yes
   LpkServers ldap://127.0.0.1/
   LpkUserDN ou=ND,dc=cyberagent,dc=co,dc=jp
   LpkGroupDN ou=DIV,dc=cyberagent,dc=co,dc=jp
   LpkForceTLS no

Restart sshd.

CentOS 6
--------

.. code-block:: bash

   $ sudo yum install openssh-ldap
   $ sudo vi /etc/ssh/sshd_config

/etc/ssh/sshd_config
^^^^^^^^^^^^^^^^^^^^

.. code-block:: ini

   PubkeyAuthentication yes
   AuthorizedKeysCommand /usr/libexec/openssh/ssh-ldap-wrapper
   AuthorizedKeysCommandRunAs nobody


/etc/ssh/ldap.conf
^^^^^^^^^^^^^^^^^^

.. code-block:: ini

    uri ldap://172.19.4.145/ ldap://172.19.4.151
    base dc=cyberagent,dc=co,dc=jp

    ssl no
    ssl start_tls
    tls_cacertdir /etc/openldap/cacerts
    tls_cacertfile /etc/openldap/cacerts/ldaps.crt
    #tls_checkpeer no


Restart sshd.


See also
--------

`OpenSSH with LDAP public keys <https://confluence.terena.org/display/~visser/OpenSSH+with+LDAP+public+keys>`_
