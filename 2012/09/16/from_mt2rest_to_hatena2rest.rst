Changed mt2rest to hatena2rest
==============================

I released mt2rest at 30 March that is tool to convert(:doc:`/2012/03/31/235959`). It is to convert Hatena Diary exported into reST format. I had migrated from Hatena Diary to Tinkerer. But it was incomplete conversion with this tool, because I made improvised for that time event.

I rewrote this tool with using Hatena diary XML format instead of MovableType format as input. The two reason is as follows. Firstly it is too hard to distinguish the notation of Hatena Diary written in the code block to separate the entries of daily correctly. Secondary it is also hard to parse distinguish the code of blog-parts when I use the MovableType format as input file. I renamed a project name "`hatena2rest <https://github.com/mkouhei/hatena2rest>`_. It is now not use MovableType format why "mt" of mt2rest is Abbreviation of "MovableType".

Use this tool if you will migrate tinkerer from Hatena Diary. Usage is written in `README <https://github.com/mkouhei/hatena2rest/blob/master/docs/README.rst#usage>`_.

I make a note that I had a hard time.

Detection of half-width characters and full-with characters
-----------------------------------------------------------

String must has border line as "=" * character length at section, subsection and simple table of Sphinx. Single-byte character is simple, so character length of border equals character length of string. String encoded with unicode is also the same.

.. code-block:: python

   >>> len(r"single")
   6
   >>> len(u"single")
   6

But double-byte character is complicated. Character length of string is different with encoded with unicode and raw.

.. code-block:: python

   >>> len(r"全角")
   6
   >>> len(u"全角")
   2

"Hankaku kana" is below

.. code-block:: python

   >>> len(r"ﾃｽﾄ")
   9
   >>> len(u"ﾃｽﾄ")
   3

"Zenkaku" must be two or more characters, "Hankaku" must be at least one character when Sphinx border character. It is hard to detect with len(). So I used unixcodedata.east_asian_width().

unicodedata module is embedded with Python. east_asian_width() has next 6 values.

* F: Fullwidth
* H: Halfwidth
* W: Wide
* Na: Narrow
* A: Ambiguous
* N: Neutral

.. figure:: http://upload.wikimedia.org/wikipedia/commons/3/30/East_Asian_Width_1.svg
   :alt: Describe East_Asian_Width properties defined by Unicode Standard Annex #11 (UAX#11).

   fig. `Describe East_Asian_Width properties defined by Unicode Standard Annex #11 (UAX#11). <http://ja.wikipedia.org/wiki/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB:East_Asian_Width_1.svg>`_


According to "`WikiPedia <http://ja.wikipedia.org/wiki/%E6%9D%B1%E3%82%A2%E3%82%B8%E3%82%A2%E3%81%AE%E6%96%87%E5%AD%97%E5%B9%85#.E5.95.8F.E9.A1.8C.E7.82.B9>`_", "A" is processed as 1 or 2 characters,  but Sphinx processes as like below probably.

* F: 2 character width
* H: 1 character width
* W: 2 character width
* Na: 1 character width
* A: 1 character witdh
* N: 1 character width

Then next code is enable to get width of string.

.. code-block:: python

    def length_str(string)
	fwa = ['F', 'W', 'A']
	hnna = ['H', 'N', 'Na']

	if isinstance(string, unicode):
	    zenkaku = len([unicodedata.east_asian_width(c)
			   for c in string
			   if unicodedata.east_asian_width(c) in fwa])
	    hankaku = len([unicodedata.east_asian_width(c)
			   for c in string
			   if unicodedata.east_asian_width(c) in hnna])
	    return (zenkaku * 2 + hankaku)
	elif isinstance(string, str):
	    return len(string)

https://github.com/mkouhei/hatena2rest/blob/master/src/hatena2rest/utils.py#L61

Exception occurs when use "&" in raw directive of html
------------------------------------------------------

"&" is disable to use in raw directive of html. Blog parts is converted to html raw directive. Then exception occurs when running build(tinker -b command)..

.. code-block:: python

    # Sphinx version: 1.1.3
    # Python version: 2.7.3
    # Docutils version: 0.8.1 release
    # Jinja2 version: 2.6
    Traceback (most recent call last):
      File "/usr/lib/pymodules/python2.7/sphinx/cmdline.py", line 189, in main
	app.build(force_all, filenames)
      File "/usr/lib/pymodules/python2.7/sphinx/application.py", line 204, in build
	self.builder.build_update()
      File "/usr/lib/pymodules/python2.7/sphinx/builders/__init__.py", line 196, in build_update
	'out of date' % len(to_build))
      File "/usr/lib/pymodules/python2.7/sphinx/builders/__init__.py", line 255, in build
	self.finish()
      File "/usr/lib/pymodules/python2.7/sphinx/builders/html.py", line 433, in finish
	for pagename, context, template in pagelist:
      File "/usr/lib/python2.7/dist-packages/tinkerer/ext/blog.py", line 85, in html_collect_pages
	for name, context, template in rss.generate_feed(app):
      File "/usr/lib/python2.7/dist-packages/tinkerer/ext/rss.py", line 54, in generate_feed
	app.config.website + post[:11])),
      File "/usr/lib/python2.7/dist-packages/tinkerer/ext/patch.py", line 91, in patch_links
	doc = xml.dom.minidom.parseString(in_str)
      File "/usr/lib/python2.7/xml/dom/minidom.py", line 1930, in parseString
	return expatbuilder.parseString(string)
      File "/usr/lib/python2.7/xml/dom/expatbuilder.py", line 940, in parseString
	return builder.parseString(string)
      File "/usr/lib/python2.7/xml/dom/expatbuilder.py", line 223, in parseString
	parser.Parse(string, True)
    ExpatError: not well-formed (invalid token): line 70, column 363

This problem is solved with escaping to character entity references, but there is no meaning as hyperlink.  So I extracted URI as simple hyperlink.

Other
-----

I spent a lot of regular expression.

See also
--------

* `東アジアの文字幅 <http://ja.wikipedia.org/wiki/%E6%9D%B1%E3%82%A2%E3%82%B8%E3%82%A2%E3%81%AE%E6%96%87%E5%AD%97%E5%B9%85>`_


.. author:: default
.. categories:: Dev
.. tags:: tinkerer, Python, Sphinx
.. comments::
