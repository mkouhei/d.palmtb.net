The parameter of boot option "auto" had been changed for auto install of wheezy
===============================================================================

Debian installer is enable to install automatically with preseed as you know.
Auto installing needs boot parameter "auto" in the previous version.
But the "auto" parameter had been changed in Wheezy.

previous version

.. code-block:: sh

  auto url=autoserver

Wheezy

.. code-block:: sh

  auto=true url=autoserver


`Honjo-san <https://twitter.com/hiromiso>`_, Thanks for providing preseed configuration file.

See also
--------

The "auto" parameter is *not yet* modified in following document.

`B.2.3. Auto mode <http://www.debian.org/releases/stable/amd64/apbs02.html.en#preseed-auto>`_


.. author:: default
.. categories:: Debian
.. tags:: wheezy,preseed,auto install
.. comments::
