uscan for GitHub as of January 2013
===================================

You should write "watch line" in debian/watch if upstream is hosted on GitHub as of January 2013.

.. code-block:: perl

   version=3
   https://github.com/<user>/<project>/tags .*/v(\d[\d\.]+)\.tar\.gz

It was missing "v" in `Debian Wiki <http://wiki.debian.org/debian/watch>`_, so I have fixed up.

.. author:: default
.. categories:: Debian
.. tags:: uscan
.. comments::
