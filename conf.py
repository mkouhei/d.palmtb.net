# -*- coding: utf-8 -*-

import tinkerer
import tinkerer.paths        

# **************************************************************
# TODO: Edit the lines below
# **************************************************************

# Change this to the name of your blog
project = u'ペンギンと愉快な機械の日々'

# Change this to the tagline of your blog
tagline = u'I use technology to make life more convenient.'

# Change this to your name
author = u'mkouhei'

# Change this to your copyright string
copyright = u'2006-2014, Kouhei Maeda aka ' + author

# Change this to your blog root URL (required for RSS feed)
website = u'http://d.palmtb.net/'                              

# **************************************************************
# More tweaks you can do
# **************************************************************

# Add your Disqus shortname to enable comments powered by Disqus
disqus_shortname = 'mkouhei'

# Change your favicon (new favicon goes in _static directory)
html_favicon = 'tinkerer.ico'           

# Pick another Tinkerer theme or use your own
html_theme = "flat"

# Theme-specific options, see docs
html_theme_options = { }                                  

# Link to RSS service like FeedBurner if any, otherwise feed is
# linked directly
rss_service = None

# **************************************************************
# Edit lines below to further customize Sphinx build
# **************************************************************

# Add other Sphinx extensions here
extensions = ['tinkerer.ext.blog',
              'tinkerer.ext.disqus',
              'sphinxcontrib.blockdiag',
              'sphinxcontrib.googleanalytics',
              'sphinxcontrib.nwdiag',
              'sphinx.ext.graphviz',
              'sphinxcontrib.gist']

# Google Analytics
googleanalytics_id = 'UA-1309764-3'

# Add other template paths here
templates_path = ['_templates']

# Add other static paths here
html_static_path = ['_static', tinkerer.paths.static]

# Add other theme paths here
html_theme_path = [tinkerer.paths.themes]                 

# Add file patterns to exclude from build
exclude_patterns = ["drafts/*"]                                     

# Add templates to be rendered in sidebar here
html_sidebars = {
    "**": ["recent.html", "searchbox.html", "categories.html", "tags.html"]
}

blockdiag_fontpath = '/usr/share/fonts/truetype/vlgothic/VL-PGothic-Regular.ttf'
blockdiag_antialias = True
#blockdiag_html_image_format = 'SVG'
#seqdiag_html_image_format = 'SVG'
#nwdiag_html_image_format = 'SVG'

# **************************************************************
# Do not modify below lines as the values are required by 
# Tinkerer to play nice with Sphinx
# **************************************************************

source_suffix = tinkerer.source_suffix
master_doc = tinkerer.master_doc
version = tinkerer.__version__
release = tinkerer.__version__
html_title = project
html_use_index = False
html_show_sourcelink = True
html_add_permalinks = True

def setup(app):
    app.add_javascript('custom.js')
