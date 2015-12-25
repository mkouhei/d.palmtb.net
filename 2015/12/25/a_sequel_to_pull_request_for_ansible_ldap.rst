A sequel to pull request for ansible-ldap
=========================================

昨日の記事(:doc:`/2015/12/24/ansible_ldap_is_very_simple_and_useful`)で、`ansible-ldap <https://bitbucket.org/psagers/ansible-ldap>`_ のAnsible Galaxy 対応のPRを送ったところ、早速返事がありました。

    If you'd like to publish these on Ansible Galaxy, feel free. You don't need anything from me.

`Ansible Galaxyでの公開はしないそうですが、公開そのものはご自由にどうぞ <https://bitbucket.org/psagers/ansible-ldap/pull-requests/1/for-ansible-galaxy/diff#comment-13028330>`_ 、ということでした。

ということで、 `fork版として公開 <https://galaxy.ansible.com/detail#/role/6652>`_ しました。

今後の方針
----------

現状、テストコードがなく、Ansible 2.0も未対応なのでその対応を行う予定です。 [#]_
upstream側での変更が今後されるのかわかりませんが、可能であれば追従していくつもりです。

Mercurial から Gitへの変換
--------------------------

オリジナルはMercurialのリポジトリとしてBitbucketで公開されています。一方、Ansible Galaxyで公開するにはGitHubで公開する必要があります。
そこで、次の手順でMercurialからGitに変換しました。

1. hg-fast-exportをインストール

.. code-block:: sh

   $ sudo apt-get intall hg-fast-export

2. インポート先のGitリポジトリを作成  

.. code-block:: sh

   $ mkdir ansible-role-ldap
   $ cd ansible-role-ldap
   $ git init             

3. MercurialからGitに変換
      
   * 変換元のMercurialのリポジトリは、却下されたPull requestを作成するためにfeature branchを作ったローカルリポジトリを使いました。

.. code-block:: sh

   $ hg-fast-export -r /path/to/ansible-ldap
   master: Exporting full revision 1/6 with 4/0/0 added/changed/removed files
   master: Exporting simple delta revision 2/6 with 0/2/0 added/changed/removed files
   master: Exporting simple delta revision 3/6 with 0/2/0 added/changed/removed files
   for-ansible-galaxy: Exporting simple delta revision 4/6 with 1/0/0 added/changed/removed files
   for-ansible-galaxy: Exporting simple delta revision 5/6 with 2/0/2 added/changed/removed files
   for-ansible-galaxy: Exporting simple delta revision 6/6 with 0/2/0 added/changed/removed files
   Issued 6 commands
   git-fast-import statistics:
   ---------------------------------------------------------------------
   Alloc'd objects:       5000
   Total objects:           28 (         3 duplicates                  )
         blobs  :           11 (         2 duplicates          6 deltas of         11 attempts)
         trees  :           11 (         1 duplicates          5 deltas of         11 attempts)
         commits:            6 (         0 duplicates          0 deltas of          0 attempts)
         tags   :            0 (         0 duplicates          0 deltas of          0 attempts)
   Total branches:           2 (         2 loads     )
         marks:           1024 (         6 unique    )
         atoms:              8
   Memory total:          2344 KiB
          pools:          2110 KiB
        objects:           234 KiB
   ---------------------------------------------------------------------
   pack_report: getpagesize()            =       4096
   pack_report: core.packedGitWindowSize = 1073741824
   pack_report: core.packedGitLimit      = 8589934592
   pack_report: pack_used_ctr            =          7
   pack_report: pack_mmap_calls          =          3
   pack_report: pack_open_windows        =          1 /          1
   pack_report: pack_mapped              =      19729 /      19729
   ---------------------------------------------------------------------
   
   $ git branch 
     for-ansible-galaxy
   * master
   
4. GitHubにリモートリポジトリを作成
5. git push

.. code-block:: bash

   $ git remote add origin git@github.com:mkouhei/ansible-role-ldap.git
   $ git push --mirror

6. for-ansible-galaxy ブランチを master にマージ
7. Ansible Galaxyでインポート、公開

.. rubric:: footnotes

.. [#] 先日公開した `include_csv <https://galaxy.ansible.com/detail#/role/6589>`_ もですが。
   
.. author:: default
.. categories:: LDAP
.. tags:: Ansible,OpenLDAP,Debian,Mercurial,Git
.. comments::
