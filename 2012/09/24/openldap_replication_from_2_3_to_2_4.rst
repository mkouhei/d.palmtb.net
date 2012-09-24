OpenLDAP_replication_from_2.3_to_2.4
====================================

The story of this entry is previous migration first step. There are OpenLDAP 2.3 with slapd.conf on CentOS 5.4 as master and slave servers. I have prepared OpenLDAP 2.4 with slapd-config on Ubuntu 12.04.

Install packages
----------------

.. code-block:: bash

   $ sudo apt-get install slapd ldap-utils

Debconf setting is follows;

slapd configuration
^^^^^^^^^^^^^^^^^^^

* Administrator password
* Confirm password

nslcd configuration
^^^^^^^^^^^^^^^^^^^

* LDAP server URI:

  * ldap://localhost

* LDAP server search base:

  * dc=example,dc=org

* Check server’s SSL certificate:

  * never

Change parameters
-----------------

Change schemas
^^^^^^^^^^^^^^

Current core.schema is customized, then I have changed with ldapvi.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn={0}core
   (snip)
   olcAttributeTypes: {51}( 1.2.840.113549.1.9.1 NAME ( 'email' 'emailAddress' 'pkcs9email' ) DESC 'RFC3280: legacy attribute for email addresses in DNs' EQUALITY caseIgnoreIA5Match SUBSTR caseIgnoreIA5SubstringsMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.26{128} )
   (snip)
   
I have changed schema and saved. (Changed string are not shown this time)

Import additional schema
^^^^^^^^^^^^^^^^^^^^^^^^

I have added schemas prepared previous entry.

.. code-block:: bash

   $ sudo ldapadd -Y EXTERNAL -H ldapi://  -f local.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi://  -f sudo.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi://  -f openssh-lpk.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi:/// -f ppolicy.ldif

ppolicy is not load in default.

Load module
^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn=module{0}


Default is follow;

.. code-block:: ini

   0 cn=module{0},cn=config
   objectClass: olcModuleList
   cn: module{0}
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: {0}back_hdb

After is follows;

.. code-block:: ini

   0 cn=module{0},cn=config
   objectClass: olcModuleList
   cn: module{0}
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: {0}back_hdb

   add cn=module,cn=config
   objectClass: olcModuleList
   cn: module
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: auditlog.la

   add cn=module,cn=config
   objectClass: olcModuleList
   cn: module
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: ppolicy.la

Use "add" command when using new dn.

Change suffix
^^^^^^^^^^^^^

I have replaced “admin” to “ldapadmin”, “dc=nodomain” to “dc=example,dc=org”.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb

Default is follow;

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   objectClass: olcDatabaseConfig
   objectClass: olcHdbConfig
   olcDatabase: {1}hdb
   olcDbDirectory: /var/lib/ldap
   olcSuffix: dc=nodomain
   olcAccess: {0}to attrs=userPassword,shadowLastChange by self write by anonymous auth by dn="cn=admin,dc=nodomain" write by * none
   olcAccess: {1}to dn.base="" by * read
   olcAccess: {2}to * by self write by dn="cn=admin,dc=nodomain" write by * read
   olcLastMod: TRUE
   olcRootPW: {SSHA}569KdBIAbeq3XxkXRvMuIYUfjsQh1fd2
   olcDbCheckpoint: 512 30
   olcDbConfig: {0}set_cachesize 0 2097152 0
   olcDbConfig: {1}set_lk_max_objects 1500
   olcDbConfig: {2}set_lk_max_locks 1500
   olcDbConfig: {3}set_lk_max_lockers 1500
   olcDbIndex: objectClass eq
   olcRootDN: cn=admin,dc=nodomain
		
Changed is follow; 

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   objectClass: olcDatabaseConfig
   objectClass: olcHdbConfig
   olcDatabase: {1}hdb
   olcDbDirectory: /var/lib/ldap
   olcSuffix: dc=example,dc=org
   olcAccess: {0}to attrs=userPassword,shadowLastChange by self write by anonymous auth by dn="cn=ldapadmin,dc=example,dc=org" write by * none
   olcAccess: {1}to dn.base="" by * read
   olcAccess: {2}to * by self write by dn="cn=ldapadmin,dc=example,dc=org" write by * read
   olcLastMod: TRUE
   olcRootPW: {SSHA}569KdBIAbeq3XxkXRvMuIYUfjsQh1fd2
   olcDbCheckpoint: 512 30
   olcDbConfig: {0}set_cachesize 0 2097152 0
   olcDbConfig: {1}set_lk_max_objects 1500
   olcDbConfig: {2}set_lk_max_locks 1500
   olcDbConfig: {3}set_lk_max_lockers 1500
   olcDbIndex: objectClass eq
   olcRootDN: cn=ladpadimn,dc=example,dc=org

Index
^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb olcDbIndex

Default:

.. code-block:: ini

   olcDbIndex: objectClass eq

Changed:

.. code-block:: ini

   olcDbIndex: objectClass eq,pres
   olcDbIndex: uid eq,pres,sub
   olcDbIndex: uniqueMember,memberUid eq
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: cn eq
   olcDbIndex: sudoUser eq,sub
   olcDbIndex: description eq
   olcDbIndex: entryCSN,entryUUID eq

TLS Certifiation
^^^^^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn=config

Add olcTLSCertificateFile, olcTLSCertificateKeyFile.

