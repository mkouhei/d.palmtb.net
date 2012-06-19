PythonのMySQL用インタフェースを使ってみた。
==========================================================================

TonicDNSのアカウントを発行するのに、いちいちSQLを実行していたのですが、SQL書き直して実行とか面倒なので主題のインタフェースを使ってみました。Debianパッケージではpython-mysqldbがそれです。

コードは `Githubにあげているとおり <https://github.com/mkouhei/tonicdnscli/blob/devel/utils/add_account.py>`_ ですが、実際には下記の部分だけ。

.. code-block:: python

   import MySQLdb as mdb
   (snip)
   con = mdb.connect('localhost', user, passwd, db)
   
   with con:
       cur = con.cursor()
       cur.execute("SELECT * from users WHERE username = %s", username)
       if cur.rowcount:
           print('Already that useraccount exists')
       else:
           cur.execute(
               "INSERT INTO users VALUES (NULL, %s, %s, %s, %s, %s, 0, 0)",
		       (username, passmd5, fullname, email, comment))

使い方は `リンク先 <http://mysql-python.sourceforge.net/MySQLdb.html>`_ かパッケージに含まれている /usr/share/doc/python-mysqldb/MySQLdb.txt.gz を読めば分かります。（内容は同じです）

.. author:: default
.. categories:: Ops
.. tags:: Python, MySQL, Debian
.. comments::
