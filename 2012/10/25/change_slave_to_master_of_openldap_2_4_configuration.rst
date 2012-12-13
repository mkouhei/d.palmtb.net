Change slave to master of OpenLDAP 2.4 configuration
====================================================

The story of this entry is previous migration second step (:doc:`/2012/09/20/migrate_2_3_with_slapd_conf_to_2_4_with_slapd_config`). Firstly set up as slave, then change config. Namely see ":doc:`/2012/10/24/openldap_replication_from_2_3_to_2_4`".

Disable replication
^^^^^^^^^^^^^^^^^^^

Delete "olcSyncrepl", "olcUpdateRef" lines from "olcDatabase={1}hdb".

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb


Before
   
.. code-block:: bash

   (snip)
   olcAccess: {12}to * by * none
   olcSyncrepl: {0}rid=xxx provider=ldaps://xxx.xxx.xxx.xxx bindmethod=simple binddn="cn=ldapadmin,dc=example,dc=org" credentials=xxxxxxxx searchbase="dc=example,dc=org" type=refreshAndPersist retry="5 10 60 +"
   olcUpdateRef: ldaps://xxx.xxx.xxx.xxx


Changed

.. code-block:: bash

   (snip)
   olcAccess: {12}to * by * none


Load module
^^^^^^^^^^^

Load module syncprov for master.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn=module{0}

Before

.. code-block:: bash

   0 cn=module{0},cn=config
   objectClass: olcModuleList
   cn: module{0}
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: {0}back_hdb

Changed

.. code-block:: bash

   0 cn=module{0},cn=config
   objectClass: olcModuleList
   cn: module{0}
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: {0}back_hdb

   add cn=module,cn=config
   objectClass: olcModuleList
   cn: module
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: syncprov.la


Index
^^^^^

Delete "description eq" line from "olcDbIndex,olcDatabase={1}hdb".

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb olcDbIndex

Before 

.. code-block:: bash

   olcDbIndex: objectClass eq,pres
   olcDbIndex: uid eq,pres,sub
   olcDbIndex: uniqueMember,memberUid eq
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: cn eq
   olcDbIndex: sudoUser eq,sub
   olcDbIndex: description eq
   olcDbIndex: entryCSN,entryUUID eq

Changed

.. code-block:: bash

   olcDbIndex: objectClass eq,pres
   olcDbIndex: uid eq,pres,sub
   olcDbIndex: uniqueMember,memberUid eq
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: cn eq
   olcDbIndex: sudoUser eq,sub
   olcDbIndex: entryCSN,entryUUID eq


Access control
^^^^^^^^^^^^^^

Insert a new writing "sshPublicKey" lines.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase={1}hdb olcAccess

Before

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   olcAccess: {0}to * by dn="cn=ldapadmin,dc=example,dc=org" write by * none break
   olcAccess: {1}to attrs=userPassword by self read by anonymous auth by * none
   olcAccess: {2}to dn.subtree="ou=ACL,ou=policy,dc=example,dc=org" by * compare by * none
   olcAccess: {3}to dn.subtree="ou=Password,ou=policy,dc=example,dc=org" by * none
   olcAccess: {4}to dn.subtree="ou=SUDOers,ou=policy,dc=example,dc=org" by * read by * none
   olcAccess: {5}to dn.subtree="ou=People,dc=example,dc=org" by self read by * read
   olcAccess: {6}to dn.subtree="ou=Group,dc=example,dc=org" by * read
   olcAccess: {7}to dn.subtree="dc=example,dc=org" by * search  by * none
   olcAccess: {8}to * by * none

Changed

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   olcAccess: {0}to * by dn="cn=ladpadmin,dc=example,dc=org" write by * none break
   olcAccess: {1}to attrs=sshPublicKey by self write by * none
   olcAccess: {2}to attrs=userPassword by self read by anonymous auth by * none
   olcAccess: {3}to dn.subtree="ou=ACL,ou=policy,dc=example,dc=org" by * compare by * none
   olcAccess: {4}to dn.subtree="ou=Password,ou=policy,dc=example,dc=org" by * none
   olcAccess: {5}to dn.subtree="ou=SUDOers,ou=policy,dc=example,dc=org" by * read by * none
   olcAccess: {6}to dn.subtree="ou=People,dc=example,dc=org" by self read by * read
   olcAccess: {7}to dn.subtree="ou=Group,dc=example,dc=org" by * read
   olcAccess: {8}to dn.subtree="dc=example,dc=org" by * search  by * none
   olcAccess: {9}to * by * none


sizelimit
^^^^^^^^^

Add olcSizeLimit to "cn=config".

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config cn=config

Before

.. code-block:: bash

   0 cn=config
   objectClass: olcGlobal
   cn: config
   olcArgsFile: /var/run/slapd/slapd.args
   olcLogLevel: 128
   olcPidFile: /var/run/slapd/slapd.pid
   olcTLSCertificateFile: /etc/ssl/certs/hoge.pen
   olcTLSCertificateKeyFile: /etc/ssl/private/hoge.key
   olcToolThreads: 1

Changed

.. code-block:: bash

   0 cn=config
   objectClass: olcGlobal
   cn: config
   olcArgsFile: /var/run/slapd/slapd.args
   olcLogLevel: 128
   olcPidFile: /var/run/slapd/slapd.pid
   olcTLSCertificateFile: /etc/ssl/certs/hoge.pen
   olcTLSCertificateKeyFile: /etc/ssl/private/hoge.key
   olcToolThreads: 1
   olcSizeLimit: unlimited

      
syncprov overlay
^^^^^^^^^^^^^^^^

Add a syncprov overlay DN.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase={1}hdb


Before

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   (snip)
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq

Changed

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   (snip)
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq

   add olcOverlay=syncprov,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcSyncProvConfig
   olcOverlay: syncprov


setting LDAP client of master-self
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Needs these setting in a master server.

/etc/ldap/ldap.conf

.. code-block:: bash

   URI ldap://127.0.0.1
   BASE dc=example,dc=org
   TLS_CACERTDIR /etc/ssl/certs
   TLS_REQCERT never
   ssl start_tls

Postscript
----------

Iou must not set up "/etc/ldap.conf" when using libpam-ldapd, libnss-ldapd.
Especially, you will use OpenSSH-lpk, you must use libpam-ldapd and libnss-ldapd.

	
Confirmation
^^^^^^^^^^^^

At least, this server as LDAP master of OpenLDAP2.4 on Ubuntu 12.04 is now available.
Confirmation is using "ldapsearch" command and "id" command. And you also look on a audit.log of the slave server.


.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Ubuntu
.. comments::
