LDAP of the python, by the python, and for the python
=====================================================

The title is a joke. :)

Usually, LDAP is controlled by LDIF and ldap-utils; ldapsearch, ldapadd, ldapmodify, etc. But I dislike to control many and variety data with LDIF and these tools because it is a very bother to generate LDIF. To control LDAP will be easier by programming with python-ldap. "`python-ldap provides an object-oriented API to access LDAP directory servers from Python programs <http://www.python-ldap.org/>`_". In this article I describe basic usage of python-ldap for search, add, modify, delete.

Intall python-ldap
------------------

python-ldap is provided as Debian package.

.. code-block:: bash

   $ sudo apt-get install python-ldap


Connect to LDAP server
----------------------

To connect to LDAP server in the following conditions, as described below.

* URI

  * ldap://ldap.example.org

* rootDN

  * cn=admin,dc=example,dc=org

* method

  * simple bind

.. code-block:: python

   >>> import ldap
   >>> uri = "ldap://ldap.example.org"
   >>> l = ldap.initialize(uri)
   >>> rootdn = "cn=admin,dc=example,dc=org"
   >>> password = "xxxxxxxx"
   >>> method = ldap.AUTH_SIMPLE
   >>> l.bind(rootdn, password, method)
   1

Search
------

To search with filter is following.

* search base

  * ou=People,dc=example,dc=org

* search scope

  * subtree

* search filter

  * '(uid=*)'

