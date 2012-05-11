GitLabを導入してみた話。
======================================

ちょいと昨日、GitLabをUbuntu12.04に導入してみました。基本的には、 `Install for stable version (recommended) <https://github.com/gitlabhq/gitlabhq/blob/stable/doc/installation.md>`_ の通りです。GitLabの現時点のstableはRuby 1.9.2を必要としますが、Ubuntu 12.04では、1.9.1どまりなので、Rubyについては、上記の手順どおりソースコードからビルドし、Ruby関連パッケージは全てGem経由でインストールしました。

一部、手順の `4. Install gitlab and configuration. Check status configuration. <https://github.com/gitlabhq/gitlabhq/blob/stable/doc/installation.md#4-install-gitlab-and-configuration-check-status-configuration>`_ において、Gemに紛れて、

.. code-block:: bash

   sudo pip install pygments

と、pygmentsをpipでインストールする手順があります。が、これはDebianパッケージがあり、バージョンの指定もないので、python-pygmentsパッケージをインストールしました。

この手順どおりに行うと、インストール後に表示されるGitリポジトリのURIのホストがlocalhostになってしまいます。インストール後に、/home/gitlab/gitlab/config/gitlab.ymlのサーバ絡みの変更すると、gitlite関連の手順がGitlab経由で行えません。gitlite絡みというのは、つまりユーザ作成後のSSHキーの登録であったり、ベアリポジトリの作成です。原因は、gitlab.yamlのホスト関連の情報をlocalhostからホスト名やIPアドレスに変更すると、インストール手順の中で行っていたgit clone先のホスト名と変わってしまうためと思われます。ですので、上記手順の `CHECK: Logout & login again to apply git group to your user <https://github.com/gitlabhq/gitlabhq/blob/stable/doc/installation.md#check-logout--login-again-to-apply-git-group-to-your-user>`_ のうち、

.. code-block:: bash

   sudo -u gitlab -H git clone git@localhost:gitolite-admin.git /tmp/gitolite-admin 

は、localhostではなく、サーバのホスト名もしくはIPアドレスを指定し、前述の4の手順で

.. code-block:: bash

   sudo -u gitlab cp config/gitlab.yml.example config/gitlab.yml

を行った直後に、gitlab.yamlのlocalhostの部分を変更しておく必要があると思います。「思います」と書いているのは、未確認だからです。私が実際にやったのは後からgitlab.yamlを修正した場合の手順。つまり、

* ホストキーの再生成

.. code-block:: bash

   $ sudo -H -u gitlab ssh-keygen -q -N '' -t rsa -f /home/gitlab/.ssh/id_rsa

* setupの再実行

.. code-block:: bash

   $ sudo -u git sh -c 'echo -e "PATH=\$PATH:/home/git/bin\nexport PATH" > /home/git/.profile'
   $ sudo -u git -i -H /home/git/gitolite/src/gl-system-install
   $ sudo cp /home/gitlab/.ssh/id_rsa.pub /home/git/gitlab.pub
   $ sudo chmod 777 /home/git/gitlab.pub
   $ sudo -u git -H sed -i 's/0077/0007/g' /home/git/share/gitolite/conf/example.gitolite.rc
   $ sudo -u git -H sh -c "PATH=/home/git/bin:$PATH; gl-setup -q /home/git/gitlab.pub"

* 手順4の再実行

.. code-block:: bash

   $ sudo -u gitlab -H git clone git@repos.example.org:gitolite-admin.git /tmp/gitolite-admin 
   $ sudo rm -rf /tmp/gitolite-admin 

を行って解決しました。ただし、「setupの再実行」のうち、gl-system-installスクリプトの実行は、下記の用にwarningが出るのでいらないかも。(これもまた未確認）

.. code-block:: bash

   $ sudo -u git -i -H /home/git/gitolite/src/gl-system-install
   -sh: 1: -e: not found
   using default values for EUID=109:
   /home/git/bin /home/git/share/gitolite/conf /home/git/share/gitolite/hooks
   
                   ***** WARNING *****
   /usr/bin precedes /home/git/bin in your $PATH,
   and it *also* contains gl-setup.  This is almost certainly going to confuse
   you or me later.
   
   Since gl-setup MUST be run from the PATH (and not as src/gl-setup or such),
   you must fix this before running gl-setup.  The simplest way is to add
   
       PATH=/home/git/bin:$PATH
   
   to the end of your bashrc or similar file.  You can even simply run that
   command manually each time you log in and want to run a gitolite command.
   
   Run /home/git/gitolite/src/gl-system-install -h for a detailed usage message.


ReadOnlyでグローバルアクセスさせたいのだけど。
------------------------------------------------------------------------

コードだけでなく、各種サーバのある設定ファイルの置き場として、ログインせずにHTTPでReadOnlyアクセスもできるようにしたかったのですが、Public repositories、これは今後も予定されてないみたいです。理由は、 `GitLabの開発を行っている企業が目指しているのはプライベートなGitHubで、githubの競合になることは避けるためだとか <https://github.com/gitlabhq/gitlabhq/issues/12#issuecomment-2416906>`_ 。 rejectされたみたいですが、 `コメント欄での反応が割と良かったこんな pull request <https://github.com/gitlabhq/gitlabhq/pull/680>`_ もあります。残念ながら導入したのがstableだったのですぐに試せず。

今回みたいな場合は `Gitrious <http://gitorious.org/projects>`_ の方があってそうですねえ。見た目はGitLabの方がgithubに近いのでいいんですけどね。残念。

.. author:: default
.. categories:: Ops
.. tags:: Git
.. comments::
