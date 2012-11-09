Create multiple database to OpenLDAP with AppArmor
==================================================

This entry is a supplement to ":doc:`/2012/10/30/create_multiple_databases_to_openldap`".
AppArmor is disabled at Ubuntu 12.04 in the preious article. AppArmor is enable environment will fail just that steps.
Because new directory "/var/lib/ldap2" is not allowed in AppArmor policy.

After making directory and changing permission, install dependency package and change setting of AppArmor.

.. code-block:: bash

   $ sudo apt-get install apparmor-utils


Append path "/var/lib/ldap2" to config file "/etc/apparmor.d/usr.sbin.slapd".

Default;

.. code-block:: bash

   #include <tunables/global>

   /usr/sbin/slapd {
     (snip)
     # the databases and logs
     /var/lib/ldap/ r,
     /var/lib/ldap/** rwk,

     # lock file
     /var/lib/ldap/alock kw,

     (snip)


Changed;

.. code-block:: bash

   #include <tunables/global>

   /usr/sbin/slapd {
     (snip)
     # the databases and logs
     /var/lib/ldap/ r,
     /var/lib/ldap/** rwk,
     /var/lib/ldap2/ r,
     /var/lib/ldap2/** rwk,

     /var/log/ldap/ r,
     /var/log/ldap/** rwk,

     # lock file
     /var/lib/ldap/alock kw,
     /var/lib/ldap2/alock kw,

     (snip)

After Change, reload policy.

.. code-block:: bash

   $ sudo aa-enforce slapd
   Setting /etc/apparmor.d/usr.sbin.slapd to enforce mode.

The rest of the steps are the same.

.. author:: default
.. categories:: Ops
.. tags:: Ubuntu,AppArmor,OpenLDAP
.. comments::
