difflib.ndiff() and assertMultiLineEqual() are very useful
==========================================================

Gitでdiffを行うとデフォルトでは、GNU diffの `diff -u` と同じ挙動なので行単位での差異がでます。
文章のdiffを取りたい場合には `--word-diff` というオプションをつけると、 `[-word-]{+word+}` という形式で違う箇所が表示されるので便利です。

さて本題。Pythonでテストコードを書いて、文字列の比較に `assertEqual()` を使うと、

.. code-block:: python

   _____________________________________ DebbuildTests.test_generate_batch_script ______________________________________
   
   self = <debbuild.tests.test_debbuild.DebbuildTests testMethod=test_generate_batch_script>
   
       def test_generate_batch_script(self):
           """ unit test of generate_batch_script """
           debbuild.generate_batch_script(self.params)
           # self.assertMultiLineEqual(self.batch_content,
           self.assertEqual(self.batch_content,
   >                        debbuild.generate_batch_script(self.params))
   E       AssertionError: '#!/bin/sh -x\nexport DEBFULLNAME="Dummy Maintainer"\nexport DEBEMAIL=dummy@example.org\napt-get -y install curl devscripts quilt patch libdistro-info-perl fakeroot\napt-get -y build-dep shello\ndget -d http://example.org/debian/pool/main/s/shello/shello_0.1-1.dsc\ndpkg-source -x shello_0.1-1.dsc\n(\ncd shello-0.1\ndebuild -us -uc\n)\ncp -f shello_0.1-1.debian.tar.gz  shello_0.1.orig.tar.gz shello_0.1-1.dsc /home/mkouhei/debbuild/temp/\n' != '#!/bin/sh -x\nexport DEBFULLNAME="Dummy Maintainer"\nexport DEBEMAIL=dummy@example.org\napt-get -y install curl devscripts quilt patch libdistro-info-perl fakeroot\napt-get -y build-dep shello\ndget -d http://example.org/debian/pool/main/s/shello/shello_0.1-1.dsc\ndpkg-source -x shello_0.1-1.dsc\n(\ncd shello-0.1\ndebuild -us -uc\n)\ncp -f shello_0.1-1.debian.tar.gz shello_0.1.orig.tar.gz shello_0.1-1.dsc /home/mkouhei/debbuild/temp/\n'
   
   tests/test_debbuild.py:220: AssertionError


とエラーは検出できてもどこが間違っているのか解読するのは困難です。なので、 `assertMultiLineEqual() <http://docs.python.jp/2/library/unittest.html#unittest.TestCase.assertMultiLineEqual>`_ を使うとこの問題を解決できます。

.. code-block:: python

   (snip)
   >                        debbuild.generate_batch_script(self.params))
   E       AssertionError: '#!/bin/sh -x\nexport DEBFULLNAME="Dummy Maintainer"\nexport DEBEMAIL=dummy@exam [truncated].
   .. != '#!/bin/sh -x\nexport DEBFULLNAME="Dummy Maintainer"\nexport DEBEMAIL=dummy@exam [truncated]...
      E         #!/bin/sh -x
      E         export DEBFULLNAME="Dummy Maintainer"
      E         export DEBEMAIL=dummy@example.org
      E         apt-get -y install curl devscripts quilt patch libdistro-info-perl fakeroot
      E         apt-get -y build-dep shello
      E         dget -d http://example.org/debian/pool/main/s/shello/shello_0.1-1.dsc
      E         dpkg-source -x shello_0.1-1.dsc
      E         (
      E         cd shello-0.1
      E         debuild -us -uc
      E         )
      E       - cp -f shello_0.1-1.debian.tar.gz  shello_0.1.orig.tar.gz shello_0.1-1.dsc /home/mkouhei/debbuild/temp/
      E       ?                                  -
      E       + cp -f shello_0.1-1.debian.tar.gz shello_0.1.orig.tar.gz shello_0.1-1.dsc /home/mkouhei/debbuild/temp/

上記の通り、cpコマンドの２つ目の引数の後ろにスペースが一つ余計に入っていることが、"-" で示してあるので分かりやすいです。
最近までこのメソッドの存在に気づいていませんでした。ちゃんとリファレンス読め、ワシ…。

自分で同様の処理を行うなら、 `difflib.ndiff() <http://docs.python.jp/2/library/difflib.html#difflib.ndiff>`_ を使うとできます。次のような関数を定義すれば `assertMultiLineEqual()` の代わりに通常のコードの中でも使えます。

.. code-block:: python

   import difflib

   def worddiff(string1, string2):
       diff = difflib.ndiff(string1.splitlines(1), string2.splitlines(1))
       print(''.join(diff))


ググるとndiff()については結構ブログで書かれているみたいなのですが、assertMultiLineEqualの方はあまり見当たらないですね。

.. author:: default
.. categories:: Python
.. tags:: Python,Git
.. comments::
