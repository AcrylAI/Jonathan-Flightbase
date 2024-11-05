#!/usr/bin/python

def add_sudoer():
    string_to_add = '''launcher  ALL=(ALL) NOPASSWD: ALL'''
    with open('/etc/sudoers', 'r+') as sudoer_file:
        if 'launcher' in sudoer_file.read():
            print("launcher is already included in the sudoers file")
            return None
        sudoer_file.write(string_to_add)

def main():
    add_sudoer()

main()
