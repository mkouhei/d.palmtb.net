Applying openssh-lpk to Wheezy
==============================

This blog entry is rewritten version of Wheezy for an article I wrote earlier.

:doc:`/2012/10/29/openssh_with_public_key_managed_by_openldap`

Download `this patch <http://distfiles.gentoo.org/distfiles/openssh-lpk-6.0p1-0.3.14.patch.gz>`_ why OpenSSH version of Wheezy is 6.0p1. Then apply to source package.

.. code-block:: bash

   $ wget http://distfiles.gentoo.org/distfiles/openssh-lpk-6.0p1-0.3.14.patch.gz
   $ gzip -d  openssh-lpk-6.0p1-0.3.14.patch.gz
   $ sudo apt-get build-dep openssh
   $ sudo apt-get install libldap2-dev quilt fakeroot
   $ apt-get source openssh
   $ cd openssh-6.0p1
   $ patch -p1 < ../openssh-lpk-6.0p1-0.3.14.patch

Modify failed to patch.

version.h
^^^^^^^^^

.. code-block:: diff

   Index: openssh-6.0p1/version.h
   ===================================================================
   --- openssh-6.0p1.orig/version.h        2013-06-20 06:11:07.000000000 +0000
   +++ openssh-6.0p1/version.h     2013-06-20 06:23:27.808046150 +0000
   @@ -3,7 +3,8 @@
    #define SSH_VERSION    "OpenSSH_6.0"
    
    #define SSH_PORTABLE   "p1"
   -#define SSH_RELEASE_MINIMUM    SSH_VERSION SSH_PORTABLE
   +#define SSH_LPK                "lpk"
   +#define SSH_RELEASE_MINIMUM    SSH_VERSION SSH_PORTABLE SSH_LPK
    #ifdef SSH_EXTRAVERSION
    #define SSH_RELEASE    SSH_RELEASE_MINIMUM " " SSH_EXTRAVERSION
    #else


Makefile.in
^^^^^^^^^^^

.. code-block:: diff

   Index: openssh-6.0p1/Makefile.in
   ===================================================================
   --- openssh-6.0p1.orig/Makefile.in      2013-06-20 06:11:07.000000000 +0000
   +++ openssh-6.0p1/Makefile.in   2013-06-20 06:25:46.242305737 +0000
   @@ -94,7 +94,7 @@
           sftp-server.o sftp-common.o \
           roaming_common.o roaming_serv.o \
           sandbox.o sandbox-null.o sandbox-rlimit.o sandbox-systrace.o \
   -       sandbox-darwin.o sandbox-seccomp-filter.o
   +       sandbox-darwin.o sandbox-seccomp-filter.o ldapauth.o
   
    MANPAGES       = moduli.5.out scp.1.out ssh-add.1.out ssh-agent.1.out ssh-keygen.1.out ssh-keyscan.1.out ssh.1.out sshd.8.out sftp-server.8.out sftp.1.out ssh-keysign.8.out ssh-pkcs11-helper.8.out ssh-vulnkey.1.out sshd_config.5.out ssh_config.5.out
    MANPAGES_IN    = moduli.5 scp.1 ssh-add.1 ssh-agent.1 ssh-keygen.1 ssh-keyscan.1 ssh.1 sshd.8 sftp-server.8 sftp.1 ssh-keysign.8 ssh-pkcs11-helper.8 ssh-vulnkey.1 sshd_config.5 ssh_config.5

Execute "dpkg-source --commit".

In addition to the change at the time of the precise, "confflags + = - with-libs =-lldap" you must append.

.. code-block:: makefile

   confflags += --with-ldap
   confflags += --with-libs=-lldap
   # (snip)
   cflags += -DWITH_LDAP_PUBKEY

Other procedures are the same as for the precise.

.. author:: default
.. categories:: Debian
.. tags:: OpenLDAP,OpenSSH,openssh-lpk,Wheezy
.. comments::
