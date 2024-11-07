![Jonathan BI_시그니처_가로](https://github.com/user-attachments/assets/26ad0352-c1c7-4789-8e49-13814c1c49f8)
# Jonathan-Flightbase
Jonathan Flightbase is an MLOps/LLMOps platform designed for efficient AI development and operations. It streamlines resource management, model training, and deployment automation, with support for adaptive personality in intelligent agents.

### How to Run Codes
(ex)
* **Ubuntu 20.04**
  * Prerequisite
    * [openocd](http://openocd.org/): Fusing Tools
    * Chrome (85.0.4183.121_64bit version or higher)
  * URL access using Chrome.
    * www.acryl.ai

### License
Please refer [IoTware Project LSA](LICENSE.md).

### Acknowledgement
The authors thank the following contributors and projects.

* This work was supported by Institute of Information & communications Technology Planning & Evaluation (IITP) grant funded by the Korea government(MSIT) (2022-0-00043, Adaptive Personality for Intelligent Agents).


---
### Install Jonathan-Flightbase Backend
1. Setting Backend Directory   
mv /Jonathan-flightbase/backend /jfbcore

2. Set Config   
/jfbcore/installer/init.sh   
vi /etc/jfb/setting.conf

  ```
  INSTALL_TYPE: MASTER  
  MASTER_IP: App, Kubernetes Master Server  
  MASTER_NAME: Master Server Host Name  
  MASTER_JFBCORE_ORIGIN_PATH: /jfbcore   
  JFB_IMAGES_PATH: /JF-Docker   
  ```

3. Install packege
/jfbcore/installer/package/run.sh

4. Run script (Jonathan-App)
/jfbcore/installer/setting/all_init.sh


### Install Jonathan-Flightbase Frontend

1. Setting frontend Directory     
mv /Jonathan-flightbase/frontend /jonathan-platform-fromt  

2. Run script
cd /jonathan-platform-front/install/flight-base   
python3 jf_installer_front.py --master_ip MASTER_IP --enc_key [enc_key] --iv [iv]  

   ```
   enc_key: acryldistribute@acryldistribute@
   iv: acryldistribute@
   ```
