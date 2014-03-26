How to encrypt ansible-vault in the TLS certificate
===================================================

先週、Sidのansibleパッケージが1.4.5+dfsg-1から1.5.3+dfsg-1に上がったので、待望のansible-vaultを使ってみました。パスワードなどを暗号化するために使うのが主でしょうが、今回の私の目的は、TLS証明書を及びその秘密鍵の暗号化です。仕事で使っているplaybookに、PEM形式の証明書や秘密鍵を含めるのがいやだったのが動機です。


IMAPサーバ用のplaybookを例にします。

.. code-block:: sh

    .
    |-- development
    |-- group_vars
    |   |-- all
    |   |-- development
    |   `-- production
    |-- imapd.yml
    |-- production
    |-- roles
    (snip)
    |   |-- dovecot
    |   |   |-- handlers
    |   |   |   `-- main.yml
    |   |   |-- tasks
    |   |   |   `-- main.yml
    |   |   |-- templates
    (snip)
    |   |   |   |-- 10-ssl.conf.j2
	(snip)
    |   |   |   |-- key.j2
    |   |   |   `-- cert.j2
    |   |   `-- vars
    |   |       `-- main.yml
    (snip)
    `-- site.yml

ansible-vaultで暗号化する対象は、roles/dovecot/templatesディレクトリの下にある、key.j2とcert.j2の2つのテンプレートの中に出力する文字列です。
証明書とprivate keyを配布するだけなら、filesディレクトリの下に、証明書およびprivate keyファイル自体を配置し、copyモジュールでコピーすれば良いだけです。
しかし、 `ドキュメントにもあるとおり <http://docs.ansible.com/playbooks_vault.html#id5>`_ ansible-vaultで対象に暗号化の対象にできるのは各種の変数だけなので、filesディレクトリ下の添付ファイルは復号できません。そこで、templateモジュールを使う必要があります。暗号化する文字列自体は、roles/dovecot/vars/main.ymlの中に記述します。

PEM形式の文字列は、

.. code-block:: text

   -----BEGIN CERTIFICATE-----
   MIIFtTCCA52gAwIBAgIIYY3HhjsBggUwDQYJKoZIhvcNAQEFBQAwRDEWMBQGA1UE
   AwwNQUNFRElDT00gUm9vdDEMMAoGA1UECwwDUEtJMQ8wDQYDVQQKDAZFRElDT00x
   CzAJBgNVBAYTAkVTMB4XDTA4MDQxODE2MjQyMloXDTI4MDQxMzE2MjQyMlowRDEW
   (snip)
   -----END CERTIFICATE-----


のような形式になっているので、これをtemplateモジュールを使って、ファイルを配置するには、templates/cert.j2などのテンプレートに、

.. code-block:: text

   {{ cert_pem }}

とだけ記述し、vars/main.ymlには、

.. code-block:: yaml

   ---
   - cert_pem: "-----BEGIN CERTIFICATE-----\nMIIFtTCCA52gAwIBAgIIYY3HhjsBggUwDQYJKoZIhvcNAQEFBQAwRDEWMBQGA1UE\nAwwNQUNFRElDT00gUm9vdDEMMAoGA1UECwwDUEtJMQ8wDQYDVQQKDAZFRElDT00x\nCzAJBgNVBAYTAkVTMB4XDTA4MDQxODE2MjQyMloXDTI4MDQxMzE2MjQyMlowRDEW\n...(snip)...\n-----END CERTIFICATE-----"
   - key_pem: "..."

のように、改行を"\n"に変更して一行の文字列とし、それをダブルクォートかシングルクォートで括って指定します。
これで動作確認ができたら、vars/main.ymlを暗号化します。

.. code-block:: sh

   $ ansible-vault encrypt roles/dovecot/vars/main.yml


暗号化されたファイルは下記のようになります。

.. code-block:: text

   $ANSIBLE_VAULT;1.1;AES256
   39613864343833373066386636333338653831383630623938643138366230323336656234326234
   3833663562396237393333363665643631653331386566660a653530326636666137633731373361
   34653163626664376432393433303435333433303535626437623935313962626430643038623464
   (snip)


暗号化された変数を使って、playbookを実行するには、 ``--ask-vault-pass`` オプションをつけてansible-playbookコマンドを実行すれば良いだけです。
このオプションをつけると、実行時にだけメモリ上に復号されます。


まとめ
------

今まで、パスワードなどはvars_promptで都度入力し、TLS証明書＆秘密鍵などは別途配布する、という方法でやっていました。
これでplaybook自体にansible-vaultで暗号化して管理できるので、vautl passwordのみ、keepassなどで管理すれば良さそうです。

.. author:: default
.. categories:: ansible
.. tags:: Debian,ansible
.. comments::
