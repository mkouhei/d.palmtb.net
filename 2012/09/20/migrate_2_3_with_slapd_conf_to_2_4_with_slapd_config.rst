Migration OpenLDAP 2.3 to 2.4
=============================

Current LDAP servers are CentOS 5.4 and OpenLDAP 2.3 with slapd.conf. I will replace these as Ubuntu 12.04 and OpenLDAP 2.4 with slapd-config. I write notes so I tested the migration.

System envrironment
-------------------

Current is like this.

.. blockdiag::

   blockdiag {
   master_c [label = "master \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   slave_c [label = "slave \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   master_c -> slave_c;
   }

New will be next.

.. blockdiag::

   blockdiag {
   master_u [label = "master \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];	   
   slave_u [label = "slave \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   master_u -> slave_u;
   }

Step of migration is next.

1. Prepare a new master as slave of current

.. blockdiag::

   blockdiag {
   masterc [label = "master \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   slavec [label = "slave \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   slaveu [label = "slave \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   masterc -> slavec;
   masterc -> slaveu;
   }

2. Change a new master as slave to master
   
.. blockdiag::

   blockdiag {
   masterc [label = "master \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   slavec [label = "slave \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   masteru [label = "master \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   masterc -> slavec;
   masteru -> masteru [label = "change master"];
   }

3. Prepare a new slave
   
.. blockdiag::

   blockdiag {
   masterc [label = "master \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   slavec [label = "slave \n\nOpenLDAP 2.3 \nslapd.conf \nCentOS 5.4", width = 180, height = 80];
   masteru [label = "master \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   slaveu [label = "slave \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   masterc -> slavec;
   masteru -> slaveu;
   }

4. Stop current LDAPs

.. blockdiag::

   blockdiag {
   masteru [label = "master \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   slaveu [label = "slave \n\nOpenLDAP 2.4 \nslapd-config \nUbuntu 12.04", width = 180, height = 80];
   masteru -> slaveu;
   }

sammary of setting up
---------------------

I tried to convert with slaptest. slaptest is needed to convert custom schema to ldif. But this method has next failures.

* Additional schemas are not included
* Custom and additiona modules are not loaded
* Database setting is not converted all
* Access control is not converted
* Global settings as LogLevel and TLS Certification etc are not converted
* Overlay as like ppolicy and syncrepl etc are not converted

In other words, it means almost useless with slaptest, except of converting custom schema to LDIF. So I basically have set up using ldapvi.

Install packages
----------------

I had installed next packages.

* slapd
* ldap-utils
* ldapvi
* nslcd

Debconf asked these parameters when some packages installed. Second level items are set up values this time.

slapd
^^^^^

* Administrator password
* Confirm password

nslcd
^^^^^

* LDAP server URI

  * ldap://localhost

* LDAP server search base

  * dc=example,dc=org

* Check server's SSL vertificatte

  * never

Convert additional schema to LDIF
---------------------------------

I converted additional schema to LDIF with slaptest after I installed slapd. I made temporary directory and copying files as slapd.conf, schema files as local.schema, sudo.schema, openssh-lpk.schema from current slave server of CentOS5.4.

.. code-block:: bash

   $ sudo service slapd stop
   $ cd /tmp
   $ mkdir -p slapd.d/cn\=config/cn\=schema
   $ cp -i slapd.conf .
   $ cp -i local.schema sudo.schema openssh-lpk.schema slapd.d/cn\=config/cn\=schema/
   $ sudo slaptest -f slapd.conf -F /tmp/slapd.d/
   $ cd /tmp/slapd.d/cn\=config/cn\=schema
   $ sudo mv -i cn\=\{4\}sudo.ldif sudo.ldif
   $ sudo mv -i cn\=\{6\}local.ldif local.ldif
   $ sudo mv -i cn\=\{7\}openssh-lpk.ldif openssh-lpk.ldif

I copied certification and private key files from current slave server. For example, it is as follows.

* /etc/ca-certificates/myserver.key
* /etc/ca-certificates/myserver.crt

Using ldapvi
------------

ldapvi is "`is an interactive LDAP client for Unix terminals. Using it, you can update LDAP entries with a text editor <http://www.lichteblau.com/ldapvi/manual/>`_". Debian package name is the same.

For example of changing it is as follows.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase={1}hdb olcRootDN
   ----
   0 olcDatabase={1}hdb,cn=config
   olcRootDN: cn=admin,dc=nodomain       # <- before
   olcRootDN: cn=admin,dc=example,dc=org # <- after
   ----
   SASL/EXTERNAL authentication started
   SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
   SASL SSF: 0
         1 entry read
   add: 0, rename: 0, modify: 1, delete: 0
   Action? [yYqQvVebB*rsf+?] y
   Done.


Action of ldapvi are follows:

* y commit changes
* e open editor again
* Y commit, ignoring errors
* v view changes as LDIF change records
* V view changes as ldapvi change records
* \+ rewrite file to include schema comments
* b show login dialog and rebind
* B toggle SASL
* \* set SASL mechanism
* s skip one entry
* f forget all deletions
* q save changes as LDIF and quit
* Q discard changes and quit

see also `ldapvi User Manual <http://www.lichteblau.com/ldapvi/manual/>`_ .

Detail of Setting up as slave using ldapvi will be posted next time.

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Ubuntu,ldapvi
.. comments::
