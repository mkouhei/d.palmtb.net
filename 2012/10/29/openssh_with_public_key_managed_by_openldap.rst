OpenSSH LDAP publich key
========================

Ubuntu
------

Ubuntu (and Debian) don't have official debian package of openssh-lpk package. So I applied openssh with openssh-lpk patch from `Gentoo <http://distfiles.gentoo.org/distfiles/openssh-lpk-5.9p1-0.3.14.patch.gz>`_. I think it is enable to build with the same way in Debian. (But I have not tried)

Package build
^^^^^^^^^^^^^

Download patch and apply to source package.

.. code-block:: bash

   $ wget http://distfiles.gentoo.org/distfiles/openssh-lpk-5.9p1-0.3.14.patch.gz
   $ gzip -d openssh-lpk-5.9p1-0.3.14.patch.gz
   $ sudo apt-get build-dep openssh
   $ sudo apt-get install libldap2-dev quilt
   $ apt-get source openssh
   $ cd openssh-5.9p1
   $ patch < ../openssh-lpk-5.9p1-0.3.14.patch
   $ dpkg-source --commit

Remove line #234 because this patch has a bug.

.. code-block:: bash

   $ vi ./auth-rsa.c (234 line delete)

Execute "quilt refresh".

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
   (snip)
   Build-Depends: ..., libldap2-dev
   (snip)


Build package with "debuild" and "pbuilder" after update debian/changelog.
You install openssh-client, openssh-server, these two package at lease.

.. code-block:: bash

   $ sudo dpkg -i openssh-client_5.9p1-5ubuntu1+cust1_amd64.deb openssh-server_5.9p1-5ubuntu1+cust1_amd64.deb

Setting of OpenSSH
^^^^^^^^^^^^^^^^^^

/etc/ssh/sshd_config
""""""""""""""""""""

.. code-block:: bash

   UseLPK yes
   LpkServers ldap://127.0.0.1/
   LpkUserDN ou=People,dc=example,dc=org
   LpkGroupDN ou=Group,dc=example,dc=org
   LpkForceTLS no

Restart sshd. 

Postscript
----------

I use patch in this time that does not support IPv6.
And you must use libnss-ldapd and libpam-ldapd.


CentOS 6
--------

CentOS 6 supports openssh-lpk in default. So you will it, you only do install "openssh-ldap", and set up.

.. code-block:: bash

   $ sudo yum install openssh-ldap
   $ sudo vi /etc/ssh/sshd_config

/etc/ssh/sshd_config
^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   PubkeyAuthentication yes
   AuthorizedKeysCommand /usr/libexec/openssh/ssh-ldap-wrapper
   AuthorizedKeysCommandRunAs nobody

/etc/ssh/ldap.conf
^^^^^^^^^^^^^^^^^^

Copy from "/usr/share/doc/openssh-ldap-5.3p1/ldap.conf" as template to "/etc/ssh/ldap.conf".
openssh-ldap package of CentOS6 supports IPv6.

.. code-block:: bash

   uri ldap://ldap.example.org
   port 389
   base dc=example,dc=org
   ldap_version 3
   scope sub
   timelimit 30
   bind_timelimit 30
   bind_policy hard
   ssl no

Restart sshd.


See also
--------

`OpenSSH with LDAP public keys <https://confluence.terena.org/display/~visser/OpenSSH+with+LDAP+public+keys>`_

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Ubuntu,CentOS,OpenSSH,openssh-lpk
.. comments::
