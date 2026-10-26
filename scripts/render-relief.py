# Renders the theatre's terrain in Blender as true 3D shaded relief, top-down and orthographic,
# so the image lands on the same Web Mercator pixel grid as the heightmap it came from.
#
#   /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/render-relief.py -- [width] [samples]
#
# Inputs (from scripts/build-relief.mjs): scripts/.cache/{height.png,tint.png,relief.json}
# Output: scripts/.cache/relief-blender.png  → then: node scripts/slice-tiles.mjs scripts/.cache/relief-blender.png
import bpy, json, math, os, sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT_W = int(argv[0]) if len(argv) > 0 else 6000
SAMPLES = int(argv[1]) if len(argv) > 1 else 24
EXAGGERATION = 2.4  # vertical; more turns the Zagros into teeth
GRID = int(os.environ.get("GRID", "1800"))  # mesh vertices across; the bump map carries finer detail

here = os.path.dirname(os.path.abspath(__file__))
cache = os.path.join(here, ".cache")
meta = json.load(open(os.path.join(cache, "relief.json")))
W, H = meta["width"], meta["height"]
south, north = meta["bounds"][1], meta["bounds"][3]
mid_lat = math.radians((south + north) / 2)
# metres per heightmap pixel at the theatre's mid latitude
px_m = 40075016.686 / (256 * 2 ** meta["z"]) * math.cos(mid_lat)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ── terrain mesh ────────────────────────────────────────────────────────────
ny = round(GRID * H / W)
bpy.ops.mesh.primitive_grid_add(x_subdivisions=GRID, y_subdivisions=ny, size=1)
terrain = bpy.context.active_object
terrain.scale = (W, H, 1)
bpy.ops.object.transform_apply(scale=True)

height_img = bpy.data.images.load(os.path.join(cache, "height.png"))
height_img.colorspace_settings.name = "Non-Color"
tex = bpy.data.textures.new("height", type="IMAGE")
tex.image = height_img
tex.extension = "EXTEND"
disp = terrain.modifiers.new("displace", "DISPLACE")
disp.texture = tex
disp.texture_coords = "UV"
disp.mid_level = 1000 / 65535  # sea level (heights are stored as metres + 1000)
disp.strength = 65535 / px_m * EXAGGERATION
bpy.ops.object.shade_smooth()

mat = bpy.data.materials.new("terrain")
mat.use_nodes = True
nt = mat.node_tree
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 1.0
bsdf.inputs["Specular IOR Level"].default_value = 0.0
tint = nt.nodes.new("ShaderNodeTexImage")
tint.image = bpy.data.images.load(os.path.join(cache, "tint.png"))
nt.links.new(tint.outputs["Color"], bsdf.inputs["Base Color"])
# fine detail the grid can't hold: bump from the same heightmap
hnode = nt.nodes.new("ShaderNodeTexImage")
hnode.image = height_img
hnode.interpolation = "Cubic"
bump = nt.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = float(os.environ.get("BUMP", "0.35"))
bump.inputs["Distance"].default_value = 65535 / px_m * EXAGGERATION
nt.links.new(hnode.outputs["Color"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
terrain.data.materials.append(mat)

# ── light: soft key from the north-west (cartographic convention), dim fill, sky ─
target = bpy.data.objects.new("light-target", None)
scene.collection.objects.link(target)

def sun(name, azimuth, elevation, strength, angle):
    """azimuth in degrees clockwise from north (+Y), elevation above the horizon"""
    s = bpy.data.lights.new(name, "SUN")
    s.energy = strength
    s.angle = math.radians(angle)
    o = bpy.data.objects.new(name, s)
    scene.collection.objects.link(o)
    az, el = math.radians(azimuth), math.radians(elevation)
    o.location = (math.sin(az) * math.cos(el) * 1e4, math.cos(az) * math.cos(el) * 1e4, math.sin(el) * 1e4)
    c = o.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    return o

sun("key", 315, 33, 3.1, 6)
sun("fill", 135, 28, 0.3, 25)
world = bpy.data.worlds.new("sky")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.86, 0.88, 0.92, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.34
scene.world = world

# ── camera: orthographic, exactly framing the heightmap ─────────────────────
cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.sensor_fit = "VERTICAL" if H >= W else "HORIZONTAL"
cam_data.ortho_scale = max(W, H)
cam_data.clip_end = 1e6
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (0, 0, 50000)
scene.collection.objects.link(cam)
scene.camera = cam

r = scene.render
r.resolution_x = OUT_W
r.resolution_y = round(OUT_W * H / W)
r.resolution_percentage = 100
r.image_settings.file_format = "PNG"
r.image_settings.color_mode = "RGB"
r.filepath = os.path.join(cache, "relief-blender.png")
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"

scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL"
prefs.get_devices()
for d in prefs.devices:
    d.use = True
scene.cycles.device = "GPU"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 3
# render in tiles: full-frame buffers at 6000 px push a 16 GB machine into swap
scene.cycles.use_auto_tile = True
scene.cycles.tile_size = 1024

print(f"rendering {r.resolution_x}x{r.resolution_y}, grid {GRID}x{ny}, strength {disp.strength:.0f}")
bpy.ops.render.render(write_still=True)
print("wrote", r.filepath)
