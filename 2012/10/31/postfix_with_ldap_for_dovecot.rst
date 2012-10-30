Postfix with LDAP for Dovecot
=============================

When it is used for ldap server for authentication of IMAP4 or POP3 server are used with LDAP, firstly needs to set up MTA with LDAP for mail delivery to users. I have used  Postfix as MTA in this case. OS is Ubuntu 12.04, and POP3 server is dovecot2, and MTA is Postfix.

Install packages
----------------

.. code-block:: bash

   $ sudo apt-get install postfix-ldap mailutils

Install postfix-doc if you needs postfix-ldap documentation, then see /usr/share/doc/postfix/html/LDAP_README.html.

Configuration of debconf
^^^^^^^^^^^^^^^^^^^^^^^^

* General type of mail configuration

  * Internet Site

* System mail name

  * mail.example.org


Configuration
-------------

The points are next parameters of postmap for ldap.

* "query_filter" is "(mail=%s)"
* "result_attribute" is some cases
* "scope" is "one"

LDAP lookups
^^^^^^^^^^^^

postmap file name is any. I have named "/etc/postfix/ldap-alias.cf" in this case.

.. code-block:: bash

   $ sudo postconf alias_maps=hash:/etc/aliases,ldap:/etc/postfix/ldap-aliases.cf


/etc/postfix/ldap-aliases.cf is as follows. 

.. code-block:: bash

   server_host = ldap://ldap01.example.org ldap://ldap02.example.org
   timeout = 10
   search_base = ou=People,dc=example,dc=org
   domain = example.org
   query_filter = (mail=%s)
   result_attribute = mail
   scope = one
   bind = no
   dereference = 0
   start_tls = yes
   version = 3
   tls_ca_cert_dir = /etc/ssl/certs
   tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt

Confirm above settings.

.. code-block:: bash

   $ sudo postmap -q user0@example.org ldap:/etc/postfix/ldap-aliaces.cf
   user0@example.org

Create and/or update database.

.. code-block:: bash

   $ sudo postmap /etc/postfix/ldap-aliases.cf

Setting alias maps.

.. code-block:: bash   

   $ postconf alias_maps
   alias_maps = hash:/etc/aliases
   $ sudo postconf alias_maps = hash:/etc/aliases,ldap:/etc/postfix/ldap-aliases.cf

see more ldap_table(5)

domain setting
^^^^^^^^^^^^^^

.. code-block:: bash

   $ postconf mydomain
   mydomain = localdomain
   $ sudo postconf mydomain=example.org

Virtual domains
^^^^^^^^^^^^^^^

Set up "virtual_mailbox_domains" if you use virtual domains.

.. code-block:: bash

   $ postconf virtual_mailbox_domains
   virtual_mailbox_domains = $virtual_mailbox_maps
   $ sudo virtual_mailbox_domains=/etc/postfix/virtual_domains

/etc/postfix/virtual_domains

.. code-block:: bash

   example.org
   example.net
   example.com

Virtual mailbox
^^^^^^^^^^^^^^^

/etc/postfix/virtual_mailbox is follows;

.. code-block:: bash

   server_host = ldap://ldap01.example.org ldap://ldap02.example.org
   timeout = 10
   search_base = ou=People,dc=example,dc=org
   domain = example.org
   query_filter = (mail=%s)
   result_attribute = mail
   result_format = %d/%u/Maildir/
   scope = one
   bind = no
   dereference = 0
   start_tls = yes
   version = 3
   tls_ca_cert_dir = /etc/ssl/certs
   tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt

Confirmation

.. code-block:: bash

   $ postalias -q user0@example.org ldap:/etc/postfix/virtual_mailbox
   example.org/user0/Maildir/

Create database

.. code-block:: bash

   $ sudo postmap /etc/postfix/virtual_mailbox

Set up "virtual_mail_box_maps" and "virtual_mailbox_base".

.. code-block:: bash

   $ postconf virtual_mailbox_maps
   virtual_mailbox_maps =
   $ sudo postconf virtual_mailbox_maps=ldap:/etc/postfix/virtual_mailbox

   $ postconf virtual_mailbox_base
   virtual_mailbox_base =
   $ sudo postconf virtual_mailbox_base=/var/vmail


Make directory, and change owner & group, permission.

.. code-block:: bash

   $ sudo mkdir -p /var/vmail/example.org
   $ sudo chown -R root:mail /var/vmail
   $ sudo chmod 2775 /var/vmail

Mailbox owner
^^^^^^^^^^^^^

You set up mailbox owners are each uid, /etc/postfix/virtual_uids is follows;

.. code-block:: ini

   server_host = ldap://ldap01.example.org ldap://ldap02.example.org
   timeout = 10
   search_base = ou=People,dc=example,dc=org
   domain = example.org
   query_filter = (mail=%s)
   result_attribute = uidNumber
   scope = one
   bind = no
   dereference = 0
   version = 3
   start_tls = yes
   tls_ca_cert_dir = /etc/ssl/certs
   tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt

Confirm

.. code-block:: bash

   $ postalias -q user0@example.org ldap:/etc/postfix/virtual_uids
   10001

Create database

.. code-block:: bash

   $ postmap /etc/postfix/virtual_uids



Set up "virtual_uid_maps".

.. code-block:: bash

   $ postconf virtual_uid_maps
   virtual_uid_maps =
   $ sudo postconf virtual_uid_maps=ldap:/etc/postfix/virtual_uids

Mailbox group
^^^^^^^^^^^^^

Mailbox group is specified "mail" group.

.. code-block:: bash

   $ postconf virtual_gid_maps
   virtual_gid_maps =
   $ id mail
   uid=8(mail) gid=8(mail) groups=8(mail)
   $ sudo postconf virtual_gid_maps=static:8

Confirmation
^^^^^^^^^^^^

.. code-block:: bash

   $ date | mail -s test user0@example.org
   $ sudo tree /var/vmail
   /var/vmail/example.org/
   └── user0
       └── Maildir
           ├── cur
           ├── new
           │   ├── 1348801351.V805I2b4cM580106.mx2
           │   ├── 1348801351.V805I2c6dM544653.mx2
           │   ├── 1348801351.V805I2c6eM565186.mx2
           │   ├── 1348801351.V805I2c71M587794.mx2
           │   └── 1348801396.V805I232dM112750.mx2
           └── tmp

   5 directories, 5 files
   

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,Postfix
.. comments::
