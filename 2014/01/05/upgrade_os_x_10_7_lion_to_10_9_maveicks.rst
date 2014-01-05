Upgrade OS X 10.7 Lion to 10.9 Maveicks
=======================================

The model of my MacBook Pro is 15-inch, Early 2011.
I am usually using Debian GNU/Linux Sid on VirtualBox for OS X with full screen.
The virtualBox-guest-{dkms,utils,x11} packages were upgraded 4.2.16 to 4.3.2 at last December. So I tried to OS X as host OS of VirtualBox.

#. Upgraded VirtualBox for OS X 4.2.16 to 4.3.2.
#. Upgraded virtualbox-guest-* packages of Sid, and rebuild virtualbox-guest-dkms.
#. Exported virtual appliance of Sid to NAS [#]_.
#. Upgraded OS X Lion to Maverikcs.

I was worried about the following link, but there has not yet been occured troubles my MacBook Pro now.

http://veadardiary.blog29.fc2.com/blog-entry-4884.html

.. rubric:: Footnotes

.. [#] Firstly, I tried to backup with the Time Machine, but I gave up because this method was very very slow.

.. author:: default
.. categories:: MacBook
.. tags:: OS X, VirtualBox, Debian
.. comments::
