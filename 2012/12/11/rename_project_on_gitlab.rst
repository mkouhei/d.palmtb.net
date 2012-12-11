Rename project on GitLab
========================

If you want rename project on GitLab, I think you will do it as following.

#. move "Project home"
#. "Edit"
#. Change "Project name"
#. "Save"

But you cannot change path of remote repository in this way.
If you will change path, you take a next method.

#. Create new project.
#. Change local repository.
#. git push

But you cannot port existed issues on GitLab 3.1. So you must change data with SQL directly.

.. code-block:: bash

   $ mysql -u root -p gitlabhq_production
   mysql> select id, name from projects;
   +----+------------------------+
   | id | name                   |
   +----+------------------------+
   (snip)
   | 35 | test-project           |
   (snip)
   | 39 | prod-project           |
   +----+------------------------+
   29 rows in set (0.00 sec)
   
   mysql> select project_id from issues where project_id = '35';
   +------------+
   | project_id |
   +------------+
   |         35 |
   |         35 |
   |         35 |
   |         35 |
   |         35 |
   |         35 |
   |         35 |
   +------------+
   7 rows in set (0.00 sec)
   
   mysql> update issues set project_id = '39' where project_id = '35';
   Query OK, 7 rows affected (0.03 sec)
   Rows matched: 7  Changed: 7  Warnings: 0


.. author:: default
.. categories:: Ops
.. tags:: GitLab,MySQL
.. comments::
