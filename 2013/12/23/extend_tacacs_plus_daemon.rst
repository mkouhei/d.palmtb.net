Extend TACACS+ daemon
=====================

`Debian/Ubuntu JP Advent Calendar 2013 <http://atnd.org/events/45968>`_ の 23日目 [#]_ の記事です。
Advent Calendar、 今年こそは穴が出ないようにと思って、ホノルル時間を駆使して途中まで穴を埋めていましたが、(家事&仕事&育児)疲れ＋娘からもらった風邪、で途中断念してしまいました。残念。

閑話休題。今回の内容は、「TACACS+でアクセス制御を行うユーザアカウントを、LDAPで一元管理できるようにTACACS+をカスタマイズしたよ」というお話です。

はじめに
--------

ネットワーク機器へのアクセス制御用のプロトコルに TACACS+ というのがあります。またプロトコルと同じ名前の、Unix/Linux 上で動くデーモンもあります。元々CiscoがGPLv2で公開したものを機能拡張してメンテナンスされているのが `リンク先 <http://www.shrubbery.net/tac_plus/>`_ で公開されているもので、これは `Debianパッケージ <http://packages.qa.debian.org/t/tacacs+.html>`_ にもなっています。


背景
----

ネットワークエンジニア自体の数はたいてい少数で、共有アカウントでのネットワーク機器の運用を行っていることも多いかと思います。しかし、一方で、誰が何をやったのか、という作業ログは取りたい、という要望もあるでしょう。するとアカウンティングは最低限TACACS+でやろう、という話になるかと思います。そのついでに個人ユーザ化もできると良いよね、という展開になりますね。

さて、TACACS+では個人ユーザアカウントを作るには、設定ファイル(/etc/tacacs+/tac_plus.conf)で次のいずれかの設定を行います。

* loginディレクティブなどで指定したpasswd(5)フォーマットのファイルでユーザ管理する
* 必要なユーザ数分、userディレクティブで定義する

前者の場合、ユーザ名、および平文もしくはDES暗号化したパスワードを下記のように記述したファイルを作成します。

.. code-block:: pkgconfig

   user1:password::::
   user2:password::::

これを、 **`login = file /path/to/passwd`** として設定します。この方法のメリットは、このファイルを更新しても、tac_plusデーモンを再起動する必要がないことです。しかしこの方法の最大のデメリットは、この方法での一番のネックは「DESで暗号化したパスワードが必要」という点です。既にLDAPなどでユーザアカウントの管理を一元管理している場合、パスワードをユーザに入力させて、平文のパスワードをDESで暗号化し、その暗号化されたパスワードをこのファイルに登録ないし、更新を行わなければなりません。この方法を使うのであれば、LDAP用のパスワード変更用UIのバックエンドでこのファイルの更新処理も行うようにするという方法になるかと思いますが、処理が面倒な上、そのUIの管理が自分でない場合は、さらに(その管理者との)調整なども面倒です。また、ファイルの読み取りができればBrute force attackでパスワードの解読も可能な点も考えると、LDAPなどで一元管理していても別で漏れてしまう可能性がある方法を採用するのは避けたいところです。

一方、後者の必要なユーザ数分、userディレクティブで定義する場合、基本的には次のような設定を行います。 [#]_

.. code-block:: lighty

   user = fred {
       login = des mEX027bHtzTlQ
       # (snip)
   }

これではここにユーザ設定した上にDESで暗号化したパスワードも記述しないといけない分、先ほどのpasswdファイルでの管理よりも不便になってしまいます。そこで、PAMとの連携です。loginで指定している認証方法には PAM を使うこともできます。設定方法は下記の通りです。

.. code-block:: lighty

   user = fred {
       login = PAM
   }

認証自体はPAMに任せてしまえば、あとはPAMで良きように計らってくれるのです。つまり、pam-ldapを使い、LDAPでユーザ認証を行っているのであれば、TACACS+で認証させたいユーザアカウントをtac_plus.confに定義だけ行っておけば、パスワード自体の管理は行う必要はありません。先ほどよりも結構便利です。

しかし、この方法もまだ不便な点があります。つまりtac_plus.confにユーザ定義を行わないと行けない、という点です。ユーザの追加・削除のたびにtac_plus.confを変更するという運用を行わなければいけません。


対応
----

とりうる対策としては2つです。

#. LDAPからユーザアカウントが登録 or 削除されたら、tac_plus.confを書き換え、tac_plusにSIGHUPを発行する
#. default authentication をPAM対応させる

前者で行うなら、LDAPのパスワード変更用UIのバックエンドで処理させたり、定期的にLDAPのデータをチェックして更新するようなジョブを組めば良いかもしれません。しかし、ansibleなどでpush型で反映するなり、TACACS+サーバ上で、ldapsearchの結果を元に変更するpull型でも即時反映されずタイムラグがある点を考慮すると微妙な感じです。

後者のdefault authenticationは、tac_plus.confで使えるデフォルトの認証方法の指定を行うためのディレクティブです。
が、現時点では前述の login ディレクティブなどで設定する、 **file /path/to/passwd**
のような値しか取れません。なので、現時点ではgroup ディレクティブの中でloginの値として使う場合と同様、
TACACS+サーバにpasswd ファイルを配置し、その管理を行わなければなりません。
そこで、このdefault authenticationでPAMをサポートするようにしたのが今回の対応です。

.. code-block:: lighty

   default authentication = PAM

上記の設定を行うことで、個々のuserディレクティブの設定が不要になります。 [#]_

この対応を、Sid版のtacacs+ 4.0.4.26と、Wheezy版の4.0.4.19にパッチを当てて、git-buildpackagesで管理したものをGitHubで公開しています。なので、git-buildpackageコマンドで自分でDebianパッケージを作成してお試しいただくこともできます。

* `for Wheezy <https://github.com/mkouhei/tacacs-plus/commit/1c4a92926e7f4fee47f4fe13a365edc66af3bc60>`_
* `for Sid <https://github.com/mkouhei/tacacs-plus/commit/8e3b55914e5b086db4ca15c9d52c03cb86397d59>`_

また、Upstreamにパッチが取り込まれると、手離れできて嬉しいので、 `MLに投稿してみました <http://www.shrubbery.net/pipermail/tac_plus/2013-October/001347.html>`_ 。が、今のところ開発者からの反応はないので取り込まれるのは難しいのかなぁという感じです。クリスマスまでに反応があれば最高のクリスマスプレゼントなんですけどね。 :)


.. [#] またしてもホノルル時間です。
.. [#] この例はtac_plus.conf(5)に載っている例の一部引用です。
.. [#] ちなみにgroupディレクティブにlogin = PAMを設定すれば良いのではないか、と考えるかもしれませんが、その設定を行った場合でも、個々のuserディレクティブの設定が必要です。


.. author:: default
.. categories:: network,Debian,git-buildpackage
.. tags:: TACACS+, C, DebianUbuntuAdvent2013
.. comments::
