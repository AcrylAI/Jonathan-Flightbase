# OS=$(./test.sh | sed -n 1p)
# VER=$(./test.sh | sed -n 2p)


# OS=$(hostnamectl | grep Operating | cut -d':' -f2-)
# OS="CentOS Linux 7 (Core)"
# OS="Ubuntu 18.04.5 LTS"
echo $OS
echo $VER

if [[ "$OS" == *"Ubuntu"* ]]
then
        echo Ubuntu
elif [[ "$OS" == *"CentOS"* ]]
then
        echo CentOS
fi
