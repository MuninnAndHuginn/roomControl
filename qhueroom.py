import sys
import configobj
import json
from qhue import Bridge, QhueException
from rgb_xy import Converter

ENCODING='utf-8'
conf = configobj.ConfigObj('huename.conf', raise_errors=True,
    file_error=True,           # don't create file if it doesn't exist
    encoding=ENCODING,         # used to read/write file
    default_encoding=ENCODING) # str -> unicode internally (useful on Python2.x)

try:
    QHUE_BRIDGE_IP=conf['bridgeip']
    QHUE_USERNAME=conf['username']
    QHUE_GROUPS=conf['groups']
except:
    print("Problem reading config, expected: 'bridgeip: <string>', 'username: <string>', 'groups: <string>[ <string>...]");
    sys.exit()

QHUE_BRIDGE=None
def HueBridge():
    """Get the HUE bridge object from qhue lib"""
    global QHUE_BRIDGE

    if not QHUE_BRIDGE:
        QHUE_BRIDGE = Bridge(QHUE_BRIDGE_IP, QHUE_USERNAME)

    return QHUE_BRIDGE

def getGroupById(groupid):
    """Get the specified group."""

    b = HueBridge()
    group = json.loads(json.dumps(b.groups(groupid)))

    # Add some manufactured data
    group['id'] = groupid
    group['action']['color'] = getGroupColor(group)

    return group

def LightGroups():
    """Identify the JSON data for the groups in the configuration."""
    global QHUE_GROUPS

    b = HueBridge()

    groups = json.loads(json.dumps(b.groups()))
#    for groupid in groups:
#        print("Found Group %s Data: %s" %(groupid, groups.get(groupid)))

    myGroups = []
    getAll = False
    
    if not QHUE_GROUPS:
        getAll = True
    
    for groupid in groups:
        if groups.get(groupid).get('name') in QHUE_GROUPS or getAll is True:
            group = getGroupById(groupid)
            myGroups.append(group)

    return myGroups

def getLightById(lightid):
    """Get the specified light."""
    b = HueBridge()
    light = json.loads(json.dumps(b.lights(lightid)))
    # Add some manufactured data
    light['id'] = lightid
    light['state']['color'] = getLightColor(light)

    return light 

def Lights():
    """Identify the JSON data for the lights in the configuration."""

    b = HueBridge()

    myLightIds = []
    myLights = []

    groups = LightGroups()

    for group in groups:
        for lightid in group.get('lights'):
#            print("Found Light %s in Group %s" % (lightid, group.get('id')))
            myLightIds.append(lightid)

    for lightid in myLightIds:
        light = getLightById(lightid)
        myLights.append(light)

    return myLights, groups

def getLightByName(name, lights=None):
    """Get the named light object from the given of lights (defaults to all lights)."""

    if not lights:
        lights, groups = Lights()

    for light in lights:
        if light.get('name') == name:
            return light

def getGroupByName(name, groups=None):
    """Get the named group object from the given of groups (defaults to all groups)."""

    if not groups:
        groups = LightGroups()

    for group in groups:
        if group.get('name') == name:
            return group
 
def updateLightState(light):
    """Grab the 'id' and 'state' and send the update.
    To prevent exceptions, strip 'colormode' and 'reachable'
    from the state."""

    badItems = ['colormode', 'reachable']

    b = HueBridge()
    state = light.get('state')
    for item in badItems:
        if item in state.keys():
            state.pop(item)

    light['state'] = state

    b.lights(light.get('id'), 'state', **(light.get('state')))

def updateGroupAction(group):
    """Grab the 'id' and 'action' and send the update.
    To prevent exceptions, strip 'colormode' from the action."""
    
    b = HueBridge()
    badItems = ['colormode', 'color']

    b = HueBridge()
    action = group.get('action')
    for item in badItems:
        if item in action.keys():
            action.pop(item)

    group['action'] = action

    b.groups(group.get('id'), 'action', **(group.get('action')))

def lightAction(light, params):
    """Update the state items identified in the light object and return it."""

    state = light['state']
    for key,value in params.items():
        state[key] = value
    light['state'] = state

    try:
        updateLightState(light)
    except QhueException as e:
        print("HUE error:\n{}".format(e))

    return getLightById(light['id'])

def groupAction(group, params):
    """Update the action items identified in the group object and return it."""

    action = group['action']
    for key,value in params.items():
        action[key] = value
    group['action'] = action

    try:
        updateGroupAction(group)
    except QhueException as e:
        print("HUE error:\n{}".format(e))
        
    return getGroupById(group['id'])

def getLightColor(light):
    """Use the rgb_xy.Converter to identify the current Hex color for the light."""

    c = Converter()

    return c.xy_to_hex(light['state']['xy'][0], light['state']['xy'][1], (int(light['state']['bri'])+1)/254)

def getGroupColor(group):
    """Use the rgb_xy.Converter to identify the current Hex color for the group."""

    c = Converter()

    return c.xy_to_hex(group['action']['xy'][0], group['action']['xy'][1], (int(group['action']['bri'])+1)/254)

def groupColorAction(group, hexColor):
    """Update the group color to match the hex value and send the update."""
    c = Converter()
    xy = c.hex_to_xy(hexColor)

    group['action'].pop('on')

    return (groupAction(group, {'xy':xy, 'transitiontime':10}))

def lightColorAction(light, hexColor):
    """Update the light color to match the hex value and send the update."""
    c = Converter()
    xy = c.hex_to_xy(hexColor)

    light['state'].pop('on')

    return (lightAction(light, {'xy':xy, 'transitiontime':10}))
