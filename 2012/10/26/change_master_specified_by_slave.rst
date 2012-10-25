Change master specified by syncrepl of slave
============================================

The story of this entry is a supplement of previous migration(Migration OpenLDAP 2.3 to 2.4). The third step and fourth step is the same with first step, so I omit it.
Current slave servers are OpenLDAP 2.3 on CentOS 5.4. We build New slave servers with OpenLDAP 2.4 on Ubuntu 12.04, but we must also operate legacy servers, because we don't stop these at the this time.
Need to remove database, when It is changed master server on slave.

The procedure on CentOS5.4 as slave server is follow.

.. code-block:: bash

   $ sudo /sbin/service ldap stop
   $ cd /var/lib
   $ sudo tar zcvf /path/to/ldap_backup.tgz ./ldap
   $ sudo -s
   # rm ldap/{*log*,*db*,alock}
   # exit
   $ sudo /sbin/service ldap start

A legacy slave server is enable to replicate from a new master server as OpenLDAP 2.4 on Ubuntu 12.04.

.. author:: default
.. categories:: Ops
.. tags:: OpenLDAP,CentOS
.. comments::
