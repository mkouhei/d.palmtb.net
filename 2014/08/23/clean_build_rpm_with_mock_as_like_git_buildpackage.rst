Clean build RPM with mock as like git-buildpackage
==================================================

DebianパッケージのビルドシステムはTrustyでJenkinsとpbuilder & cowbuilder & git-buildpackage を使って実装している、という話を `7月のDebian勉強会 <http://tokyodebian.alioth.debian.org/2014-07.html>`_ でお話しました。

一方、RPMについては、2年ほど前にFlaskとCouchDBで実装したパッケージ管理システムを作成しました。Webブラウザ経由でRPMbブラウザでアップロードすると、ローカルリポジトリに登録されるようなシロモノです。個人的にはRPM使わないのでまぁ良いのですけど、ブラウザ経由でアップロードとか面倒ですね。 [#]_
また、Upstreamが配布しているRPMはまだしも、カスタムパッケージの場合、Debianパッケージでのpbuilderなどのように、mockでクリーンビルドを行っていないと、「オレの環境ではビルドできるんだけど？」という、「これはヒドイ」パッケージが配布されます。 [#]_ 

そこで、前述のDebianパッケージのビルドシステム同様に、Debian上でmockを使ってGitリポジトリからクリーンビルドすることができないかを検証してみました。

環境
----

検証した環境は次のとおりです。Trustyのmockパッケージも1.1.33で、後述のJenkinsでの実行は、Trusty上での実行をサンプルリポジトリを使って確認済みです。

* Debian GNU/Linux Sid
* mock 1.1.33 
* chrootターゲット epel-6-x86_64 (CentOS6用) [#]_

  * chrootのターゲットは、/etc/mock以下の .cfgファイルから選びます。mock(1)には、デフォルトでは、/etc/mock/default.cfgというファイルが選択される、とあるのですがDebianパッケージにはこのファイルはありません。必要ならユーザが用意する必要があります。

また、site-wideの設定として/etc/mock/site-default.cfgが使用されます。こっちは後述のGit関連のオプションを指定する際に内容を確認しました。

環境準備
--------

1. mockパッケージのインストール::

     $ sudo apt-get install mock

2. mockグループの作成::

     $ sudo addgroup mock

3. 実行ユーザをmockグループに追加::

     $ sudo adduser mkouhei mock

4. chroot用ディレクトリの作成::

     $ sudo install -g mock -m 2775 -d /var/lib/mock

5. chrootツリー作成::

     $ mock -r epel-6-x86 --init

これを実行しなくても、初回のビルド実行すると、chrootツリーがなければ作成されます。
/var/lib/mock/epel-6-x86_64/rootに作成されます。


Source RPMをリビルド
--------------------

まずは普通にSource RPMをリビルドしてみました。::

  $ mock -r epel-6-x86_64 rebuild /path/to/example-0.1-1.src.rpm

実行すると、ログと正常に実行された場合に生成されるRPMファイルが/var/lib/mock/epel-6-x86_64/result以下に生成されます。生成されるファイルは下記の通りです。

* available_pkgs
* build.log
* installed_pkgs
* root.log
* state.log
* example-0.1-1.src.rpm
* example-0.1-1.x86_64.rpm

root.log, state.log, build.logでビルドに問題無いかを確認できます。mock自体はPythonで書かれていて、実行時にエラーになるとPythonのログを吐いてくれるので、原因は割と追っかけやすいです。

chrootツリーは生成されるとepel-6-x86_64の場合約432MB、キャッシュが/var/cache/mock/epel-6-x86_64以下に約327MB、/var/cache/yum以下に約71MB程度できます。キャッシュは依存するパッケージなどによって増減するでしょうけど、まぁ最低1GB程度あれば事足りそうです。

Gitリポジトリからビルド
-----------------------

git-buildpackageと同様に、Gitリポジトリからビルドするには、 `--scm-enable` オプションおよび `--scm-option` オプションを使います。

mock(1)のサンプルでは、 `--scm-option` の引数には::

  mock -r fedora-14-i386 --scm-enable --scm-option package=pkg

とだけあり、他のkey-valueが分からないのですが、ここで前述の/etc/mock/site-defaults.cfgが参考になります。次のような記述があります。

.. code-block:: python

    # 
    # Things that must be adjusted if SCM integration is used: 
    # 
    # config_opts['scm'] = True 
    # config_opts['scm_opts']['method'] = 'git' 
    # config_opts['scm_opts']['cvs_get'] = 'cvs -d /srv/cvs co SCM_BRN SCM_PKG' 
    # config_opts['scm_opts']['git_get'] = 'git clone SCM_BRN git://localhost/SCM_PKG.git SCM_PKG' 
    # config_opts['scm_opts']['svn_get'] = 'svn co file:///srv/svn/SCM_PKG/SCM_BRN SCM_PKG' 
    # config_opts['scm_opts']['spec'] = 'SCM_PKG.spec' 
    # config_opts['scm_opts']['ext_src_dir'] = '/dev/null' 
    # config_opts['scm_opts']['write_tar'] = True 
    # config_opts['scm_opts']['git_timestamps'] = True 
     
    # These options are also recognized but usually defined in cmd line 
    # with --scm-option package=<pkg> --scm-option branch=<branch> 
    # config_opts['scm_opts']['package'] = 'mypkg' 
    # config_opts['scm_opts']['branch'] = 'master'

この中で実質上必須のオプションは次の通りです。
これらのkey毎に `--scm-option` で指定する必要があります。

* package
* git_get
* spec
* wirte_tar

まず、 `git_get` を指定しないと上記の例がデフォルト設定になっているため、 `git://localhost/package.git` からcloneしようとします。 `git clone` をつけないといけないのと、既にclone済みのディレクトリをそのまま使えないのがイケてないですね。
ただ、後者については、 `git_get=git clone /path/to/repo` と指定すれば、clone済みのリポジトリからcloneできます。 [#]_ また `git_get` でcloneすると、自動的にchroot内のローカルリポジトリにchdirします。

`spec` の指定はローカルリポジトリのディレクトリをrootとし、そこからの相対パスで指定できます。なので、upstreamのGitリポジトリにrpm用のspecファイルが含まれている場合、specファイルの相対パスを指定してビルドすることができます。簡便であるという点では良いのですが、Debianパッケージのように、upstreamのソースコードとメンテナスクリプトを分離する概念がmockしないため、第三者のFLOSSのGitリポジトリからforkしてパッケージ管理するとコミットログが混じってしまって混ぜるな危険な感じではあります。あるいは、自分で `git-buildpackage` のように `upstream` ブランチと `master` ブランチを分けて管理する、という方法も取れますが、自分で一からやるのは面倒ですね。

`write_tar` は、specファイルの中で `Source` タグを指定している場合、 `True` を指定します。デフォルトは `False` です。 `True` を指定するとchroot内の `/builddir/build/SOURCES` ディレクトリ以下にGitリポジトリから `tar czf` で生成されたtarballが配置されます。 [#]_ これが生成されないと、mockでの `rpmbuild` 実行中にコケます。

実際にGitリポジトリからビルドするには次のように実行します。::

  $ mock -r epel-6-x86_64 --scm-enable --scm-option package=example --scm-option git_get="git clone git@remote/example.git" --scm-option spec=rpm/example.spec --scm-option write_tar=True 

ローカルミラーやローカルリポジトリを使う場合
--------------------------------------------

カスタムパッケージなどに依存するパッケージを作るには、ローカルリポジトリが必要になります。
chroot環境で参照するyumリポジトリは、 `-r` オプションで指定した、 `epel-6-x86_64.cfg` に記述があります。

.. code-block:: python

                config_opts['root'] = 'epel-6-x86_64' 
                config_opts['target_arch'] = 'x86_64' 
                config_opts['legal_host_arches'] = ('x86_64',) 
                config_opts['chroot_setup_cmd'] = 'groupinstall buildsys-build' 
                config_opts['dist'] = 'el6' # only useful for --resultdir variable subst 
                
                config_opts['yum.conf'] = """ 
                [main] 
                cachedir=/var/cache/yum 
                debuglevel=1 
                reposdir=/dev/null 
                logfile=/var/log/yum.log 
                retries=20 
                obsoletes=1 
                gpgcheck=0 
                assumeyes=1 
                syslog_ident=mock 
                syslog_device= 
                
                # repos 
                [base] 
                name=BaseOS 
                enabled=1 
                mirrorlist=http://mirrorlist.centos.org/?release=6&arch=x86_64&repo=os 
                failovermethod=priority 
                
                [updates] 
                name=updates 
                enabled=1 
                mirrorlist=http://mirrorlist.centos.org/?release=6&arch=x86_64&repo=updates 
                failovermethod=priority 
                
                [epel] 
                name=epel 
                mirrorlist=http://mirrors.fedoraproject.org/mirrorlist?repo=epel-6&arch=x86_64 
                failovermethod=priority 
                
                [testing] 
                name=epel-testing 
                enabled=0 
                mirrorlist=http://mirrors.fedoraproject.org/mirrorlist?repo=testing-epel6&arch=x86_64 
                failovermethod=priority 
                
                [local] 
                name=local 
                baseurl=http://kojipkgs.fedoraproject.org/repos/dist-6E-epel-build/latest/x86_64/ 
                cost=2000 
                enabled=0 
                
                [epel-debug] 
                name=epel-debug 
                mirrorlist=http://mirrors.fedoraproject.org/mirrorlist?repo=epel-debug-6&arch=x86_64 
                failovermethod=priority 
                enabled=0 
                """ 


なので、ローカルミラーやローカルリポジトリを使う場合にはここを変更すればよいでしょう。なお、デフォルトでgpgcheckは無効になっています。 [#]_
gpgcheckを有効にして、ローカルリポジトリのGPG公開鍵を追加する場合は、/var/cache/mock/epel-6-x86_64/root_cache/cache.tar.gz を修正し、chrootツリーを作成しなおす必要があります。

Jenkinsでmockを実行する
-----------------------

Jenkinsでmockを実行する場合、ssh経由でしか `git clone` できないリポジトリを使う場合には、private keyのパスフレーズの入力面倒です。なので、JenkinsのGitプラグインを使って、JenkinsのWORKSPACEにcloneしたローカルリポジトリを使ってビルドすることになります。
ところが、前述の通り、mockは `git_get` で `git clone` する必要があります。なので、

#. JenkinsのGitプラグインで `git clone` する
#. mockに `--scm-option git_get='git clone ${WORKSPACE}/repo'` オプションで、JenkinsのWORKSPACEから更に `git clone` する

という2段階の `git clone` を行えば使えることになります。
なんかダサいですね。

Bitbucketに用意した `サンプルリポジトリ <https://mkouhei@bitbucket.org/mkouhei/example.git>`_ を使うと、Jenkinのジョブ設定は下記のようになります。

* Git repository

  * https://mkouhei@bitbucket.org/mkouhei/example.git

* Branch Specifier (blank for 'any')

  * \*/master

* Local subdirectory for repo

  * example

* シェルスクリプト

.. code-block:: sh

   mock -r epel-6-x86_64 \
       --resultdir=${WORKSPACE}/result \
       --scm-enable \
       --scm-option package=example \
       --scm-option git_get="git clone ${WORKSPACE}/example" \
       --scm-option spec=rpm/example.spec \
       --scm-option write_tar=True


`--resultdir` オプションで${WORKSPACE}/result を指定すると、ワークスペース下にresultディレクトリが生成されます。

残タスクとしては、生成するRPMにGPGで署名すること、ローカルリポジトリにpush & createrepoを実行することですね。

まとめ
------

以上で、Debian/UbuntuでJenkinsを使って、RHEL系のシステムのRPMの自動ビルドもできるようになりました。普段Debianシステムしか使ってないのに、やんごとなき事情でRPM作らざるを得なくなっても、Debianシステムだけで基本的には完結できますね。

.. rubric:: Footnotes

.. [#] 自分で作って＆メンテしておきながら、これはヒドイ。
.. [#] 他の人が作ったspecファイルを今回の検証に使ったらそうだったのです。
.. [#] デフォルトでは、CentOSとFedoraの各バージョン用のファイルが用意されています。この辺はpbuilder/cowbuilderよりも親切で便利ですね。
.. [#] CVS、SVNも対応できるようにするため、とは言え、 `コマンドを書かないとアカン <https://git.fedorahosted.org/cgit/mock.git/tree/py/mockbuild/scm.py?h=available_pkgs_plugin#n87>`_ のは微妙ですね。
.. [#] `git archive` コマンド `ではない <https://git.fedorahosted.org/cgit/mock.git/tree/py/mockbuild/scm.py?h=available_pkgs_plugin#n146>`_ のです。これもCVS, SVNも対応するためでしょう。
.. [#] `upstream自体で無効 <https://git.fedorahosted.org/cgit/mock.git/tree/etc/mock/epel-6-x86_64.cfg?h=available_pkgs_plugin#n15>`_ にされています

.. author:: default
.. categories:: Packaging
.. tags:: rpm, mock, Git, Debian, Jenkins
.. comments::
