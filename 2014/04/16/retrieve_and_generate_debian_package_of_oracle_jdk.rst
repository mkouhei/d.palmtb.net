Retrieve and generate debian package of Oracle JDK
==================================================

I have written `script for retrieving Oracle JDK tarball automatically <https://gist.github.com/mkouhei/10730869>`_,
why I wanted to retrieve and make debian package with make-jpkg command on Jenkins.

#. Retrieve JDK 7 and JDK 8 download page urls from Oracle JDK Download site.
#. Retrieve JDK tarball URL.
#. Check the save file local directory.
#. Download with "wget" command.

.. gist:: https://gist.github.com/mkouhei/10730869


Requirements
------------

* python-requests
* python-query
* wget
* java-package

Prepare as following script for Jenkins.

.. code-block:: sh

   #!/bin/sh
   
   python retrieve_jdk.py -j $1
   echo -e '\n\n' | make-jpkg $(ls -1 jdk-*-linux-x64.tar.gz | tail -1)


See also
--------

* `How to automate download and installation of Java JDK on Linux? <http://stackoverflow.com/questions/10268583/how-to-automate-download-and-installation-of-java-jdk-on-linux>`_

.. author:: default
.. categories:: Python
.. tags:: Debian,Python,make-jpkg,Jenkins
.. comments::
