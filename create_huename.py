#!flask/bin/python
import argparse
import configobj
from qhue import create_new_username

parser = argparse.ArgumentParser(description='Create a new Philips HUE User Login and create/update ./huename.conf for use in the application.')
parser.add_argument('hueip', metavar='IP', type=str, help='The HUE Bridge IP Address.')
args = parser.parse_args()

ip=args.hueip
username = create_new_username(ip)

print("You have successfully created new user %s on HUE Bridge @ %s" %(username, ip))

conf = configobj.ConfigObj('huename.conf', raise_errors=True,
    file_error=False,
    encoding='utf-8',
    default_encoding='utf-8')

conf.update(dict(bridgeip=ip, username=username))
conf.write()

