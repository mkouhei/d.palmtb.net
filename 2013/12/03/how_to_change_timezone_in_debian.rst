How to change timezone in Debian
==================================

`Debian/Ubuntu JP Advent Calendar 2013 <http://atnd.org/events/45968>`_ の三日目の記事です。二日目じゃないよ、三日目だよ。

この時期になると各所で「もう少しだけ時間が伸びたらいいのにッ！」とお悩みの方が多いことでしょう。そんな貴方に朗報です。今からハワイにバカンスに行くのですッ！タイムゾーンは当然違う上、日付変更線越えるので一日巻き戻った感があってとってもお得ですね。

Debianでシステムグローバルにタイムゾーンを変更するには、 dpkg-reconfigure コマンドで行います。

.. code-block:: sh

   $ sudo dpkg-reconfigure tzdata

あとは、「地理的情報」で「太平洋側」を選択し、「時間帯」で「ホノルル」を選択し、「了解」を押すだけですッ！良かった、これで貴方の Advent Calendarネタは間に合ったことでしょう。

もっと手軽にやりたい？

.. code-block:: sh

   $ TZ='Pacific/Honolulu'; export TZ
   $ date
   2013年 12月  2日 月曜日 05:45:11 HST
   $ tinker -p "How to change timezone in Debian"
   
   New post created as '/home/mkouhei/docs/d.palmtb.net/2013/12/02/how_to_change_timezone_in_debian.rst'


はっ！？娘を寝かしつけて仕事やるかと目覚めたら、 `二日目がなかった！とかそんな現実はなかった <http://atnd.org/events/45968#comments>`_ ので、このネタを使う必要はなかったようです。良かった良かった。

さー、仕事しよ、仕事。

.. author:: default
.. categories:: Debian
.. tags:: Linux,Debian,DebianUbuntuAdvent2013
.. comments::
