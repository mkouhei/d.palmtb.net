Change the reverse proxy upstream of Nginx without Lua
======================================================

前回の記事(:doc:`/2015/07/17/change_the_reverse_proxy_upstream_of_nginx_by_time_zone`) を見て、 `matsuu さん <http://b.hatena.ne.jp/entry/259767672/comment/tmatsuu>`_ が下記のような設定をGistに掲載されていたので試してみました。

.. gist:: https://gist.github.com/matsuu/830d8211c168e921762b

結果、問題なくできたので前回の設定は次のようにシンプルになりました。

.. code-block:: perl

    map $time_iso8601 $upstream {
        default "app-b.example.org";
        "~T(0|1[01])" "app-a.example.org";
    }
     
    server {
        server_name app.example.org;
        rewrite ^ $scheme://$upstream$request_uri permanent;
    }
     
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
        server_name app-b.example.org
        access_log /var/log/nginx/app-b.access.log;
        location / {
            proxy_pass http://app-b.example.org/;
        }
    }

matsuu さん、どうもありがとうございました。


.. author:: default
.. categories:: Ops
.. tags:: Nginx
.. comments::
