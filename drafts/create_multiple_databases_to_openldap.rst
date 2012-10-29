Create multiple databases to OpenLDAP
=====================================

You can create a new other database with follow procedure when Already a database is existed.

Setting of OpenLDAP
-------------------

.. code-block:: bash

   $ sudo mkdir /var/lib/ldap2
   $ sudo chown openldap:openldap /var/lib/ldap2
   $ sudo ldapvi -Y EXTERNAL -h ldapi:/// -b cn=config

Append follow to last lines with a blank line.

.. code-block:: bash

   add olcDatabase=hdb,cn=config
   objectClass: olcDatabaseConfig
   objectClass: olcHdbConfig
   olcDatabase: {1}hdb
   olcDbDirectory: /var/lib/ldap2
   olcSuffix: dc=example,dc=org
   olcAccess: {0}to attrs=userPassword,shadowLastChange by self write by anonymous auth by dn="cn=admin,dc=example,dc=org" write by * none
   olcAccess: {1}to dn.base="" by * read
   olcAccess: {2}to * by self write by dn="cn=admin,dc=example,dc=org" write by * read
   olcLastMod: TRUE
   olcRootDN: cn=admin,dc=example,dc=org
   olcRootPW: {SSHA}AWtw2vmrYibntFzTJrcxjW13A3xlI+ck
   olcDbCheckpoint: 512 30
   olcDbConfig: {0}set_cachesize 0 2097152 0
   olcDbConfig: {1}set_lk_max_objects 1500
   olcDbConfig: {2}set_lk_max_locks 1500
   olcDbConfig: {3}set_lk_max_lockers 1500
   olcDbIndex: objectClass eq

   (save then,)
   add: 1, rename: 0, modify: 0, delete: 0
   Action? [yYqQvVebB*rsf+?] y
   Done

Generate password for rootdn of a new database
----------------------------------------------

.. code-block:: bash

   $ slappasswd
   New password:
   Re-enter new password:
   {SSHA}3n2Z4m3XfLFMV6wK+neR8bGlptUHJpJC


Add new entries to new database
-------------------------------

You should use '-A' option, this option start with an empty file without searcing.

.. code-block:: bash

   $ sudo ldapvi -D cn=admin,dc=example,dc=org -A
   
   --- Login
   Type M-h for help on key bindings.
   
   Filter or DN: cn=admin,dc=example,dc=org
   Password: ********

Example entries is follow

.. code-block:: bash

   add dc=example,dc=org
   objectClass: top
   objectClass: dcObject
   objectClass: organization
   o: example.org
   dc: example

   add cn=admin,dc=example,dc=org
   objectClass: simpleSecurityObject
   objectClass: organizationalRole
   cn: admin
   description: LDAP administrator
   userPassword: {SSHA}3n2Z4m3XfLFMV6wK+neR8bGlptUHJpJC

   add ou=People,dc=example,dc=org
   objectClass: organizationalUnit
   ou: People

   (save, then)
   add: 3, rename: 0, modify: 0, delete: 0
   Action? [yYqQvVebB*rsf+?] y
   Done

At this point, you will be able to do the entry in the same way as the existing LDAP database.

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,ldapvi
.. comments::
