all:
	python3 sudoer.py
	g++ main.cpp -std=c++11 -o launcher -D'BASE_PATH="/jfbcore/jf-bin/launcher_bins"'
install:
	mv -f launcher /jfbcore/jf-bin/launcher
clean:
	rm -f launcher