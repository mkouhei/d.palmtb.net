ansible-ldap is very simple and useful
======================================

`OpenLDAP と仲間たち Advent Calendar 2015 <http://qiita.com/advent-calendar/2015/openldap>`_ 24日目、クリスマスイブですね。一昨日(12/22)にEngineer All Handsという社内のイベントでLTをすることになり、「LDAPと私」というネタで `ansible-ldap <https://bitbucket.org/psagers/ansible-ldap>`_ というモジュールの話を軽くしました。ついでにブログにでもちゃんと書いておこうかなと思い、昨日アドベントカレンダーの予定を見てみたら、空いていたので参加してみました。

概要
----

この記事の要点としては以下のとおりです。これを読んで理解できる方はその後を読む必要はありません。モジュールのソースコード内のドキュメントを読みましょう。

* ansible-ldapの ``ldap_entry`` および ``ldap_attr`` モジュールだけで LDAPのエントリーの追加・削除、エントリーの属性の追加、削除、置換を冪等に行うことができる
* ``ldapi://`` にも対応しているので slapd-config(5)の設定もできる
* `Ansible Galaxy <https://galaxy.ansible.com/>`_ には登録されてないのでパッチ書いてPR送った (mergeされるかは別の話)

あと、LDAPには直接関係ありませんが、
    
* サンプルのPlaybookを作っている際、サンプルデータをYAMLで記述するのが面倒になって、 `CSVから変数を読み込めるAnsibleモジュール <https://galaxy.ansible.com/detail#/role/6589>`_ を作った

ansible-ldapとは
----------------