DB Cachesize
^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb olcDbCacheSize

Default:

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config

Added:

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   olcDbCacheSize: 2000


.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb olcDbIDLcacheSize

Added:

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   olcDbIDLcacheSize: 2000

Access control
^^^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase={1}hdb olcAccess

Default:

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   olcAccess: {0}to attrs=userPassword,shadowLastChange by self write by anonymous auth by dn="cn=ldapadmin,dc=example,dc=org" write by * none
   olcAccess: {1}to dn.base="" by * read
   olcAccess: {2}to * by self write by dn="cn=ldapadmin,dc=example,dc=org" write by * read

Changed:

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   olcAccess: {0}to * by dn="cn=admin,dc=example,dc=org" write by * none break
   olcAccess: {1}to attrs=userPassword by self read by anonymous auth by * none
   olcAccess: {2}to dn.subtree="ou=ACL,dc=example,dc=org" by * compare by * none
   olcAccess: {3}to dn.subtree="ou=Password,dc=example,dc=org" by * none
   olcAccess: {4}to dn.subtree="ou=SUDOers,dc=example,dc=org" by * read by * none
   olcAccess: {5}to dn.subtree="ou=People,dc=example,dc=org" by self read by * read
   olcAccess: {6}to dn.subtree="ou=Group,dc=example,dc=org" by * read
   olcAccess: {7}to dn.subtree="dc=example,dc=org" by * search  by * none
   olcAccess: {8}to * by * none


auditlog
^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase={1}hdb

Added;

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   (snip)

   add olcOverlay=auditlog,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcAuditLogConfig
   olcOverlay: auditlog
   olcAuditlogFile: /var/log/ldap/auditlog.log

ppolicy
^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase={1}hdb


Added;

.. code-block:: ini

   0 olcDatabase={1}hdb,cn=config
   (snip)

   add olcOverlay=ppolicy,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcPPolicyConfig
   olcOverlay: ppolicy

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config

Default;

.. code-block:: ini

   (snip)
   18 olcOverlay={1}ppolicy,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcPPolicyConfig
   olcOverlay: {1}ppolicy

Added; 

.. code-block:: ini

   (snip)
   18 olcOverlay={1}ppolicy,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcPPolicyConfig
   olcOverlay: {1}ppolicy
   olcPPolicyDefault: cn=default,ou=Password,dc=example,dc=org
   olcPPolicyUseLockout: TRUE

Replication
^^^^^^^^^^^

olcDbIndex entryUUID must be “eq”. Change rid, provider, and credentials of follow.

.. code-block:: bash

$ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb


Default;

.. code-block:: ini

   (snip)
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq


Added;

.. code-block:: ini

   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq
   olcSyncrepl:  rid=xxx provider=ldaps://xxx.xxx.xxx.xxx bindmethod=simple binddn="cn=ldapadmin,dc=example,dc=org" credentials=xxxxxxxx searchbase="dc=example,dc=org" type=refreshAndPersist retry="5 10 60 +"
   olcUpdateRef: ldaps://xxx.xxx.xxx.xxx


If you change master server, choise one of two method.

A. Remove current syncrepl setting and restart slapd, then add new syncrepl setting. (Don’t forget restart slapd.)
B. Stop slapd, then remove /var/lib/ldap/\*, start slapd, change syncrepl setting.

Change parameters are rid, master server uri, and credential. You must execute plan b) when there is next message on Syslog.

.. code-block:: ini

   Sep 13 19:27:08 ldaptest01 slapd[3272]: do_syncrepl: rid=703 rc -2 retrying
   Sep 13 19:28:08 ldaptest01 slapd[3272]: do_syncrep2: rid=703 LDAP_RES_SEARCH_RESULT (53) Server is unwilling to perform
   Sep 13 19:28:08 ldaptest01 slapd[3272]: do_syncrep2: rid=703 (53) Server is unwilling to perform

ldap client for self
^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   $ sudo apt-get install libnss-ldapd libpam-ldapd nslcd

/etc/nsswtich.conf and /etc/pam.d/common-{account,auth,password,sesson,session-noninteractive} are changed by Debconf of postinst.

nslcd
^^^^^

/etc/nslcd.conf

.. code-block:: ini

   uid nslcd
   gid nslcd
   uri ldap://localhost
   base dc=example,dc=jp
   ssl start_tls
   tls_reqcert never

/etc/ldap.conf

.. code-block:: ini

   base dc=example,dc=jp
   timelimit 120
   bind_timelimit 120
   bind_policy soft
   idle_timelimit 3600
   nss_initgroups_ignoreusers root,ldap,named,avahi,haldaemon,dbus,radvd,tomcat,radiusd,news,mailman,nslcd,gdm
   tls_checkpeer no
   tls_cacertdir /etc/ssl/certs
   tls_cacertfile /etc/ssl/certs/mydomain.crt
   ssl start_tls
   uri ldap://localhost/
   pam_groupdn ou=ACL,dc=example,dc=org
   pam_member_attribute member
   sudoers_base ou=SUDOers,dc=example,dc=org
   sudoers_debug 2

/etc/ldap/ldap.conf

.. code-block:: ini

   URI ldap://localhost
   BASE dc=example,dc=org
   TLS_CACERTDIR /etc/ssl/certs
   TLS_REQCERT never
   ssl start_tls


.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Ubuntu
.. comments::
