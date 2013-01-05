Rewrite history with git-filter-branch
======================================

I rewrote the history of Git repository that I developped a software when I would upload the software to GitHub. The history of repository has my some different COMMITER & AUTHOR NAME and EMAIL, and configurations for testing environments. So I wanted to change NAME and EMAIL to one is used for publish, and wanted to change to  sample configurations.

My repository has two branches as master, devel, and has some tags. I took mainly three step .

#. Change the NAME and MAIL
#. Rewrite commit messeages and contents
#. re-tags

.. code-block:: bash

   $ git remote
   origin
   $ git remote rm origin

Change the NAME and MAIL
------------------------

Filtering with "git filter-branch --commit-filter" and execute 'git commit-tree "$@"',
a new commit tree is generated. Original tree is taken a backup to "original/refs/heads".

.. code-block:: bash

   $ git filter-branch --commit-filter  '
   GIT_AUTHOR_NAME="Kouhei Maeda";
   GIT_AUTHOR_EMAIL=mkouhei@palmtb.net;
   GIT_COMMITTER_NAME="Kouhei Maeda";
   GIT_COMMITTER_EMAIL=mkouhei@palmtb.net;
   git commit-tree "$@"
   ' -- --all
   Rewrite 97d9b7d1899f7e6b08d91f5e606c8521f907b01c (43/43)
   Ref 'refs/heads/devel' was rewritten
   Ref 'refs/heads/master' was rewritten
   Ref 'refs/tags/v0.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.2' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.

It is easy to understand with "gitk --all".


Rewrite commit messages and contents
------------------------------------

Rewrite commit messages
~~~~~~~~~~~~~~~~~~~~~~~

Use "--msg-filter" option to rewrite Sigined-off-by of commit message.

.. code-block:: bash

   $ git filter-branch -f --msg-filter '
   sed -e "s/\(Signed-off-by: \).*/\1Kouhei Maeda <mkouhei@palmtb.net>/g"
   ' -- --all
   Rewrite 13cfa3ac719e507168822783822fa2480018a5ec (82/82)
   Ref 'refs/heads/devel' was rewritten
   Ref 'refs/heads/master' was rewritten
   Ref 'refs/tags/v0.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.2' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.


Rewrite contents with "--tree-filter"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you specify target files with postfix as '**find ./ -name "*.py"**', you must specify files that are always present. Because you will fail if you specify a file that does not exist on any commit. You must specify multiple postfixt with "-o" options as following.

.. code-block:: bash

   $ git filter-branch -f --tree-filter '
   find ./ -name "*.py" -o -name "*.rst" -o -name "*.html" -o -name "*.1"| xargs sed -i "
   s/mkouhei@workstation.example.com/mkouhei@palmtb.net/g
   s/Kohei Maeda/Kouhei Maeda/g
   s/http:\/\/scm.example.com/https:\/\/github.com\/mkouhei/g
   s/Kohei Maeda <mkouhei@workstation>/Kouhei Maeda <mkouhei@palmtb.net>/g
   s/mkouhei/testuser/g
   s/test.example.com/ldap.example.org/g
   s/dc=example,dc=com/dc=example,dc=org/g
   "' -- --all
   Rewrite 05db18486e3285bb6178d8da0c8952e63542ec80 (82/82)
   Ref 'refs/heads/devel' was rewritten
   Ref 'refs/heads/master' was rewritten
   Ref 'refs/tags/v0.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.1' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.
   Ref 'refs/tags/v0.1.2' was rewritten
   WARNING: You said to rewrite tagged commits, but not the corresponding tag.
   WARNING: Perhaps use '--tag-name-filter cat' to rewrite the tag.


re-tags
-------

I used a signed tag, so replace the same name tag with "-f" option. Firstly I confirmed date of original tag.

.. code-block:: bash

   $ git show v0.1
   tag v0.1
   Tagger: Kouhei Maeda <mkouhei@palmtb.net>
   Date:   Wed Dec 19 01:42:35 2012 +0900
   
   release 0.1
   (snip)

   commit 795897ff28cea6512c457de02a1d6043236c685b
   Merge: c4bc5bf a90fa12
   Author: Kouhei Maeda <mkouhei@palmtb.net>
   Date:   Wed Dec 19 01:39:02 2012 +0900

   Merge branch 'devel'

Confirm commit hash of the same commit in a new tree.

.. code-block:: bash

   $ git log --oneline :/Merge branch 'devel'
   (snip)
   1f1a023 Merge branch 'devel'
   7e2682a closed #19 packaging Debian package
   89a35fe Fix fail to execute console script

Replace tag.

.. code-block:: bash

   $ GIT_COMMITER_DATE="2012-12-19 01:42:35+0900" git tag -f -s -m "release 0.1" -u 7E37CE41 v0.1 1f1a023

   次のユーザーの秘密鍵のロックを解除するには
   パスフレーズがいります:“Kouhei Maeda <mkouhei@palmtb.net>”
   4096ビットRSA鍵, ID 7E37CE41作成日付は2009-06-19

   Updated tag 'v0.1' (was 83cb501)


Repeat as many as numbers of tags. You should confirm commit messages and contents before you will push new remote repository.

See also
--------

* `6.4 Git のさまざまなツール - 歴史の書き換え <http://git-scm.com/book/ja/Git-%E3%81%AE%E3%81%95%E3%81%BE%E3%81%96%E3%81%BE%E3%81%AA%E3%83%84%E3%83%BC%E3%83%AB-%E6%AD%B4%E5%8F%B2%E3%81%AE%E6%9B%B8%E3%81%8D%E6%8F%9B%E3%81%88>`_

.. author:: default
.. categories:: Dev
.. tags:: Git
.. comments::
