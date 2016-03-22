Appends platforms metadata
==========================

`Ansible 2.0がリリースされて <https://www.ansible.com/blog/ansible-2.0-launch>`_ 二ヶ月経ちました。その後からくらいから、私がメンテしているAnsible moduleがAnsible Galaxyにインポートできなくなっていました。解決したのでメモ。Ansible 2.0がリリースされたのと関係あるのかは知りません。

対応していなかった言い訳
------------------------

インポートできなくなって、対応していなかったのは、公開済みのモジュールについては ``ansible-galaxy install`` コマンドでインストールできたからです。

原因
----

platformsというメタデータが必須になったためでした。

ということで、 ``meta/main.yml`` の ``galaxy_info`` の下に ``platforms`` とその値を追加して終わり。platformsに使える値は、 ``ansible-galaxy init パッケージ名`` でrole scafolldingを生成し、その ``meta/main.yml`` を参考にすればよろし。


なぜplatforms を設定していなかったのか
--------------------------------------

他の人のモジュールを参考にして、roleを作成していたので知らなかった、というオチ。


.. author:: default
.. categories:: ansible
.. tags:: ansible,ansible galaxy
.. comments::
