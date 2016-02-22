bootstrap Python package
========================

以前、Pythonパッケージ生成用のテンプレートをシェルスクリプトで作ったのですが、Pythonで一から書き直して `bootstrap-py <https://pypi.python.org/pypi/bootstrap-py>`_ としてPyPIで公開しました。

できること
----------

* そのままPyPIに登録可能な形でPythonパッケージを生成
* PyPIで登録されている名前を事前チェック
* Toxを使ってユニットテストとテストツールを実行

  * pytest-covによるカバレッジの計測
  * pytest-pep8 コーディング規約のチェック
  * pytest-flakes による文法チェック
  * pytest-pylint によるコードチェック
  * PyChecker によるバグ検出
  * docstringのチェック
  * ユニットテストの実行順をランダム化
  * 前回以前のテスト実行時の古いバイトコードを削除
  * Sphinxでのドキュメントビルドチェック
  
* Sphinxとautomoduleによるドキュメント自動生成
* ClassifiersからのOSI Approved LICENSESとdevelopment statusの選択
* GitHubアカウントを指定した場合に、Travis-CI, Coveralls, ReadTheDocsのステータスボタンをREADMEに設定
* GitPythonで上記が設定した状態でGitリポジトリを生成し、user.name, user.email およびremote originを設定し、Initial commitを作成

Python 2.7以上、Python3.3以上、PyPy 2.4.0以上で初期コミット状態でtoxが通ります。（生成されたリポジトリでのPythonコードは実質setup.pyだけ、というのもありますが）

使い方などはREADMEにありますのでそちらを参照ください。

リポジトリは、 `こちら <https://github.com/mkouhei/bootstrap-py>`_ 。

GitPython久しぶりに使った
-------------------------

約3年半前に `ネタで書いたコード <https://github.com/mkouhei/iori>`_ で使って以来、久しぶりにGitPythonを使いました。あー、便利。だけど、早速バグを見つけてしまった(commit時に、.git/HEADに ``\n`` が最後に付加されない)ので、バグ報告しておこう。

余談
----

以前はこれの拡張で、Django + django REST framework + Django絡みのベストプラクティスと言われるようなのを予め反映させるテンプレート(それもやはりシェルスクリプト)を作ったのですが、最近Djangoは使っていないのでとりあえず予定はありません。

おわり。

.. author:: default
.. categories:: Python
.. tags:: bootstrap-py
.. comments::
