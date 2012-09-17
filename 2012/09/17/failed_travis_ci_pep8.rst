Fail testing pep8 with travis-ci
================================

I use travis-ci for GitHub, but test_pep8 failed.

.. code-block:: bash

   (snip)
   $ pip install -r requirements.txt --use-mirrors
   Downloading/unpacking pep8 (from -r requirements.txt (line 1))
     Downloading pep8-1.3.3.tar.gz
     Running setup.py egg_info for package pep8
   (snip)
   Successfully installed pep8 minimock
   Cleaning up...
   $ nosetests
   ............E....
   ======================================================================
   ERROR: tonicdnscli.tests.test_pep8.test_check_pep8
   ----------------------------------------------------------------------
   Traceback (most recent call last):
     File "/home/travis/virtualenv/python2.7/local/lib/python2.7/site-packages/nose/case.py", line 197, in runTest
       self.test(*self.arg)
     File "/home/travis/builds/mkouhei/tonicdnscli/src/tonicdnscli/tests/test_pep8.py", line 25, in test_check_pep8
       runner = pep8.input_file
       AttributeError: 'module' object has no attribute 'input_file'

   ----------------------------------------------------------------------
   Ran 17 tests in 0.070s

   FAILED (errors=1)

   Done. Build script exited with: 1

Cause is version of pep8 module. Travis-ci's is 1.3.3, but Debian GNU/Linux Sid as my environment is 1.2. So I have appended version of pep8 to requirements.txt.

.. code-block:: ini

   pep8==1.2
   minimock

.. author:: default
.. categories:: Python
.. tags:: pep8,Debian
.. comments::
