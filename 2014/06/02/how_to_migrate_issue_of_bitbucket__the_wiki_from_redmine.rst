How to migrate issue of Bitbucket, the wiki from Redmine
========================================================

Redmineで管理していたチケットとWiki、文書をBitbucketのissuesとWikiに移行したのでそのメモです。
移行先のBitbucketのプロジェクトで、issuesとWikiが有効にしてあることが前提です。


チケット
--------


Wikiと文書
----------

BitbucketのWikiは、プロジェクトの下にwikiリポジトリとして存在します。これはwikiのHomeでgit cloneする手順が書いてあります。


1. RedmineのWikiはtxt(textile形式)でエクスポートできるのでそのまま保存します。
2. Redmineの文書はエクスポート機能がないので、編集モードにすると、textile形式で編集モードになるので、それを手元のテキストファイルとしてコピペ保存します。
3. BitbucketのWikiのリポジトリをgit cloneします。::

     $ git clone git@bitbucket.org:mkouhei/anyproject.git/wiki

4. ローカルに落としたファイルの拡張子をtxtからtextileに変更します。::

     $ for i in *.txt
     do
     mv $i $(basename $i .txt).textile
     done

5. 名前を変更したのファイルを必要があればtextileとして修正します。
6. pandocを使ってmarkdownに変換します。先ほどtextileに拡張子を変更した意味がここにあるわけです。::

     $ for i in *.textile
     do
     pandoc -s $i -o $(basename $i .textile).md
     done

7. add & commit & pushします。
8. Wiki上で表示がおかしいところは、BitbucketのWikiのエディタで修正します。
9. Home.wikiをRedmineのWikiのindexと差し替えます。 [#]_


.. rubric:: footnote

.. [#] Home.wikiはHelp.wikiに変更するとよいでしょう。

.. author:: default
.. categories:: 
.. tags:: Redmine,Bitbucket,pandoc
.. comments::
