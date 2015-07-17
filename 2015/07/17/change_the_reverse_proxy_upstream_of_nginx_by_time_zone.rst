Change the reverse proxy upstream of Nginx by time zone
=======================================================

`諸事情 <http://sideci.hatenablog.com/entry/2015/05/08/094043>`_ により、VPSでNginxで運用しているリバースプロキシで、下記のように、時間帯によって振り分け先を変更させるようにしてみました。 [#]_

.. blockdiag::

   blockdiag admin {
     node_width = 60;
     span_width = 180;
     app0 [label="app-a"];
     app1 [label="app-b"];
     nginx -> app0 [label="0-11時台の振り分け先"];
     nginx -> app1 [label="12-23時台の振り分け先"];
   }

時間の判定には `HttpLuaModule <http://wiki.nginx.org/HttpLuaModule>`_ の `set_by_lua <http://wiki.nginx.org/HttpLuaModule#set_by_lua>`_ を使いました。nginx-extrasパッケージのインストールが必要です。

.. code-block:: shell

   $ sudo apt-get install nginx-extras

`ここ <http://stackoverflow.com/questions/17642961/deliver-a-503-service-unavailable-at-specific-times/17644382#17644382>`_ を参考にNginxに下記の設定を行いました。

.. code-block:: perl

   (snip)

   upstream app-a.example.org {
       server app-a.example.net;
   }
   
   server {
       server_name app-a.example.org;
       access_log /var/log/nginx/app-a.access.log;
       location / {
           proxy_pass http://app-a.example.org/;
       }
   }
   
   upstream app-b.example.org {
       server app-b.example.net;
   }
   
   server {
       server_name app-b.example.org;
       access_log /var/log/nginx/app-b.access.log;
       location / {
           proxy_pass http://app-b.example.org/;
       }
   }
   
   server {
       server_name app.example.org;
       access_log /var/log/nginx/app.access.log;
       set $access_a_zone 0;
       set_by_lua $access_a_zone '
           local time = os.date("*t")
           if 0 <= time.hour and time.hour < 12 then
                return 1
           end
       ';
       
       if ($access_a_zone = 1) {
           rewrite ^ $scheme://app-a.example.org$request_uri permanent;
       }
       rewrite ^ $scheme://app-b.example.org$request_uri permanent;
   }

``http://app.example.org`` でアクセスすると、0-11時台は ``http://app-a.example.net`` にリダイレクトし、12-23時台は ``http://app-b.example.net`` にリダイレクトするだけの設定です。変数access_a_zoneは当初リンク先同様、下記のようにbooleanにしようとしましたが、Ubuntu TrustyのNginx 1.4.6だと期待通りに判定されず、最後のrewriteが実行されてしまうので、0, 1を設定することにしました。

.. code-block:: perl

   set_by_lua $access_a_zone '
       local time = os.date("*t")
       local access_a_zone = false
       if 0 <= time.hour and time.hour < 12 then
           access_a_zone = true
       end
       return access_a_zone
   ';
   
   if ($access_a_zone) {
   (snip)

カスタムドメインを使う場合、上記の ``app-a.example.org`` と ``app-b.example.org`` の ``CNAME`` レコードか ``ALIAS`` レコードを設定する必要がありますが、今回はリバースプロキシの IPアドレスを ``app.example.org``, ``app-a.example.org``, ``app-b.example.org`` それぞれ ``A`` レコードとして設定しました。少なくとも現時点ではこの方法でもアクセスできます。

まとめ
------

リダイレクトしてしまうので、ドメイン名も午前と午後で変わるので、ドメインも変わらないようにするなら ``app.example.org`` をリダイレクトし、カスタムドメインをAPIで定時で削除＆追加でするとできます。一瞬アクセスできない時間ができてしまいますが。

今のところ解析結果をMemcachedに入れているだけで、特にデータ更新も行わないお遊びのサイトなので今回の方法を取りました。
無料の範囲内で遊ぶために2つもリソース使って、本末転倒じゃないかという内容なので、いろいろお察し下さい…。

.. rubric:: footnote

.. [#] 制約超えると通知されるメールが増えてきたので…。

.. author:: default
.. categories:: Ops
.. tags:: Nginx,Lua,Debian
.. comments::
