Updated Tinkerer 0.4b
=====================

I updated Tinkerer from 0.3b to 0.4b. This update has a problem. 0.4b recommended using html_theme is modern5. I changed from modern to modern5,  tried to run tinker -b. But building failed that exception occured jinja2.TemplateNotFound when modern5.

.. code-block:: bash

    $ tinker -b -q
    (snip)
    Exception occurred:
      File "/usr/lib/pymodules/python2.7/sphinx/builders/__init__.py", line 196, in build_update
	'out of date' % len(to_build))
      File "/usr/lib/pymodules/python2.7/sphinx/builders/__init__.py", line 255, in build
	self.finish()
      File "/usr/lib/pymodules/python2.7/sphinx/builders/html.py", line 438, in finish
	self.write_genindex()
      File "/usr/lib/pymodules/python2.7/sphinx/builders/html.py", line 495, in write_genindex
	self.handle_page('genindex', genindexcontext, 'genindex.html')
      File "/usr/lib/pymodules/python2.7/sphinx/builders/html.py", line 728, in handle_page
	output = self.templates.render(templatename, ctx)
      File "/usr/lib/pymodules/python2.7/sphinx/jinja2glue.py", line 128, in render
	return self.environment.get_template(template).render(context)
      File "/usr/lib/python2.7/dist-packages/jinja2/environment.py", line 719, in get_template
	return self._load_template(name, self.make_globals(globals))
      File "/usr/lib/python2.7/dist-packages/jinja2/environment.py", line 693, in _load_template
	template = self.loader.load(self, name, globals)
      File "/usr/lib/python2.7/dist-packages/jinja2/loaders.py", line 115, in load
	source, filename, uptodate = self.get_source(environment, name)
      File "/usr/lib/pymodules/python2.7/sphinx/jinja2glue.py", line 149, in get_source
	raise TemplateNotFound(template)
    TemplateNotFound: genindex.html
    The full traceback has been saved in /tmp/sphinx-err-hQwPgt.log, if you want to report the issue to the developers.
    Please also report this if it was a user error, so that a better error message can be provided next time.
    Either send bugs to the mailing list at <http://groups.google.com/group/sphinx-dev/>,
    or report them in the tracker at <http://bitbucket.org/birkenfeld/sphinx/issues/>. Thanks!

This work around of problem is changed disable html_use_index. 

.. code-block:: diff

    diff --git a/conf.py b/conf.py
    index c5ef69e..0950c51 100644
    --- a/conf.py
    +++ b/conf.py
    @@ -81,6 +81,6 @@ master_doc = tinkerer.master_doc
     version = tinkerer.__version__
     release = tinkerer.__version__
     html_title = project
    -html_use_index = True
    +html_use_index = False
     html_show_sourcelink = True
     html_add_permalinks = True

.. author:: default
.. categories:: Ops
.. tags:: tinkerer,Sphinx
.. comments::
