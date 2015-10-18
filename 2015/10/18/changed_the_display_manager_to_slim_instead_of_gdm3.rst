Changed the display manager to slim instead of gdm3
===================================================

一週間ほど前(2015/10/12)から、stretch/sidでパッケージのアップデートを行うと、次回のOS起動時にDisplay managerが起動せず、ttyのログインプロンプトが延々と明滅してまともにログインすらできない問題に遭遇しました。

私物のMacBook ProのVirtualBox上で動かしているSidは、VirtualBox用のカーネルモジュールを再作成してやることで回避できました。

.. code-block:: shell

   $ sudo dpkg-reconfigure virtualbox-guest-dkms

しかし、仕事で使っているMacBook ProのVirtualBox上のSid [#]_ ではこれでは解決せず、recovery modeで/var/log/Xorg.0.logを確認してみたところ、

.. code-block:: none

   (EE) dbus-core: error connecting to system bus: org.freedesktop.Dbus.Error.FileNotFound (Failed to connect to socket /var/run/dbus/system_bus_socket: No such file or directory

というログが出ていたのでパッケージを確認してみたら、 ``libdbus-c++-10v5`` パッケージが無く、これをインストールすると、 ``startx`` コマンドでX Window systemが起動するようにはなりました。 [#]_

ところが、これでもgdm3は起動しません。そこで、現在Debianでサポートされている `Display manager <https://wiki.debian.org/DisplayManager>`_ を確認して、slimに変更してみました。これは正常に起動できました。

デフォルトのセッションがawesomeではなかったので、 ``/etc/slim.conf`` の ``login_cmd`` を

.. code-block:: diff

   diff --git a/slim.conf b/slim.conf
   index c82f73b..413e111 100644
   --- a/slim.conf
   +++ b/slim.conf
   @@ -33,8 +33,9 @@ authfile           /var/run/slim.auth
   # NOTE: if your system does not have bash you need
   # to adjust the command according to your preferred shell,
   # i.e. for freebsd use:
   -# login_cmd           exec /bin/sh - ~/.xinitrc %session
   -login_cmd           exec /bin/bash -login /etc/X11/Xsession %session
   +#login_cmd           exec /bin/sh - ~/.xinitrc %session
   +#login_cmd           exec /bin/bash -login /etc/X11/Xsession %session
   +login_cmd           exec /bin/bash -login /etc/X11/Xsession awesome
   
   # Commands executed when starting and exiting a session.
   # They can be used for registering a X11 session with

と直接指定しています。 [#]_ 

普段、Gnomeではなくawesomeしか使っていないので、別に gdm3を使う理由も無いので、とりあえずこれで良しとします。問題のなかった私物の環境の方もslimに変更しようかな。

.. rubric:: footnotes

.. [#] このSidのイメージはもともと自宅で使っているSidのイメージを使っているのですが、まぁ年月経つと大分環境にも差異が出ますよね。
.. [#] ちなみに xinit パッケージもインストールされていませんでした。Display manager使っていたら普段必要ないのですけど。
.. [#] ちなみに ``~/.xinitrc`` に ``session=awesome`` を設定し、 ``exec /bin/sh - ~/.xinitrc %session`` を有効にする方法だと、gdmの時と同様の問題が発生してしまいました。
              

.. author:: default
.. categories:: Debian
.. tags:: Sid,Display manager,gdm,slim
.. comments::
