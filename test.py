#!flask/bin/python

from hueroom import *

lights, groups = Lights()

cg = getGroupByName('Corner Light', groups)
cl = getLightByName('Corner', lights)

#cg = groupAction(cg, {'on':False})
#cl = lightAction(cl, {'on':True})

print(getGroupColor(cg))
print(getLightColor(cl))

