Replication from OpenLDAP 2.3 to 2.4
====================================

The story of this entry is previous migration first step (:doc:`/2012/09/20/migrate_2_3_with_slapd_conf_to_2_4_with_slapd_config`). Master and slave servers that are OpenLDAP 2.3 with slapd.conf on CentOS 5.4 are running currently. I have prepared OpenLDAP 2.4 with slapd-config on Ubuntu 12.04 as slave server.

Install packages
----------------

.. code-block:: bash

   $ sudo apt-get install slapd ldap-utils

Debconf setting is follows;

slapd configuration
^^^^^^^^^^^^^^^^^^^

* Administrator password
* Confirm password

Setup OpenLDAP
--------------

I have set up with LDIF files of prepared schemas in previous story.

.. code-block:: bash

   $ sudo vi /etc/default/slapd
   

default:

.. code-block:: bash

   SLAPD_SERVICES="ldap:/// ldapi:///"

Changed:

.. code-block:: bash

   SLAPD_SERVICES="ldap:/// ldaps:/// ldapi:///"

Restart slapd.

.. code-block:: bash

   $ sudo service slapd restart


Change schemas
^^^^^^^^^^^^^^

I have changed "core.schema" using ldapvi because the present core.schema had been customized.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn={0}core
   (snip)
   olcAttributeTypes: {51}( 1.2.840.113549.1.9.1 NAME ( 'email' 'emailAddress' 'pkcs9email' ) DESC 'RFC3280: legacy attribute for email addresses in DNs' EQUALITY caseIgnoreIA5Match SUBSTR caseIgnoreIA5SubstringsMatch SYNTAX 1.3.6.1.4.1.1466.115.121.1.26{128} )
   (snip)
   
The details of changes are omitted.

Import additional schema
^^^^^^^^^^^^^^^^^^^^^^^^

I have added previous prepared schemas.

.. code-block:: bash

   $ sudo ldapadd -Y EXTERNAL -H ldapi:// -f ~/local.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi:// -f ~/sudo.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi:// -f ~/openssh-lpk.ldif
   $ sudo ldapadd -Y EXTERNAL -H ldapi:// -f /etc/ldap/schema/ppolicy.ldif

ppolicy is present by default, but not load.

Load module
^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn=module{0}


Default is follow;

.. code-block:: bash

   0 cn=module{0},cn=config
   objectClass: olcModuleList
   cn: module{0}
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: {0}back_hdb

Change is follows;

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
   olcModuleLoad: auditlog.la

   add cn=module,cn=config
   objectClass: olcModuleList
   cn: module
   olcModulePath: /usr/lib/ldap
   olcModuleLoad: ppolicy.la

Use "add" command when using new dn.

Change suffix
^^^^^^^^^^^^^

Default suffix is "cn=admin,dc=nodomain". I have replaced “admin” to “ldapadmin”, “dc=nodomain” to “dc=example,dc=org”. Changes lines are follow.

* olcSuffix
* olcAccess {0}, {2}
* olcRootDN

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb

Default is follow;

.. code-block:: bash

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
   olcRootPW: {SSHA}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   olcDbCheckpoint: 512 30
   olcDbConfig: {0}set_cachesize 0 2097152 0
   olcDbConfig: {1}set_lk_max_objects 1500
   olcDbConfig: {2}set_lk_max_locks 1500
   olcDbConfig: {3}set_lk_max_lockers 1500
   olcDbIndex: objectClass eq
   olcRootDN: cn=admin,dc=nodomain
		
Change is follow; 

.. code-block:: bash

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
   olcRootPW: {SSHA}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   olcDbCheckpoint: 512 30
   olcDbConfig: {0}set_cachesize 0 2097152 0
   olcDbConfig: {1}set_lk_max_objects 1500
   olcDbConfig: {2}set_lk_max_locks 1500
   olcDbConfig: {3}set_lk_max_lockers 1500
   olcDbIndex: objectClass eq
   olcRootDN: cn=ladpadimn,dc=example,dc=org

