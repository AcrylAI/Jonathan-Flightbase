#!/usr/bin/env python3
import subprocess
import argparse
import json
import glob
import time
import re
import os

divide_by = 1 << 10
divide_by_bit = 1 << 20
term_size = os.get_terminal_size()[0]
cwd = os.getcwd()

parser = argparse.ArgumentParser(description='Test disk speed using fio and dd')
parser.add_argument('--size', '-s', type=str, default="1G",
					help='File size')
parser.add_argument('--number', '-n', type=str, default="1",
					help='# of files')
args = parser.parse_args()

size = args.size
number = args.number
			
def command_exists(command_to_check):
	output = subprocess.call('command -v "' + command_to_check + '" > /dev/null 2>&1', shell=True)
	if output == 0:
		return True
	else:
		return False

def check_distro():
	output = subprocess.check_output('''
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
	echo $OS $VER''', shell=True).decode("utf-8").split()
	return output

def install_tools():
	distro_ver = check_distro()
	if distro_ver[0] == "Ubuntu":
		os.system('apt -y install fio')
	elif distro_ver[0] == "CentOS Linux":
		os.system('yum -y install fio')

def formatted_print(str1,str2):
	toPrint = "{:<15} {:<15}".format(str1,str2)
	print(toPrint)
	print('─' * len(toPrint))

def print_line():
	print("")
	print('―' * term_size)
		
def random_test():
	print_line()
	print('Read-WithBuffer-Rand')
	BUF_RR= json.loads(subprocess.check_output('fio --name=rand_read_withbuf --end_fsync=1 --ioengine=libaio --iodepth=1 --fallocate=none --rw=randread --bs=64k --direct=0 --size=' + size +' --numjobs=8 --nrfiles=' + number +' --runtime=1440 --group_reporting --output-format=json', shell=True).decode("utf-8"))
	try:
		str(BUF_RR["jobs"][0]["read"]['lat_ns'])
		divide_by_total = divide_by_bit		
	except:
		divide_by_total = divide_by
	formatted_print('Key','Result')
	formatted_print('Read total(MB)',str(BUF_RR["jobs"][0]["read"]['io_bytes']/divide_by_total))
	formatted_print('Runtime',str(BUF_RR["jobs"][0]["read"]['runtime']/1000))
	formatted_print("IOPS" ,str(BUF_RR["jobs"][0]["read"]['iops']))
	formatted_print("Speed(MiB/s)" , str(BUF_RR["jobs"][0]["read"]['bw']/divide_by))
	print_line()
	print('Write-WithBuffer-Rand')
	BUF_WR= json.loads(subprocess.check_output('fio --name=rand_write_withbuf --end_fsync=1 --ioengine=libaio --iodepth=1 --fallocate=none --rw=randwrite --bs=64k --direct=0 --size=' + size +' --numjobs=8 --nrfiles=' + number +' --runtime=1440 --group_reporting --output-format=json', shell=True).decode("utf-8"))
	formatted_print('Key','Result')
	formatted_print("Write total(MB)" , str(BUF_WR["jobs"][0]["write"]['io_bytes']/divide_by_total))
	formatted_print("Runtime" , str(BUF_WR["jobs"][0]["write"]['runtime']/1000))
	formatted_print("IOPS" , str(BUF_WR["jobs"][0]["write"]['iops']))
	formatted_print("Speed(MiB/s)" , str(BUF_WR["jobs"][0]["write"]['bw']/divide_by))
	print_line()
	print('Read-WithoutBuffer-Rand')
	NB_RR=json.loads(subprocess.check_output('fio --name=rand_fread_withoutbuf --end_fsync=1 --ioengine=libaio --fallocate=none --iodepth=1 --rw=randread --bs=64k --direct=1 --size=' + size +' --numjobs=8 --nrfiles=' + number +' --runtime=1440 --group_reporting --output-format=json', shell=True).decode("utf-8"))
	formatted_print('Key','Result')
	formatted_print("Read total(MB)" , str(NB_RR["jobs"][0]["read"]['io_bytes']/divide_by_total))
	formatted_print("Runtime" , str(NB_RR["jobs"][0]["read"]['runtime']/1000))
	formatted_print("IOPS" , str(NB_RR["jobs"][0]["read"]['iops']))
	formatted_print("Speed(MiB/s)" , str(NB_RR["jobs"][0]["read"]['bw']/divide_by))
	print_line()
	print('Write-WithoutBuffer-Rand')
	NB_RW=json.loads(subprocess.check_output('fio --name=rand_write_withoutbuf --end_fsync=1 --ioengine=libaio --fallocate=none --iodepth=1 --rw=randwrite --bs=64k --direct=1 --size=' + size +' --numjobs=8 --nrfiles=' + number +' --runtime=1440 --group_reporting --output-format=json', shell=True).decode("utf-8"))
	formatted_print('Key','Result')
	formatted_print("Write total(MB)" , str(NB_RW["jobs"][0]["write"]['io_bytes']/divide_by_total))
	formatted_print("Runtime" , str(NB_RW["jobs"][0]["write"]['runtime']/1000))
	formatted_print("IOPS" , str(NB_RW["jobs"][0]["write"]['iops']))
	formatted_print("Speed(MiB/s)" , str(NB_RW["jobs"][0]["write"]['bw']/divide_by))
	print_line()
	
