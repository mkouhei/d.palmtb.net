Updates for TeX Live 2016
=========================

年々準備が遅くなっている年賀状ですが、ようやく来年の年賀状を書くか、と重い腰を上げ、
出す枚数を確定し年賀状を購入してきました。

ページサイズがおかしい問題に遭遇
--------------------------------

毎年、年賀状印刷で最初にやることは、 `宛名印刷用のPDFの生成ツール <https://github.com/mkouhei/Genenga>`_ の動作確認です。更新したCSVから、TeXファイル経由でPDFを生成しているのですが、指定したページサイズが効かずにA4サイズになってしまう、という問題に遭遇しました。

年賀状なので、下記のように100mm × 148mmにしているのですが、これが正常に機能しません。

.. code-block:: tex

    \documentclass[12pt]{jarticle}
    \usepackage[dvipdfmx]{graphicx}
    \usepackage{verbatim}
    \usepackage{plext}
    \pagestyle{empty}
    \setlength{\textwidth}{100truemm}
    \setlength{\hoffset}{0in}
    \setlength{\voffset}{0truemm}
    \setlength{\headheight}{0truemm}
    \setlength{\headsep}{0truemm}
    \setlength{\oddsidemargin}{0truemm}
    \setlength{\textheight}{148truemm}
    \setlength{\topmargin}{0truemm}
    \advance\oddsidemargin -1in
    \advance\topmargin -1in
    \setlength{\footskip}{0truemm}
    \begin{document}
    \setlength{\unitlength}{1truemm}
    
    {{#address}}
    
    \begin{picture}(100,148)(0,0)


dvipdfmx.defの変更が原因だった模様
----------------------------------

「 `TeX Live 2016にしたらページサイズがおかしくなります <https://oku.edu.mie-u.ac.jp/~okumura/jsclasses/>`_ 」から、 `こちらのスレッド <http://oku.edu.mie-u.ac.jp/tex/mod/forum/discuss.php?d=1971>`_ を確認し、下記のように `[dvipdfmx]` オプションを `[nosetpagesize]` オプションに変更することで解消できました。

.. code-block:: diff

    diff --git a/template/address.mustache b/template/address.mustache
    index 513ee90..948eb3c 100644
    --- a/template/address.mustache
    +++ b/template/address.mustache
    @@ -1,5 +1,5 @@
     <U+FEFF>\documentclass[12pt]{jarticle}
    -\usepackage[dvipdfmx]{graphicx}
    +\usepackage[nosetpagesize]{graphicx}
     \usepackage{verbatim}
     \usepackage{plext}
     \pagestyle{empty}

ということで
------------

年賀状作成するぞ。


.. author:: default
.. categories:: TeX
.. tags:: Genenga,dvipdfmx
.. comments::