Index
^^^^^

objectClass and entryCSN,entryUUID is required for replication at least.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase=hdb olcDbIndex

Default:

.. code-block:: bash

   olcDbIndex: objectClass eq

Changed:

.. code-block:: bash

   olcDbIndex: objectClass eq,pres
   (snip)
   olcDbIndex: entryCSN,entryUUID eq

Other changes are ommitted.

TLS Certifiation
^^^^^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config cn=config

Add path of certification and key file to olcTLSCertificateFile, olcTLSCertificateKeyFile.

for example, using /etc/ssl/private/hoge.key and /etc/ssl/cert/hoge.pem,

Default

.. code-block:: bash

   0 cn=config
   objectClass: olcGlobal
   cn: config
   olcArgsFile: /var/run/slapd/slapd.args
   olcLogLevel: none
   olcPidFile: /var/run/slapd/slapd.pid
   olcToolThreads: 1


Changed

.. code-block:: bash

   0 cn=config
   objectClass: olcGlobal
   cn: config
   olcArgsFile: /var/run/slapd/slapd.args
   olcLogLevel: none
   olcPidFile: /var/run/slapd/slapd.pid
   olcToolThreads: 1
   olcTLSCertificateFile: /etc/ssl/certs/hoge.pem
   olcTLSCertificateKeyFile: /etc/ssl/private/hoge.key

LogLevel
^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config cn=config olcLogLevel

Default

.. code-block:: bash

   0 cn=config
   olcLogLevel: none

Changed

.. code-block:: bash

   0 cn=config
   olcLogLevel: 512

`Change rsyslog setting when next error occurs. <https://help.ubuntu.com/12.04/serverguide/openldap-server.html>`_

.. code-block:: bash

   rsyslogd-2177: imuxsock lost 228 messages from pid 2547 due to rate-limitin

Add follow parameter to /etc/rsyslog.conf

.. code-block:: bash

   # Disable rate limiting
   # (default is 200 messages in 5 seconds; below we make the 5 become 0)
   $SystemLogRateLimitInterval 0

Restart rsyslog.

.. code-block:: bash

   $ sudo service rsyslog restart

DB Cachesize
^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb olcDbCacheSize 

Default:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config

Changed:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   olcDbCacheSize: 2000

DB IDL Cache size

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb olcDbIDLcacheSize

Changed:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   olcDbIDLcacheSize: 2000



Access control
^^^^^^^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:// -b cn=config olcDatabase={1}hdb olcAccess

Default:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   olcAccess: {0}to attrs=userPassword,shadowLastChange by self write by anonymous auth by dn="cn=ldapadmin,dc=example,dc=org" write by * none
   olcAccess: {1}to dn.base="" by * read
   olcAccess: {2}to * by self write by dn="cn=ldapadmin,dc=example,dc=org" write by * read

Changed:

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

OpenLDAP 2.4 needs the rule of ‘to dn.subtree=”dc=example,dc=org” by * search by * none’, OpenLDAP 2.3 does not needs.


auditlog
^^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase={1}hdb

Changed:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   (snip)

   add olcOverlay=auditlog,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcAuditLogConfig
   olcOverlay: auditlog
   olcAuditlogFile: /var/log/ldap/audit.log

make directory.

.. code-block:: bash

   $ sudo mkdir /var/log/ldap
   $ sudo chown -R openldap: /var/log/ldap

ppolicy
^^^^^^^

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase={1}hdb


Changed:

.. code-block:: bash

   0 olcDatabase={1}hdb,cn=config
   (snip)

   add olcOverlay=ppolicy,olcDatabase={1}hdb,cn=config
   objectClass: olcOverlayConfig
   objectClass: olcPPolicyConfig
   olcOverlay: ppolicy
   olcPPolicyDefault: cn=default,ou=Password,ou=policy,dc=example,dc=org
   olcPPolicyUseLockout: TRUE

