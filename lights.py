import sys
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)

print len(sys.argv)
print sys.argv

if sys.argv[2] == 'ALL':
	if sys.argv[1] == '1':
		GPIO.setup(7,GPIO.OUT)
		GPIO.output(7,GPIO.HIGH)
		GPIO.setup(11,GPIO.OUT)
		GPIO.output(11,GPIO.HIGH)
		GPIO.setup(13,GPIO.OUT)
		GPIO.output(13,GPIO.HIGH)
		GPIO.setup(15,GPIO.OUT)
		GPIO.output(15,GPIO.HIGH)
	elif sys.argv[1] == '0':
		GPIO.setup(7,GPIO.OUT)
		GPIO.output(7,GPIO.LOW)
		GPIO.setup(11,GPIO.OUT)
		GPIO.output(11,GPIO.LOW)
		GPIO.setup(13,GPIO.OUT)
		GPIO.output(13,GPIO.LOW)
		GPIO.setup(15,GPIO.OUT)
		GPIO.output(15,GPIO.LOW)

else:
	GPIO.setup(int(sys.argv[2]),GPIO.OUT)
	if sys.argv[1] == '1':
		GPIO.output(int(sys.argv[2]),GPIO.HIGH)
	elif sys.argv[1] == '0':
		GPIO.output(int(sys.argv[2]),GPIO.LOW)