def seq_test():
	print_line()
	try:
		split_str = re.split('(\d+)',size)
		val = int(split_str[1])
		prefix = split_str[2]
		if prefix == 'G':
			count = val * 1024
		elif prefix == 'M':
			count = val
	except:
		print("Invalid input")
		exit()
	dd_wrt1 = subprocess.check_output('dd if=/dev/zero of=' + cwd + '/seq_test bs=1M count='+ str(round(count)) + ' conv=fdatasync', shell=True, stderr=subprocess.STDOUT).decode("utf-8").split()
	dd_wrt2 = subprocess.check_output('dd if=/dev/zero of=' + cwd + '/seq_test bs=1M count='+ str(round(count)) + ' conv=fdatasync', shell=True, stderr=subprocess.STDOUT).decode("utf-8").split()
	dd_wrt3 = subprocess.check_output('dd if=/dev/zero of=' + cwd + '/seq_test bs=1M count='+ str(round(count)) + ' conv=fdatasync', shell=True, stderr=subprocess.STDOUT).decode("utf-8").split()
	dd_wrt4 = subprocess.check_output('dd if=/dev/zero of=' + cwd + '/seq_test bs=1M count='+ str(round(count)) + ' conv=fdatasync', shell=True, stderr=subprocess.STDOUT).decode("utf-8").split()
	dd_wrt5 = subprocess.check_output('dd if=/dev/zero of=' + cwd + '/seq_test bs=1M count='+ str(round(count)) + ' conv=fdatasync', shell=True, stderr=subprocess.STDOUT).decode("utf-8").split()
	sec = (float(dd_wrt1[13]) + float(dd_wrt2[13]) + float(dd_wrt3[13]) + float(dd_wrt4[13]) + float(dd_wrt5[13]))
	copied = str(float(dd_wrt1[10]) + float(dd_wrt2[10]) + float(dd_wrt3[10]) + float(dd_wrt4[10]) + float(dd_wrt5[10])) + " " + dd_wrt1[11][:-1]
	bw = str((float(dd_wrt1[15]) + float(dd_wrt2[15]) + float(dd_wrt3[15]) + float(dd_wrt4[15]) + float(dd_wrt5[15])) / 5) + " " + "MB/s"
	print(copied + " copied in " + str(sec) + " seconds")
	print("")
	formatted_print('Key','Result')
	formatted_print("Duration(Avg)", str(sec/5) + " seconds")
	formatted_print("Bandwidth(Avg)", bw)
	print_line()
	
def main():
	print("Testing at " + cwd)
	if command_exists('fio'):
		print("fio is installed")
	else:
		print("installing fio")
		install_tools()
	print('dd: sequential write speed')
	seq_test()
	print('fio: random read/write speed')
	random_test()
	print('Deleting temp files')
	total_size = os.path.getsize(cwd + '/seq_test')
	for fn in glob.glob(cwd+"/rand_*"):
		total_size = total_size + os.path.getsize(fn)
	start_time = time.time()
	os.remove(cwd + '/seq_test')
	for fn in glob.glob(cwd+"/rand_*"):
		os.remove(fn) 
	end_time = time.time()
	print('It took about ' + str((end_time-start_time)*100) + 'ms to delete ' + str(total_size/divide_by_bit) + 'MB')
	
		
main()
	
