Disqus comment fail to appear
=============================

Tinkerer is enable to use disqus as comment plugin, but Chromiums blocks the reading third-party cookie. Disqus appear dialog that says you should allow third-party cookies, but at least I want to allow only necessary domain's. So I have set up cookie of disqus "[\*.]disqus.com" to exception of cookie and site data. You may set up with next list when you specify domains explicitly.

* disqus.com
* mediacdn.disqus.com
* `your-disqus-shortname`.disqus.com (example mkouhei.disqus.com)
* qq.disqus.com
* securecdn.disqus.com
* juggler.services.disqus.com

See also
--------

* `サードパーティCookieの歴史と現状 Part1 前提知識の共有 <http://d.hatena.ne.jp/mala/20111125/1322210819>`_
* `Issue 98241:	Changing third-party cookie blocking behavior to prevent reading as well as setting. <http://code.google.com/p/chromium/issues/detail?id=98241>`_


.. author:: default
.. categories:: Ops
.. tags:: tinkerer
.. comments::
