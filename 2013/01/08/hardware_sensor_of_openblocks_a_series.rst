Hardware sensor of OpenBlockS A series
======================================

I could get CPU temparature with lm-sensors, and storage temparature with hddtemp.
I wrote blog post about hardware sensor at this entry.


CPU temparature
---------------

Firstly you should install "lm-sensors" package.

.. code-block:: bash

   $ sudo apt-get install lm-sensors

lm-sensors has sensors command and sensors-detect command. The former prints sensors information, the latter is enable to detect hardware monitoring chips. 

sensors command
~~~~~~~~~~~~~~~

This command is only enable to get CPU temparagure at OpenBlockS AX3. But it seems you can not get the correct values with the latest firmware (`kernel-image 3.0.6-8 <ftp://ftp.plathome.co.jp/pub/OBSAX3/squeeze/3.0.6-8/>`_)


kernel image 3.0.6-3
""""""""""""""""""""

.. code-block:: bash

   $ sensors
   axp-hwmon-isa-0000
   Adapter: ISA adapter
   T-junction:  +54.5°C  (low  = +10.0°C, high = +105.0°C)  sensor = thermal dioed

kernel iamge 3.0.6-8
""""""""""""""""""""

.. code-block:: bash

   $ sensors
   axp-hwmon-isa-0000
   Adapter: ISA adapter
   T-junction:   +0.1°C  (low  =  +0.0°C, high =  +0.1°C)  sensor = thermal diode


OpenBlockS A6 is disable to use sensors.

.. code-block:: bash

   $ sensors
   No sensors found!
   Make sure you loaded all the kernel drivers you need.
   Try sensors-detect to find out which these are.


sensors-detect command
~~~~~~~~~~~~~~~~~~~~~~

This command is disable to detect any monitoring chips of OpenBlockS A6 and AX3 kernel provided by Plat'Home. On the contrary kernel internal error is occured if you enter YES unconditionally in OpenBlockS AX3.

.. code-block:: bash
   
   $ sudo sensors-detect
   (snip)
   Some Super I/O chips contain embedded sensors. We have to write to
   standard I/O ports to probe them. This is usually safe.
   Do you want to scan for Super I/O sensors? (YES/no): 
   Probing for Super-I/O at 0x2e/0x2f
   
   Message from syslogd@obsax3 at Jan  8 00:33:13 ...
   kernel:Internal error: : 1028 [#2] SMP
   
   Message from syslogd@obsax3 at Jan  8 00:33:13 ...
   kernel:Process sensors-detect (pid: 1397, stack limit = 0xeb8882f0)
   kohei@obsax3:~$ 
   Message from syslogd@obsax3 at Jan  8 00:33:13 ...
   kernel:Stack: (0xeb889f20 to 0xeb88a000)
   
   Message from syslogd@obsax3 at Jan  8 00:33:13 ...
   kernel:9f20: 00000001 eb8f6f00 00205998 eb889f70 eb889f6c eb889f40 c00fafa8 c0268880
   (snip)

scanning occurs kernel internal error is following.

* Super I/O sensors
* IPMI interfaces
* ISA I/O ports

OpenBlockS A6 does not occures kernel internal error, but scanning mv64xxx_i2c adopter is not reacted (to stop with SIGINT).


Storage temparature
-------------------

You should install "hddtemp" package.

.. code-block:: bash

   $ sudo apt-get install hddtemp

debconf setting is like as following.

* SUID root: no
* interval of check temparature: 0
* daemon: yes
* listen IP address: 127.0.0.1
* port: 7634

hddtemp reads temparature with "S.M.A.R.T.". It is supported by the following storage;

* HalfSlim SSD 16GB MLC installed at OpenBlockS A6 product version and OpenBlockS AX3 rented
* MLC SSD 128GB(PH-128G/SSDMA/AX3) installed OpenBlockS AX3 purchased

HalfSlim SSD
~~~~~~~~~~~~

.. code-block:: bash

   $ sudo hddtemp /dev/sda
   /dev/sda: MRSAJ5A016GC118C00: 40 C


PH-128GB
~~~~~~~~

.. code-block:: bash

   $ sudo hddtemp /dev/sda
   /dev/sda: ADATA SP900: 27 C

You can do health check storage if you install "smartmontools" package and use smartctl command.

I2C
---
   
You should install i2c-tools package.

.. code-block:: bash

   $ sudo apt-get install i2c-tools


Execute "i2cdetect command" to detect I2C chips.

OpenBlockS AX3
~~~~~~~~~~~~~~

.. code-block:: bash

   $ sudo i2cdetect -l
   i2c-0   i2c             mv64xxx_i2c adapter                     I2C adapter
   i2c-1   i2c             mv64xxx_i2c adapter                     I2C adapter
   $ sudo i2cdetect -y 0
        0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
   00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
   10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   50: 50 -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   70: -- -- -- -- -- -- -- --                         
   $ sudo i2cdetect -y 1
        0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
   00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
   10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   30: UU UU UU UU UU UU UU UU -- -- -- -- -- -- -- -- 
   40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   70: -- -- -- -- -- -- -- --    

Execute sensors-detect of lm-sensors.

.. code-block:: bash

   $ sudo sensors-detect
   (snip)
   Lastly, we can probe the I2C/SMBus adapters for connected hardware
   monitoring devices. This is the most risky part, and while it works
   reasonably well on most systems, it has been reported to cause trouble
   on some systems.
   Do you want to probe the I2C/SMBus adapters now? (YES/no): yes
   Sorry, no supported PCI bus adapters found.

   Next adapter: mv64xxx_i2c adapter (i2c-0)
   Do you want to scan it? (YES/no/selectively):
   Client found at address 0x50
   Probing for `Analog Devices ADM1033'...                     No
   Probing for `Analog Devices ADM1034'...                     No
   Probing for `SPD EEPROM'...                                 No
   Probing for `EDID EEPROM'...                                No
   (snip)


OpenBlockS A6
~~~~~~~~~~~~~

"sudo i2cdetect -y 0" is very very slowly at OpenBlockS A6.

.. code-block:: bash

   $ sudo i2cdetect -l
   i2c-0   i2c             mv64xxx_i2c adapter                     I2C adapter
   $  sudo i2cdetect -y 0
        0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
   00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
   10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
   70: -- -- -- -- -- -- -- --
   

.. author:: default
.. categories:: gadget
.. tags:: OpenBlockS,Debian,lm-sensors,hddtemp,i2c-tools
.. comments::
