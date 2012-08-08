#Copyright Jon Berg , turtlemeat.com

import string,cgi,time
import re
from os import curdir, sep
import os
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import shutil
import tempfile
import subprocess

from pprint import pprint

blocklydir = "%s/blockly" % curdir 

mimes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.wav': 'audio/vnd.wave',
    '.cur': 'image/vnd.microsoft.icon',
    '.png': 'image/png',
    '.ico': 'image/vnd.microsoft.icon'
}


file_to_copy = ['build.sh', 'pins_arduino.c', 'pins_arduino.h', 'servo.c', 'servo.h', 'servo_asm.S', 'wiring.h', 'wiring_digital.c', 'avr-thread.h', 'libavr-thread.a']

avrpath = "%s/avr/code/" % curdir 

dst = tempfile.mkdtemp('', 'blockly-avr-')

sketchbookdir = os.path.expanduser('~/blockly-sketchbook')
try:
    os.mkdir(sketchbookdir)
except OSError:
    pass

def build_file_list():
    global sketchbookdir
    list = '';
    dirList=os.listdir(sketchbookdir)
    for fname in dirList:
        list = list + '<li><a href="#" onclick="do_action(\'%s\'); return false;">%s</a></li>\n' % (fname, fname)
    return list

class MyHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            if self.path == '/load_form':
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                file_list = build_file_list()


                input = open("load_form")
                for s in input.xreadlines():
                    self.wfile.write(s.replace('@@@', file_list))
                input.close()
                return
            if self.path == '/save_form':
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                file_list = build_file_list()


                input = open("save_form")
                for s in input.xreadlines():
                    self.wfile.write(s.replace('@@@', file_list))
                input.close()
                return
            if self.path == '/':
                self.send_response(301)
                self.send_header("Location", '/demos/code/index.html')
                self.end_headers()
                return
            filell,ext = os.path.splitext(self.path)
            mime = mimes[ext]

            f = open(blocklydir + sep + self.path) #self.path has /test.html
#note that this potentially makes every file on your computer readable by the internet

            self.send_response(200)
            self.send_header('Content-type', mime)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
            return

                
        except IOError, KeyError:
            self.send_error(404,'File Not Found: %s' % self.path)
    
    def upload(self, code):
        for file in file_to_copy:
            shutil.copyfile("%s/%s" % (avrpath, file), "%s/%s" % (dst, file))

        input = open("%s/main_program.cpp" % (avrpath))
        output = open("%s/main_program.cpp" % (dst), 'w')
        for s in input.xreadlines():
            output.write(s.replace('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', code))
        output.close()

        return subprocess.check_output("bash %s/build.sh 2>&1; exit 0" % dst, shell=True)



    def do_POST(self):
        if self.path == '/upload':
            ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
            if ctype == 'application/x-www-form-urlencoded':
                length = int(self.headers.getheader('content-length'))
                postvars = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
                code = postvars['code'][0]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(self.upload(code))
        if self.path == '/save':
            self.send_response(200)
            self.end_headers()
            ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
            if ctype == 'application/x-www-form-urlencoded':
                length = int(self.headers.getheader('content-length'))
                postvars = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
                name = postvars['name'][0]
                is_new = postvars['isNew'][0]
                code = postvars['code'][0]

                output = open("%s/%s" % (sketchbookdir, name), 'w')
                output.write(code)
                output.close()
                self.wfile.write("File %s is saved" % name)
        if self.path == '/load':
            self.send_response(200)
            self.end_headers()
            ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
            if ctype == 'application/x-www-form-urlencoded':
                length = int(self.headers.getheader('content-length'))
                postvars = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
                name = postvars['name'][0]
                input = open("%s/%s" % (sketchbookdir, name))
                self.wfile.write(input.read())
                input.close()

def main():
    try:
        server = HTTPServer(('', 8000), MyHandler)
        print 'started httpserver...'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()
