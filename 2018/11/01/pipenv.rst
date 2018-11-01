pipenv 環境でのコマンドを直接実行する
=====================================

これ自体は :code:`pipenv shell` の引数として実行したいコマンドを指定すれば良いだけです。本ブログでは `tinkerer <https://github.com/vladris/tinkerer>`_ を使っているので、 :code:`tinker` コマンドを実行するには、

.. code-block:: shell

   $ pipenv install Tinkerer
   $ pipenv shell "tinker -p 'blog title'"

とすれば、 `ブログの投稿用ファイルを生成 <http://tinkerer.me/pages/documentation.html#create-a-post>`_ できます。

ただし、これには一つ問題がありpipenv shell の環境に入ったままになってしまうことです。
例えば、シェルスクリプトやMakefileで実行する場合、pipenv shell 環境に入ったままになるので、スクリプト実行時のシェル環境を想定していると期待通りの結果にならない可能性もあります。

で、これを解決するには単純に下記のようにすれば、コマンド実行後にpipenv shell 環境を抜けます。

.. code-block:: shell

   pipenv shell "tinker -p 'blog title'; exit"



余談。久々にブログ書いたついでにタイトルも変更してみました。

.. author:: default
.. categories:: Python
.. tags:: blog, pipenv
.. comments::
