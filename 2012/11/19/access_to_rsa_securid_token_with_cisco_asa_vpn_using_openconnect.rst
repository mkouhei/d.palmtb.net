Access to RSA SecurID token with Cisco ASA VPN using OpenConnect
================================================================

What client do you use for access to Cisco ASA SSL VPN in your Debian system? It is usually to use Cisco AnyConnect, but we can use Debian package of  OpenConnect. `OpenConnect is a client for Cisco's AnyConnect SSL VPN <http://www.infradead.org/openconnect/>`_.

Install "openconnect" package.

.. code-block:: bash

   $ sudo apt-get install openconnect

When use Cisco ASA without RSA SercurID token, follow next commands. It is using option “–no-cert-check”  In this case, because we have not yet prepared signed by trusted Certificate Authority.

.. code-block:: bash

   $ sudo openconnect --no-cert-check --user=user --passwd-on-stdin https://vpn.example.org/test_group

   [sudo] password for user:
   
   Attempting to connect to vpn.example.org:443
   SSL negotiation with vpn.example.org
   Server certificate verify failed: self signed certificate
   Connected to HTTPS on vpn.example.org
   GET https://vpn.example.org/test_group
   Got HTTP response: HTTP/1.0 302 Temporary moved
   SSL negotiation with vpn.example.org
   Server certificate verify failed: self signed certificate
   Connected to HTTPS on vpn.example.org
   GET https://vpn.example.org/+webvpn+/index.html
   POST https://vpn.example.org/+webvpn+/index.html
   Please enter your username and password.
   Password:
   POST https://vpn.example.org/+webvpn+/index.html
   Got CONNECT response: HTTP/1.1 200 OK
   CSTP connected. DPD 30, Keepalive 20
   Connected tun0 as 192.0.2.10 + 2001:0db8::10, using SSL
   DTLS handshake failed: 2
   DTLS handshake failed: 2
   (snip)


When using Cisco ASA with two factor authentication as RSA SecurID token and LDAP authentication, openconnect command is following.

.. code-block:: bash

   $ sudo openconnect --no-cert-check https://vpn.example.org/test_rsa
   Attempting to connect to vpn.example.org:443
   SSL negotiation with vpn.example.org
   Server certificate verify failed: self signed certificate
   Connected to HTTPS on vpn.example.org
   GET https://vpn.example.org/test_rsa
   Got HTTP response: HTTP/1.0 302 Temporary moved
   SSL negotiation with vpn.example.org
   Server certificate verify failed: self signed certificate
   Connected to HTTPS on vpn.example.org
   GET https://vpn.example.org/+webvpn+/index.html


Firstly, RSA SecurID token without PIN code. The former pair of username and passcode is SecureID token, the latter pair is LDAP authentication.

.. image:: /img/rsa1.png
   :alt: Enter blank to PIN.

.. image:: /img/rsa2.png
   :alt: Display pass code without PIN.

.. code-block:: bash

   Please enter your username and password.
   Username:user
   PASSCODE:
   Username:user
   PASSCODE:
   POST https://vpn.example.org/+webvpn+/index.html

Set new PIN code. Don't forgot it.

.. code-block:: bash

   You must enter a new numeric PIN from 4to 8digits to continue.
   New PIN:
   Verify PIN:
   POST https://vpn.example.org/+webvpn+/login/userpin.html

Enter PIN code in RSA token. Enter pass code as follows, so you can connected.

.. image:: /img/rsa3.png
   :alt: Enter PIN code.

.. image:: /img/rsa4.png
   :alt: Display pass code with PIN.


.. code-block:: bash

   Enter new PIN with the next card code to complete authentication.
   PASSCODE:
   POST https://vpn.example.org/+webvpn+/login/challenge.html
   Got CONNECT response: HTTP/1.1 200 OK
   CSTP connected. DPD 30, Keepalive 20
   Connected tun1 as 192.0.2.10 + 2001:0db8::10, using SSL
   DTLS handshake failed: 2
   DTLS handshake failed: 2
   (snip)


If you failed authentication after you have change PIN code
-----------------------------------------------------------

If you fail next prompt, then you will not be able to authenticate.

.. code-block:: bash

   Enter new PIN with the next card code to complete authentication.
   PASSCODE:

Please request to administrator to reset your PIN code.


.. author:: default
.. categories:: network
.. tags:: OpenConnect,RSA SecurID,Cisco ASA
.. comments::
