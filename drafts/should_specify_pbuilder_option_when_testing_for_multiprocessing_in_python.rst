Should specify pbuilder option when testing for multiprocessing in Python
=========================================================================

We should use option "--bindmounts" when pbuilder build, if test code uses shared semaphore at override_dh_auto_test.

The error as folloging occured when I made debian package `tomahawk`_ that use multiprocessing module of python, why some module of multiprocessing uses shared semaphore.::


(write later.)


.. author:: default
.. categories:: Debian
.. tags:: pbuilder, python, multiprocessing, debian
.. comments::
