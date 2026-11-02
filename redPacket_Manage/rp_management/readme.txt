
1 如需修改rest_api所在地址端口,修改./src/config.json文件
  如需修改程序对外端口号,修改package.json文件,start命令
2 node 版本：v10.15.0
3 安装yarn,版本：v1.22.4：
  npm install -g yarn
  yarn --version

4 安装依赖包:yarn install
5 编译:yarn run build

6 修改端口号:
  如果修改package.json中start命令中端口号无效,则可修改：
  ./node_modules/react-scripts/scripts/start.js 中端口号

7 安装screen:
  sudo apt install screen

8 在程序所在目录下执行：
   screen -S rp_management
  相当于启动一个screen终端，此时查看:screen -ls，会看到类似如下：
     ubuntu@ip-10-251-1-87:~/redPacket_manage/rp_management$ screen -ls
     There is a screen on:
           7621.rp_management      (06/28/2020 03:25:20 AM)        (Attached)
     1 Socket in /run/screen/S-ubuntu.

9 启动程序：yarn start

10 退出screen 终端:
  按ctrl+A+D退出screen。

11 如果查看是否在运行:
   先查看screen终端是否存在:
       screen -ls
   再进入指定的终端：
       screen -r your_screen_terminal_name