Replication
^^^^^^^^^^^

olcDbIndex entryUUID must be “eq”. Change rid, provider, and credentials of follow.

.. code-block:: bash

   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config olcDatabase=hdb

Default:

.. code-block:: bash

   (snip)
   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq


Changed:

.. code-block:: bash

   olcDbIndex: uidNumber,gidNumber eq
   olcDbIndex: uniqueMember,memberUid eq
   olcSyncrepl: rid=xxx provider=ldaps://xxx.xxx.xxx.xxx bindmethod=simple binddn="cn=ldapadmin,dc=example,dc=org" credentials=xxxxxxxx searchbase="dc=example,dc=org" type=refreshAndPersist retry="5 10 60 +"
   olcUpdateRef: ldaps://xxx.xxx.xxx.xxx


If you change master server, choise one of two method.

1. Remove current syncrepl setting and restart slapd, then add new syncrepl setting. (Don’t forget restart slapd.)
2. Stop slapd, then remove /var/lib/ldap/\*, start slapd, change syncrepl setting.

Change parameters are rid, master server uri, and credential. You must execute plan 2) when there is next message on Syslog. This time setting only user for replication and the access control has been omitted.

.. code-block:: ini

   Sep 13 19:27:08 ldaptest01 slapd[3272]: do_syncrepl: rid=xxx rc -2 retrying
   Sep 13 19:28:08 ldaptest01 slapd[3272]: do_syncrep2: rid=xxx LDAP_RES_SEARCH_RESULT (53) Server is unwilling to perform
   Sep 13 19:28:08 ldaptest01 slapd[3272]: do_syncrep2: rid=xxx (53) Server is unwilling to perform

ldap client for self
^^^^^^^^^^^^^^^^^^^^

Install libnss-ldapd, libpam-ldapd but not libnss-ldap, libpam-ldap.

.. code-block:: bash

   $ sudo apt-get install libnss-ldapd libpam-ldapd nslcd

/etc/nsswtich.conf and /etc/pam.d/common-{account,auth,password,sesson,session-noninteractive} are changed by Debconf of postinst.

nslcd configuration
^^^^^^^^^^^^^^^^^^^

* LDAP server URI:

  * ldap://localhost

* LDAP server search base:

  * dc=example,dc=org

* Check server’s SSL certificate:

  * never


nslcd
^^^^^

/etc/nslcd.conf

.. code-block:: bash

   uid nslcd
   gid nslcd
   uri ldap://localhost
   base dc=example,dc=org
   ssl start_tls
   tls_reqcert never

/etc/ldap.conf

.. code-block:: bash

   base dc=example,dc=org
   timelimit 120
   bind_timelimit 120
   bind_policy soft
   idle_timelimit 3600
   nss_initgroups_ignoreusers root,ldap,named,avahi,haldaemon,dbus,radvd,tomcat,radiusd,news,mailman,nslcd,gdm
   tls_checkpeer no
   tls_cacertdir /etc/ssl/certs
   tls_cacertfile /etc/ssl/certs/hoge.pem
   ssl start_tls
   uri ldap://localhost/
   pam_groupdn ou=ACL,ou=policy,dc=example,dc=org
   pam_member_attribute member
   sudoers_base ou=SUDOers,ou=policy,dc=example,dc=org
   sudoers_debug 2

/etc/ldap/ldap.conf

.. code-block:: bash

   URI ldap://localhost
   BASE dc=example,dc=org
   TLS_CACERTDIR /etc/ssl/certs
   TLS_REQCERT never
   ssl start_tls

Confirmation
------------

At least, replication of from the master of OpenLDAP 2.3 on CentOS5.4 to the slave OpenLDAP2.4 on Ubuntu 12.04 is now available. Replication is going to be running at the stage has been set for replication. Whether replication is done, you can be found at audit.log. Other confirmation is using ldapsearch command and id command.

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Ubuntu,CentOS,nslcd,rsyslog
.. comments::
