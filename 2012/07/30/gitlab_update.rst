Updating from 2.4.2 to 2.7.0 of GitLab
======================================

My colleague requested me to update GitLab from 2.4.2 to 2.7.0. Then I did it. The procedure is accoding to documents of GitLab, next links.

* https://github.com/gitlabhq/gitlabhq/wiki/From-2.4.1-to-2.5.0
* https://github.com/gitlabhq/gitlabhq/wiki/From-2.5.0-to-2.6.0
* https://github.com/gitlabhq/gitlabhq/wiki/From-2.6.x-to-2.7.0

I upgraded from 2.4.2 to 2.7.0 without at once, it was upgraded in stages. I made the record to the following procedure.

from 2.4.2 to 2.5.0
-------------------

.. code-block:: bash

   $ sudo /etc/init.d/gitlab stop
   $ sudo su - gitlab
   $ cd gitlab
   $ git remote update
   $ git checkout v2.5.0
   $ git checkout -b v2.5.0
   $ bundle install --without development test
   $ exit
   $ sudo gem update --system
   $ sudo su - gitlab
   $ bundle exec rake db:migrate RAILS_ENV=production
   $ exit
   $ sudo /etc/init.d/gitlab start

from 2.5.0 to 2.6.0
-------------------

.. code-block:: bash

   $ sudo /etc/init.d/gitlab stop
   $ sudo su - gitlab
   $ git checkout v2.6.0
   $ git checkout -b v2.6.0
   $ bundle install --without development test
   $ bundle exec rake db:migrate RAILS_ENV=production
   $ exit 
   $ sudo /etc/init.d/gitlab start

from 2.6.0 to 2.7.0
-------------------

.. code-block:: bash

   $ sudo /etc/init.d/gitlab stop
   $ sudo su - gitlab
   $ git stash
   $ git checkout v2.7.0
   $ git checkout -b v2.7.0
   $ cp -i config/gitlab.yml.example config/gitlab.yml
   $ sed -i 's/localhost/gitlab.example.org/g' config/gitlab.yml
   $ bundle install --without development test
   $ bundle exec rake db:migrate RAILS_ENV=production
   $ touch log/githost.log
   $ exit
   $ sudo /etc/init.d/gitlab start


* If just copy config/gitlab.yml.example to config/gitlab.yml, it occurs problem in the WebUI that be 'localhost' instead of FQDN. This is as a previous article. See also ":doc:`/2012/05/11/gitlab`".
* If not touch log/githost.log, http 500 error occurs at Logs view of admin area.


.. author:: default
.. categories:: Ops
.. tags:: Git, GitLab
.. comments::
