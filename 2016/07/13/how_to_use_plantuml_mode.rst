How to use plantuml-mode
========================

PlantUMLを使うことになったので、EmacsでPlantUMLを使うための設定をしたのでそのメモ。

パッケージインストール
----------------------

.. code-block:: bash

   $ sudo apt-get install plantuml

plantuml-modeの設定
-------------------

まずは ``git clone``

.. code-block:: bash

   $ cd .emacs.d/vendor
   $ git clone https://github.com/zwz/plantuml-mode.git

.emacsに下記を追記

.. code-block:: elisp

   (setq plantuml-jar-path "/usr/share/plantuml/plantuml.jar")
   (load-file "~/.emacs.d/vendor/plantuml-mode/plantuml-mode.el")

以上。
   
.. author:: default
.. categories:: emacs
.. tags:: emacs,PlantUML,plantuml-mode
.. comments::
