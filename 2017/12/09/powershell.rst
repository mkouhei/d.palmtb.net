VirtualBoxをPowerShellで操作する
================================

これは `Debian/Ubuntu Advent Calendar 2017 <https://qiita.com/advent-calendar/2017/debian-ubuntu>`_ 12月9日の記事です。
前回( :doc:`/2017/09/16/thinkpad_t470s` )、この内容を書くといいつつ放置していたのと、今日のアドベントカレンダーがまだ空いていたので書いてみました。

DebianそのものはVirtualBoxで動かしているだけのゆるい記事です。

私は開発環境にはプライベートも職場もSidにしているのですが、VirtualBoxを使っていると、systemdやgrub、XOrg周りのバグで起動しなくなった場合にも、スナップショットから簡単に戻せます。


macOSでの起動とスナップショット取得
-----------------------------------

私物のラップトップをThinkPadに切り替える前はMacBookProを使っており、職場はMacBookProを使っています。Vagrantは使わない派なので、シェルスクリプトを作成しこれらをターミナルから実行して起動やスナップショットを取得しています。

起動用スクリプト
~~~~~~~~~~~~~~~~

.. code-block:: none

   #!/bin/sh -e
   vmname='vmname'
   VBoxManage showvminfo $vmname | grep State: | grep -q 'powered off' || ( echo "VM: $vmname is not powered off." ; exit 1 )
   VBoxManage startvm $vmname --type gui

すでに起動していたら同じイメージからもう一台VMを起動しないようにしています。
VirtualBoxでCPUやメモリリソースの半分以上を割り当てて、フルスクリーンで使っているので、  :code:`--type gui` で起動します。


スナップショット取得用スクリプト
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: sh

   #!/bin/sh -e
   vmname='VMname'
   VBoxManage showvminfo $vmname | grep State: | grep -q 'powered off' || ( echo "VM: $vmname is not powered off." ; exit 1 )
   VBoxManage snapshot $vmname take $(date +%Y%m%d-%H%M)
   if [ $(VBoxManage snapshot $vmname list | wc -l) -lt 4 ]; then
     exit 0
   fi
   VBoxManage snapshot $vmname delete $(VBoxManage snapshot $vmname list | head -1 | awk '{print $2}')

VirtualBoxでのスナップショット取得自体は、VMが起動していても可能ですが、取得までにえらい時間がかかるので、これも起動中は実行しないようにしています。
スナップショット名は、 :code:`YYYYmmdd-HHMM` のフォーマットの日時とし、最大三回取得するようにしています。
4つめ以上は、一番古いスナップショットを削除します。

Windows10での起動・スナップショット取得方法
-------------------------------------------

Windows10でもVagrantは使わず、PowerShellで行っています。
PowerShellのコマンドプロンプトからではなく、デスクトップ上にPowerShell実行用のショートカットを作成し、それをダブルクリックして実行してしていうことです。

起動用スクリプト
~~~~~~~~~~~~~~~~

.. code-block:: none

   $vmname = "vmname"
   
   function Show-VM-Info {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" showvminfo $vmname
   }
   
   function VM-Powered-off? {
       Show-VM-Info | Select-String State: | Select-String -quiet 'powered off'
   }
   
   function Start-VM {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm $vmname --type gui
   }
   
   function List-VM {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" list vms
   }
   
   function VM-Exist? {
       return (List-VM | Select-String -quiet $vmname)
   }
   
   if (-Not (VM-Exist?)) {
       echo "[error] '$vmname' is not exists."
       exit 1
   }
   
   if (VM-Powered-off?) {
       Start-VM
   } else {
       echo "VM: '$vmname' has been powered on."
       exit 1
   }

シェルスクリプト版に比べるとえらい長ったらしいですね。やっていることはシェルスクリプト版と同じです。

スナップショット取得用スクリプト
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

   $vmname = "vmname"
   
   function Show-VM-Info {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" showvminfo $vmname
   }
   
   function VM-Powered-off? {
       Show-VM-Info | Select-String State: | Select-String -quiet 'powered off'
   }
   
   function List-VM {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" list vms
   }
   
   function VM-Not-Exist? {
       return (List-VM | Select-String -quiet $vmname)
   }
   
   function Get-Timestamp {
       return (Get-Date -UFormat %Y%m%d-%H%M)
   }
   
   function Take-Snapshot {
       $timestamp = Get-Timestamp
       Start-Process "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" -ArgumentList "snapshot $vmname take $timestamp" -NoNewWindow -Wait
   }
   
   function List-Snapshot {
       & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" snapshot $vmname list
   }
   
   function Get-Oldest-Snapshot {
       return (-Split (List-Snapshot)[0])[1]
   }
   
   function Delete-Oldest-Snapshot {
       $oldest_name = Get-Oldest-Snapshot
       Start-Process "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" -ArgumentList "snapshot $vmname delete $oldest_name" -NoNewWindow -Wait
   }
   
   if (-Not (VM-Not-Exist?)) {
       echo "[error] '$vmname' is not exists."
       exit 1
   }
   
   if (VM-Powered-off?) {
       Take-Snapshot
       echo "[done] take snapshot."
       if ((List-Snapshot | Measure-Object).Count -lt 4) {
           exit 0
       }
       Delete-Oldest-Snapshot
       echo "[done] delete oldest snapshot."
       exit 0
   } else {
       echo "VM: '$vmname' has been powered on."
       exit 1
   }


スナップショット取得用は更に長くなってますが、これもシェルスクリプト版とやっていることは同じです。

実行用のショートカット
~~~~~~~~~~~~~~~~~~~~~~

PowerShellの拡張子は :code:`ps1` なので startvm.ps1, snapshot.ps1という名前で作成していますが、これを作成してもダブルクリックすると、メモ帳で開くだけです。なんて面倒なことでしょうね。

ということで、デスクトップにこれらのショートカットをまず作成します。

次にショートカットのプロパティを開き、リンク先をそれぞれ次のように書き換えます。 :code:`-File` で指定したパスが、実際のPowerShellのスクリプトファイルのパスです。

起動用スクリプトのショートカット

:code:`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy RemoteSigned -File C:\Users\someuser\OneDrive\ドキュメント\startvm.ps1`

スナップショット取得用スクリプトのショートカット

:code:`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy RemoteSigned -File C:\Users\mkouh\OneDrive\ドキュメント\snapshot.ps1`

これでデスクトップ上のショートカットをダブルクリックするだけで起動とスナップショットを取得できます。

まとめ
------

シェルスクリプトやPowerShellでVirtualBoxの起動やスナップショット取得はできますよ、というゆるいネタでした。

"unstable"という言葉のイメージだけでSidを使うのをためらっている人や、職場で利用するPCに自由にDebianをインストールできないにもVirtualBox等を使うことで自分の使いやすい環境を手に入れることができるので、今更なネタではありますが、まだの方は試してみると良いのではないでしょうか。

.. author:: default
.. categories:: virt.
.. tags:: Bash,PowerShell,VirtualBox,DebianUbuntuAdvent2017
.. comments::