.. code-block:: python

   >>> search_base = 'ou=People,dc=example,dc=org'
   >>> search_scope = ldap.SCOPE_SUBTREE
   >>> search_filter = '(uid=*)'
   >>> l.search_s(search_base, search_scope, search_filter)
   [('uid=nanashigonbeh,ou=People,dc=example,dc=org', {'cn': ['gonbeh'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['99999'], 'gidNumber': ['10000'], 'sn': ['nanashi'], 'homeDirectory': ['/home/nanashigonbeh'], 'mail': ['nanashigonbeh@net.example.org'], 'uid': ['nanashigonbeh']}), ('uid=nenashigonsaku,ou=People,dc=example,dc=org', {'cn': ['gonsaku'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['99998'], 'gidNumber': ['10000'], 'sn': ['nenashi'], 'homeDirectory': ['/home/nenashigonsaku'], 'mail': ['nenashigonsaku@net.example.org'], 'uid': ['nenashigonsaku']}), ('uid=yamadataro,ou=People,dc=example,dc=org', {'cn': ['taro'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['99997'], 'gidNumber': ['10000'], 'sn': ['yamada'], 'homeDirectory': ['/home/yamadataro'], 'mail': ['yamadataro@com.example.org'], 'uid': ['yamadataro']}), ('uid=tanakajiro,ou=People,dc=example,dc=org', {'cn': ['jiro'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['99996'], 'gidNumber': ['10000'], 'sn': ['nanaka'], 'homeDirectory': ['/home/tanakajiro'], 'mail': ['tanakajiro@com.example.org'], 'uid': ['tanakajiro']})]

Format of result is following.

.. code-block:: python

   [
       ('dn', {
           'attribute': ['value'],
           'attribute': ['value', 'value', 'value'],
	   (snip)
           'attribute': ['value']
	   }),
       ('dn', {
           'attribute': ['value'],
           'attribute': ['value', 'value', 'value'],
	   ...
           'attribute': ['value']
	   }),
       (snip)
   ]

This format is enable to use for other processing.

Add
---

Firstly, you must use ldap.modlist.addModlist(). addModlist() convert dictionary into list of tuple.

.. code-block:: python

   >>> result = l.search_s(search_base, search_scope, search_filter)
   >>> result[0][1]
   {'cn': ['gonbeh'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['99999'], 'gidNumber': ['10000'], 'sn': ['nanashi'], 'homeDirectory': ['/home/nanashigonbeh'], 'mail': ['nanashigonbeh@net.example.org'], 'uid': ['nanashigonbeh']}
   >>> import ldap.modlist
   >>> data_l = ldap.modlist.addModlist(result[0][1])
   >>> data_l
   [('cn', ['gonbeh']), ('objectClass', ['top', 'inetOrgPerson', 'posixAccount']), ('userPassword', ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b==']), ('uidNumber', ['99999']), ('gidNumber', ['10000']), ('sn', ['nanashi']), ('homeDirectory', ['/home/nanashigonbeh']), ('mail', ['nanashigonbeh@net.example.org']), ('uid', ['nanashigonbeh'])]


Override values of "uid", "sn", "cn", "uidNumber", "homeDirectory", "mail" as like folloing.

.. code-block:: python

   >>> user = result[0][1].copy()
   >>> user['uid'] = ['foobar']
   >>> user['sn'] = ['foo']
   >>> user['cn'] = ['bar']
   >>> user['uidNumber'] = ['123456']
   >>> user['homeDirectory'] = ['/home/foobar']
   >>> user['mail'] = ['foobar@example.org']
   >>> user
   {'cn': ['bar'], 'objectClass': ['top', 'inetOrgPerson', 'posixAccount'], 'userPassword': ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b=='], 'uidNumber': ['123456'], 'gidNumber': ['10000'], 'sn': ['foo'], 'homeDirectory': ['/home/foobar'], 'mail': ['foobar@example.org'], 'uid': ['foobar']}

Convert with addModlist().

.. code-block:: python

   >>> user_l = ldap.modlist.addModList(user)
   >>> user_l
   [('cn', ['bar']), ('objectClass', ['top', 'inetOrgPerson', 'posixAccount']), ('userPassword', ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b==']), ('uidNumber', ['123456']), ('gidNumber', ['10000']), ('sn', ['foo']), ('homeDirectory', ['/home/foobar']), ('mail', ['foobar@example.org']), ('uid', ['foobar'])]

To add data is necessary to use add_s() with dn and list of data.
When it is succeed to add, the response is "(105, [])". “105” is tag of adding.

.. code-block:: python

   >>> dn = result[0][0]
   >>> dn
   'uid=nanashi_gonbeh,ou=People,dc=example,dc=org'
   >>> dn = 'foobar,ou=People,dc=example,dc=org'
   >>> l.add_s(dn, user_l,)
   (105, [])

Compare and modify
------------------

To detect changed data, use compare_s(). 
To need to prepare below data. First argument is dn, second argument is attribute name, third argument is value (value is not list).

Compare
^^^^^^^

.. code-block:: python

   >>> user2 = result[0]
   >>> user2[1]['userPassword']
   ['{SSHA}M6H0rX2tGCwf6jBcgdP2hxSRisVoY55b==']
   >>> password = '{SSHA}Z7H50qdkcYdH+8ghga6MCevOSa8ax3xp'
   >>> userdn2 = user2[0]
   >>> l.compare_s(userdn2, 'userPassword', user2[1].get('userPassword')]
   0
   >>> l.compare_s(userdn2, 'userPassword', password)
   1

0 is not changed, 1 is changed.
When result of compare_s() is "1", I'll use data for modify.

Modify
^^^^^^

We must use ldap.modlist.modifyModlist() to modify data. First argument is current data without dn, second argument is new data without dn.

.. code-block:: python

   >>> mod_info_l = ldap.modlist.modifyModlist(current_dict, new_dict)
   >>> mod_info_l
   [(1, 'userPassword', None), (0, 'userPassword', ['{SSHA}Z7H50qdkcYdH+8ghga6MCevOSa8ax3xp'])]

If multiple attributes are changed as like following,

.. code-block:: python

   >>> ldap.modlist.modifyModlist(current, new)
   [(1, 'cn', None), (0, 'cn', ['bar']), (1, 'uidNumber', None), (0, 'uidNumber', ['123456']), (1, 'sn', None), (0, 'sn', ['foo']), (1, 'homeDirectory', None), (0, 'homeDirectory', ['/home/foobar']), (1, 'mail', None), (0, 'mail', ['foobar@example.org']), (1, 'uid', None), (0, 'uid', ['foobar'])]

modify with modify_s() using data that specified with dn and modlist data.
When It is succeed to modify, the result is "(103, [])".
“103” is tag of modify.

.. code-block:: python

   >>> l.modify_s(dn, mod_info_l)
   (103, [])

Delete
------

Delete is specified dn only.

.. code-block:: python

   >>> l.delete_s(dn)
   (107, [], 12, [])

“107” is tag of delete.
“12” is sequence number of registered ldap object.   

See also
--------

* `Documentation <http://www.python-ldap.org/>`_

.. author:: default
.. categories:: Dev
.. tags:: Python,OpenLDAP
.. comments::
