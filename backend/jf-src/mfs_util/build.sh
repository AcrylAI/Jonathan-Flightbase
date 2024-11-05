#! /bin/bash

function check_distro()
{
	if [ -f /etc/os-release ];
	then
		. /etc/os-release
		OS=$NAME
		VER=$VERSION_ID
	elif type lsb_release >/dev/null 2>&1;
	then
		OS=$(lsb_release -si)
		VER=$(lsb_release -sr)
	else
		OS=$(uname -s)
		VER=$(uname -r)
	fi
}

function check_python_ver()
{
  py_ver=$(python3 -V 2>&1 | sed 's/.* \([0-9]\).\([0-9]\).*/\1\2/')
	echo "$py_ver"
	if [ "$py_ver" -lt "35" ]; then
		echo "This script needs Python 3.5 or greater"
		exit 1
	fi
}

function install_packages_ubuntu()
{
	apt update
	apt -y install python3-pip nuitka patchelf
	pip3 install nuitka
}

function install_packages_cent()
{
	yum -y install epel-release centos-release-scl
	yum -y install devtoolset-8-gcc devtoolset-8-gcc-c++ python3
	check_python_ver
	yum install -y python3-devel patchelf
	scl enable devtoolset-8 -- bash
	pip3 install nuitka
}

function install_packages_darwin()
{
	if ! hash brew ; then
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	fi
	if ! hash cc ; then
		brew install make
	fi
	python3.9 -m pip install nuitka
}
function compile_mfsutil()
{
	check_distro
	if  [ "$OS" = "Ubuntu" ];
	then
		install_packages_ubuntu
	elif   [ "$OS" = "CentOS Linux" ]; then
		install_packages_cent
	elif   [ "$OS" = "Darwin" ]; then
	  install_packages_darwin
	  python3.9 -m nuitka --standalone mfs_util.py
	  exit 1
	fi
	python3 -m nuitka --standalone mfs_util.py
	rm -rf mfs_util.build
}

function move_mfsutil()
{
  mv mfs_util.dist/mfs_util /jfbcore/jf-bin/mfs_bin/mfs_util
  chmod 755 /jfbcore/jf-bin/mfs_bin/mfs_util
}

function main()
{
  if [ "$1" = "" ]; then
    echo "Parameters needed. do mfs_util -h for a list of options"
    exit 1
  elif [ "$1" = "-c" ]; then
    echo "Compile"
    compile_mfsutil
  elif [ "$1" = "-mv-jfb" ]; then
    echo "Compile then move the binary to /jfbcore"
    move_mfsutil
    compile_mfsutil
  elif [ "$1" = "-h" ]; then
    echo "-mv-jfb: move the compiled binary to /jfbcore/jf-bin/mfs_bin"
    echo "-c: compile and save the compiled binary at mfs_util.build"
    echo "-h: list parameter options"
    exit 1
  else
    echo "Invalid Parameters"
  fi
}

main $1 $2