`django-otp <https://pypi.python.org/pypi/django-otp>`_ 、 `django-auth-ldap <https://pypi.python.org/pypi/django-auth-ldap>`_ 、 `mockldap <https://pypi.python.org/pypi/mockldap>`_ などの作者の `Peter Sagerson <https://bitbucket.org/psagers/>`_ 氏が開発された Ansib用の LDAP モジュールです。django-auth-ldapやmockldapには前職でとてもお世話になってました。 [#]_

``ldap_entry`` と ``ldap_attr`` の2つのモジュールがあります。
前者はLDAPのDITに対し、entryを追加または削除を、後者はすでに存在するエントリーの属性を追加、削除、もしくは置き換えを行うためのモジュールです。

`fumiyasuさん <https://fumiyas.github.io/>`_ が一日目にslapd.conf(5)を使ったPlaybookの `記事 <https://fumiyas.github.io/2015/12/01/ansible.openldap-advent-calendar.html>`_ を書かれていますが、ansible-ldapモジュールを使う場合は、slapd-config(5)を使います。DebianやUbuntuのOpenLDAPサーバのパッケージである、slapdパッケージはslapd-config(5)がデフォルトです。slapd-config(5)絡みの記事は `以前書いたもの <http://d.palmtb.net/tags/openldap.html>`_ も `ある <http://tokyodebian.alioth.debian.org/undocumenteddebian.html>`_ ので、そちらもご参照ください。

使い方
------

これらのモジュールを使った `サンプルのPlaybook <https://github.com/mkouhei/playbook-slapd>`_ を作ったのでそれを例にして説明します。

ldap_entry
~~~~~~~~~~

まずはシンプルに ``memberof`` モジュールを追加する例です。

.. code-block:: yaml

   - name: be sure memberof module
     ldap_entry:
       dn: cn=module{1},cn=config
       state: present
       objectClass: olcModuleList
       olcModulePath: /usr/lib/ldap
       olcModuleLoad: memberof.la


``dn``
    必須項目です。エントリーの追加時、 ``{1}`` とあるindex番号は必要に応じて自動的に付加されます。しかし、 ``cn=module,cn=config`` と ``cn=module{1},cn=config`` は別のdnになります。そのためエントリー追加後、同様にindexを指定しないで属性の変更や、エントリーの削除を行おうとすると、エントリーが見つからないためエラーになります。変更するエントリーのindexを把握しておく必要があるのでサンプルで明示的に指定しています。

``state``
    デフォルトは ``present`` で存在しなければ作成し、存在すれば何もしません。削除するときは ``absent`` を使います。これはAnsibleの他モジュールと同じ挙動です。 ``ldap_entry`` には変更という操作はありません。つまり ``ldapadd`` コマンドと ``ldapdelete`` コマンドに相当する操作だけです。 ``ldapmodify`` コマンドに相当する操作は ``ldap_attr`` で行います。

``objectClass`` 及びその他の属性
    必要な場合は設定します。 slapd-config(5)の属性の名称はslapd.conf(5) の設定オプション名とは微妙に異なるので、``man slapd-config(5)`` で ``GLOBAL CONFIGURATION OPTIONS`` 以降のセクションを参照しましょう。

次に、suffixが ``dc=example,dc=org`` のLDAPディレクトリに対し、oganizational unitを追加する例を見てみます。

.. code-block:: yaml

   - ldap_entry:
       dn: "ou={{ item }},{{ suffix }}"
       objectClass: organizationalUnit
       ou: "{{ item }}"
       bind_dn: "cn=admin,{{ suffix }}"
       bind_pw: "{{ admin_pw }}"
       state: present
     with_items:
       - People
       - Groups
       - SUDOers

``server_uri``
    この例では省略していますが、これはデフォルトでは ``ldapi:///`` になります。リモートホストのLDAPサーバを対象にする場合には、LDAPのURLを指定する必要があります。

``start_tls``
    StartTLS LDAPを使うときはこのオプションを ``true`` にします。デフォルトでは ``false`` です。

``bind_dn`` と ``bind_pw``
    slapd-config(5) の設定の時は省略することで EXTERNAL mechanism でアクセスしますが、特定のDITの操作を行うには、デフォルトでは認証が必要になります。bind用のDNを ``bind_dn`` で、パスワードを ``bind_pw`` で指定します。slapd自体の設定し、特定のsuffix のDITに対し変更を行う場合、つい忘れがちなので気をつけましょう。

ldap_attr
~~~~~~~~~

アクセス権限を設定する例を見てみます。

.. code-block:: yaml

   - name: olcAccess are absent.
     ldap_attr:
        dn: "olcDatabase={1}{{ backend | lower }},cn=config"
        name: olcAccess
        state: absent
        values:
          - '{0}to attrs=userPassword by self write by anonymous auth by * none'
          - '{1}to attrs=shadowLastChange by self write by * read'
          - '{2}to * by * read'
     
   - name: olcAccess are present.
      ldap_attr:
        dn: "olcDatabase={1}{{ backend | lower }},cn=config"
        name: olcAccess
        state: present
        values:
          - '{0}to attrs=userPassword,shadowLastChange
             by self write
             by anonymous auth
             by dn="cn=admin,{{ suffix }}" write
             by * none'
          - '{1}to dn.base=""
             by * read'
          - '{2}to *
             by dn="cn=admin,{{ suffix }}" write
             by * read'
          - '{3}to dn.subtree="{{ suffix }}"
             by self read
             by * read'
          - '{4}to *
             by * none'


この2つのタスクでは、 ``absent`` でslapdインストール時にデフォルトで設定されるアクセス設定を一度削除し、 ``present`` で新しく設定しています。

このやり方は面倒ですね。代わりに ``exact`` を使えばひとつのタスクで変更できます。

.. code-block:: yaml

    - name: override olcAccess exactly
      ldap_attr:
        dn: "olcDatabase={1}{{ backend | lower }},cn=config"
        name: olcAccess
        state: exact
        values:
          - '{0}to attrs=userPassword,shadowLastChange
             by self write
             by anonymous auth
             by dn="cn=admin,{{ suffix }}" write
             by * none'
          - '{1}to dn.base=""
             by * read'
          - '{2}to *
             by dn="cn=admin,{{ suffix }}" write
             by * read'
          - '{3}to dn.subtree="{{ suffix }}"
             by self read
             by * read'
          - '{4}to *
             by * none'

``name`` で 変更する属性を指定し、 ``values`` で一つもしくは一つ以上の値を指定します。複数設定できるか否かは、設定するattributeのスキーマ次第です。他のパラメータは基本的には ``ldap_entry`` と同じです。

.. note:: 
   ``backend`` には `MDB <https://github.com/mkouhei/playbook-slapd/blob/master/group_vars/all#L8>`_ を指定しています。MDBは `LMDB <http://symas.com/mdb/>`_ をバックエンドとするためのdebconfのパラメータです。DNでは小文字になるため、lowerフィルターを使って小文字に変換しています。

ansible-ldapのインストール方法
------------------------------

現状、ansible-ldapは Ansible Galaxyには登録されてません。また、Ansible Galaxyで公開できる形式になっていないため、requirements.yml に

.. code-block:: yaml

   - src: https://bitbucket.org/psagers/ansible-ldap
     name: ldap
     scm: hg

のように記述し、 ``ansible-galaxy install -p library -r requirements.yml`` と実行してもインストールできません。手動で ``hg clone`` を実行し、playbookのlibraryディレクトリを以下にモジュールをコピーする必要があります。とても面倒です。ということで、パッチ書いてPRを送っておきました。

マージされるまでの間 [#]_ は、下記のように記述することで ``ansible-galaxy install`` コマンドでインストールすることができます。ただし、 ``--no-deps`` オプションが必要ですので気をつけましょう。

.. code-block:: yaml

   - src: https://bitbucket.org/mkouhei/ansible-ldap
     name: ldap
     scm: hg
     version: for-ansible-galaxy

さらにもしAnsible Galaxyに登録されたら、おそらくこんな記述になることでしょう。

.. code-block:: yaml

   - src: psagers.ldap


C bindingとPure Python
----------------------

今回紹介した django-auth-ldap、mock-ldapは OpenLDAPライブラリの C bindingと実装された `Python-LDAP <https://pypi.python.org/pypi/python-ldap>`_ やそのPython3対応としてのforkの `pyldap <https://pypi.python.org/pypi/pyldap>`_ に依存してします。 ansible-ldapもPython-LDAPに依存しています。 [#]_
Pure PythonでのLDAPクライアントの実装としての `ldap3 <https://pypi.python.org/pypi/ldap3>`_ は使用されていません。今回紹介する ansible-ldap も やはり Python-LDAPに依存しています。

今までに何度かLDAP用のAnsibleモジュールを書こうかな、と思ったことも何度かあったのですが [#]_ 、slapdの設定変更に必要なのは ``ldapi://`` (LDAP over IPC) でアクセス、操作できることなので、少なくともこの10月末まではC bindingのPython-LDAP / pyldapしかその機能があるPythonモジュールはありませんでした。 Pure Pythonのldap3では本当にこの最近(2015-11-15)、 `v0.9.9.3 <https://github.com/cannatag/ldap3/commit/2aee1896cc6a884e7ae141bb45cb0a9374bec8dc#diff-4f140a8310f9f572733b456cb83f7311R224>`_ として `LDAPIの機能が実装された <https://github.com/cannatag/ldap3/blob/master/docs/manual/source/bind.rst#ldapi-ldap-over-ipc>`_ ようです。

一方、このansible-ldapは `昨年の11月に基本機能を実装して公開されていた <https://bitbucket.org/psagers/ansible-ldap/commits/323e7ee4685c7dcc2394a3621ca0a28de343cffc>`_ いたので、ldap3を使っていないのは当然といえます。

DebianシステムではPython-LDAPは ``python-ldap`` パッケージとして提供されていますが、pyldapはDebianパッケージとして提供されていません。ldap3 は ``python-ldap3`` (Python2版) および ``python3-ldap3`` (Python3版) として提供されています。Ansible は Python3はまだ正式対応されていないので現状では playbook の中で、

.. code-block:: yaml

   - apt: pkg=python-ldap state=present

と ``python-ldap`` パッケージをインストールすればよいですが [#]_ 、Ubuntu の次のLTSではPython3だけになるので、pyenvなどでPython2.7を構築するタスクを書いた上 [#]_ で
                
.. code-block:: yaml

   - apt:
       pkg={{ item }}
       state=present
     with_items:
       - build-essential
       - libldap2-dev
     - pip: name=Python-LDAP

として、slapdを動かすホスト上でPython-LDAPのコンパイルも必要な上、ansible-ldapでは現状任意の ``PYTHONPATH`` を指定することができないので、 ``/usr/local/lib/python2.7/dist-packages`` の下にPython-LDAPをインストール必要があります。

(おまけ) CSVからvarsを読み込むモジュールを作りました
----------------------------------------------------

サンプルのPlaybookではユーザーの作成や、SSH公開鍵を登録するための `タスク <https://github.com/mkouhei/playbook-slapd/blob/master/roles/provider/tasks/users.yml>`_ もあるのですが、ユーザー作成用のパラメータや公開鍵をいちいちYAMLで記述するのはとても億劫です。なので、CSVで記述したものをvarsとして読み込むことのできる `include_csv <https://galaxy.ansible.com/detail#/role/6589>`_ というモジュールもついでに作りました。使い方としては、コアモジュールの `include_vars <http://docs.ansible.com/ansible/include_vars_module.html>`_ のような使い方になります。詳しくはAnsible GalaxyのREADMEのページを参照してください。

まとめ
------

今までは、Ansibleらしくない書き方でslapdの構築を行い、それが故に冪等にすることが難しいため変更はAnsibleで行わない、という運用になってしまっていましたが、このansible-ldapモジュールのおかげで冪等性を保つことができるようになりました。個人的には `ldapvi <http://www.lichteblau.com/ldapvi/manual/>`_ コマンド、Python-LDAPに続く、LDAPの運用・利用が非常に楽になるツールが登場したと思ってます。勝手に三種の神器と呼びたい。

また、include_csv も便利そうという意見ももらったので結構うれしいですね。 [#]_

.. rubric:: footnotes

.. [#] 11月からRuby on Railsの仕事をすることになり、業務では現時点ではPythonもLDAPも使っていません。
.. [#] マージされるかはわかりませんが。
.. [#] ansible 2.0.0-0.8.rc3 も試してみましたが、現状ではまだ ``ansible-galaxy`` コマンドが Python3 に対応していませんでした。
.. [#] 頻度の問題で、結局作らずに済ませてしまってきたのですが…。
.. [#] Debianシステムの場合。
.. [#] 今回の話と少しずれるので省略します。
.. [#] ちなみに今回、初Ansible Galaxy、つまり初のAnsible モジュール作成、初のアカウント作成、初のRole登録、初の ``ansible-galaxy`` コマンド利用、と初ものづくしでした。

.. author:: default
.. categories:: LDAP
.. tags:: Ansible,OpenLDAP,Python-LDAP,include_csv,Python,Debian,Ubuntu
.. comments::
