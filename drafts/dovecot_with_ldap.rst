Dovecot with LDAP
=================

Before Set up Dovecot with LDAP, you should prepare Postfix with LDAP. See also ":doc:`/2012/10/31/postfix_with_ldap_for_dovecot`".


Install packages
----------------

.. code-block:: bash

   $ sudo apt-get install dovecot-pop3d dovecot-lmtpd dovecot-ldap dovecot-postfix


Configuration
-------------

/etc/dovecot/dovecot.conf
^^^^^^^^^^^^^^^^^^^^^^^^^

This file is basic configuration. It will be not changed.

.. code-block:: bash

   !include_try /usr/share/dovecot/protocols.d/*.protocol
   dict {
   }
   !include conf.d/*.conf
   !include_try local.conf

/etc/dovecot/dovecot-ldap.conf.ext
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You configure the connection to LDAP, and mapping of LDAP attributes in this file.

Default is enable "base = " only. The value of "base" is null.

After change;

.. code-block:: bash

   uris = ldap://ldap01.example.org/ ldap://ldap02.example.org/
   tls = yes
   tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt
   tls_ca_cert_dir = /etc/ssl/certs
   auth_bind = yes
   auth_bind_userdn = uid=%n,ou=People,dc=example,dc=org
   ldap_version = 3
   base = ou=People,dc=example,dc=org
   deref = never
   scope = subtree
   user_attrs = homeDirectory=home,uidNumber=uid,gidNumber=gid
   user_filter = (&(objectClass=posixAccount)(uid=%n))
   pass_attrs = uid=user,userPassword=password
   pass_filter = (&(objectClass=posixAccount)(uid=%n))

"user_attrs" and "user_filter" are related user account.

* "homeDirectory", "uidNumber" and "gidNumber" are LDAP attributes
* "home", "uid" and "gid" are Dovecot attributes

"pass_attrs" and "pass_filter" are related password.

* "uid" and "userPassword" are LDAP attributes
* "user" and "password" are Dovecot attributes.

"%n" is user part in "user@domain" of mail address. I will user account mail address. See also `Variables (of Dovecot) <http://wiki2.dovecot.org/Variables>`_.

/etc/dovecot/conf.d/10-auth.conf
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Change authentication mechanism for using LDAP.

Default;

.. code-block:: bash

   auth_mechanisms = plain
   !include auth-system.conf.ext

After change;

.. code-block:: bash

   auth_mechanisms = plain
   !include auth-ldap.conf.ext


/etc/doveconf/conf.d/10-mail.conf
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Set up location of mail delivery.

Default is null.

After change;

.. code-block:: bash

   mail_location = maildir:/var/vmail/%d/%n/Maildir


Login account is email address. (user0@example.org)
But this domain name is dummy. "auth_bind_userdn" specify "uid=%n", "%n" is account name only.
If support multiple domain, follow, and change LDAP setting of userdn to using "mailAddress", and "olcAccess".


Check configuration
-------------------

Check configuration finally with "doveconf -n" command.

See also
--------

Multiple LDAP authentication servers 

* http://www.dovecot.org/list/dovecot/2011-October/061431.html
* http://www.dovecot.org/list/dovecot/2011-October/061431.html
* http://www.dovecot.org/list/dovecot/2011-October/061435.html
* https://help.ubuntu.com/community/Dovecot
* https://help.ubuntu.com/community/DovecotLDAP
* https://help.ubuntu.com/community/POP3Aggregator
* http://wiki2.dovecot.org/Variables


.. author:: default
.. categories:: Ops
.. tags:: dovecot,OpenLDAP,Postfix,Ubuntu
.. comments::
