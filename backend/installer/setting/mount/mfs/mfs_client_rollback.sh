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

function main()
{
	check_distro
	echo $OS
	echo $VER
	if  [ "$OS" = "Ubuntu" ];
	then
		if  [ "$VER" = "18.04" ];
		then
			echo "deb http://ppa.moosefs.com/3.0.111/apt/ubuntu/bionic/ bionic main" > /etc/apt/sources.list.d/moosefs.list
			apt update
			apt autoremove -y moosefs-client
			apt install -y moosefs-client
			apt-mark hold moosefs-client
			echo "deb http://ppa.moosefs.com/moosefs-3/apt/ubuntu/bionic bionic main" > /etc/apt/sources.list.d/moosefs.list
		elif  [ "$VER" = "16.04" ];
		then
			echo "deb http://ppa.moosefs.com/3.0.111/apt/ubuntu/xenial xenial main" > /etc/apt/sources.list.d/moosefs.list
			apt update
			apt autoremove -y moosefs-client
			apt install -y moosefs-client
			apt-mark hold moosefs-client
			echo "deb http://ppa.moosefs.com/moosefs-3/apt/ubuntu/xenial xenial main" > /etc/apt/sources.list.d/moosefs.list
		fi
		umount -l /jfbcore/jf-data/workspaces
		mfsmount -o nonempty -H mfsmaster -S workspaces /jfbcore/jf-data/workspaces
		apt update
	elif   [ "$OS" = "CentOS Linux" ]; then
		yum -y install wget
		if  [ "$VER" = "7" ];
		then
			wget http://ppa.moosefs.com/3.0.111/yum/el7/moosefs-client-3.0.111-1.rhsystemd.x86_64.rpm
		elif  [ "$VER" = "8" ];
		then
			wget http://ppa.moosefs.com/3.0.111/yum/el8/moosefs-client-3.0.111-1.rhsystemd.x86_64.rpm
		fi
		yum -y localinstall moosefs-client-3.0.111-1.rhsystemd.x86_64.rpm
		yum --exclude moosefs-client
	fi
}

main