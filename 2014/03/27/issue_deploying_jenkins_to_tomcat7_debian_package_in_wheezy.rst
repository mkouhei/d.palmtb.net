Issue deploying Jenkins to Tomcat7 Debian package in Wheezy
===========================================================

travis-ciはよく使っているのですが、JenkinsはあのWeb UIに馴染めなくて今まで使っていませんでした。が、この度仕事でJenkinsを用意する必要が出てきたの [#]_ で、Debian GNU/Linux Wheezyでサーバを用意することにしました。

用意するにあたり、upstreamからwarファイルをダウンロードし、直接実行する方法で、まず全体設定やセキュリティ関連の設定を試しました。そのあとで、DebianパッケージのTomcat7上で動かそうとした際にちょっとハマりました。これはそのメモです。ググった限りでは同様の問題にハマっている人は多分いないのでしょう。

直接実行の場合
--------------

OpenJDKを使うため、default-jre-headless パッケージをインストールします。あとは、warファイルをダウンロードして直接実行するだけです。

.. code-block:: sh

   $ sudo apt-get intall default-jre-headless
   $ wget http://mirrors.jenkins-ci.org/war/latest/jenkins.war
   $ java -jar jenkins.war

検証途中で、権限周りの設定をしている時に間違えてEnterを打ってしまい、何もできなくなるというエライことに。きっと `これよくある問題 <https://wiki.jenkins-ci.org/display/JA/Disable+security>`_ なんでしょうね。

DebianパッケージのTomcat上で動かす場合
--------------------------------------

本題です。Tomcat7をまずDebianパッケージでインストールします。

.. code-block:: sh

   $ sudo apt-get install tomcat7 tomcat7-admin

インストールしたら自動的にTomcatが起動しますが、何の権限も無くてtomcatのweb管理画面にもアクセスできないので、/etc/tomcat7/tomcat-users.xmlを変更し、下記を<tomcat-users>の子要素として追加します。ユーザ名、パスワードは適当に設定して下さい。

.. code-block:: xml

   <tomcat-users>
       (snip)
	   <role rolename="manager"/>
	   <role rolename="manager-gui"/>
	   <role rolename="admin-gui"/>
	   <user username="tomcat" password="passw0rd" roles="manager,manager-gui,admin-gui"/>
   </tomcat-users>


設定したら、tomcat7を再起動します。


.. code-block:: sh

   $ sudo service tomcat7 restart

これで、設定したユーザ、パスワードを使って、 http://tomcat.example.org:8080/manager/ からTomcat管理画面にアクセスできます。あとは、先ほどダウンロードしたwarファイルを使ってデプロイしてやれば、
Jenkinsが起動します。

と思ったら大間違いで、デプロイできても起動できません。


原因は、tomcat7パッケージで作られるtomcat7ユーザのホームディレクトリの位置です。
tomcat7ユーザのホームディレクトリは、/usr/share/tomcat7になっているのですが、/usr以下のディレクトリはパッケージのインストール以外で置かれる静的ファイル以外は基本置かれません。しかし、Jenkinsは実行ユーザのホームディレクトリの直下に、.jenkinsディレクトリを作成し、そこに各種出力をします。/usr/share/tomcat7の所有権はrootユーザおよびrootグループであり、自由に書き込みはできません。

なので、次のようにしてやることで、この問題を回避できます。 [#]_

.. code-block:: sh

   $ sudo install -d -o tomcat7 -g tomcat7 -m 700 /var/lib/jenkins
   $ sudo ln -s /var/lib/jenkins /usr/share/tomcat7/.jenkins

あとは、tomcatを再起動すれば、Jenkinsが起動します。

この問題、TomcatもUpstreamのwarファイルを使うか、あるいはJenkinsも公式のDebianパッケージ [#]_ を使えば発生しない現象ですね、おそらく。しかし、Wheezyでは残念ながら公式パッケージにJenkinsは含まれていないので、Debianパッケージを用意するならSidからのバックポートが必要になります。が、ビルドの依存関係多いので、jenkins以外にもバックポートが多数必要という罠。今回バックポートせずにJenkinsだけをwarファイル使ったのは、たんに私の甘え＆ゆとりです。

.. rubric:: Footnotes

.. [#] 本来のきっかけとは別に、SidからWheezyやPrecise向けにDebianパッケージをバックポートしたり、自前のツールをDebianパッケージにする際のオートビルド環境として、`jenkins-debian-glue <http://jenkins-debian-glue.org/>`_ が良いよ、と `@lurdan <https://twitter.com/lurdan>`_ に教えて頂いたので、それも動機となっています。
.. [#] /usr/share/tomcat7/.jenkinsディレクトリを作って、所有権をtomcat7:tomcat7にする、というのでも動きますが、お行儀悪いのでやめましょう。
.. [#] `Upstreamが配布しているDebianパッケージもあります <http://pkg.jenkins-ci.org/debian/>`_ が、これはDebianの公式パッケージではないので、私は使いません。

.. author:: default
.. categories:: Debian
.. tags:: Debian,Jenkins,Tomcat
.. comments::
