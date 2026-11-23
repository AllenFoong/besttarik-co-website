import sys, time, numpy as np, torch
from PIL import Image
from spandrel import ModelLoader
torch.set_num_threads(2)
model = ModelLoader().load_from_file('weights/RealESRGAN_x4plus.pth').model.eval()
for k in sys.argv[1:]:
    crop=Image.open(f"photos/crop/{k}.png").convert("RGB")
    x=torch.from_numpy(np.asarray(crop).astype(np.float32)/255).permute(2,0,1)[None]
    t=time.time(); T=192; P=12; _,_,h,w=x.shape; out=torch.zeros(1,3,h*4,w*4)
    with torch.no_grad():
        for y0 in range(0,h,T):
            for x0 in range(0,w,T):
                ya,xa=max(0,y0-P),max(0,x0-P); yb,xb=min(h,y0+T+P),min(w,x0+T+P)
                o=model(x[:,:,ya:yb,xa:xb])
                oy,ox=(y0-ya)*4,(x0-xa)*4; th,tw=min(T,h-y0)*4,min(T,w-x0)*4
                out[:,:,y0*4:y0*4+th,x0*4:x0*4+tw]=o[:,:,oy:oy+th,ox:ox+tw]
    up=Image.fromarray((out[0].permute(1,2,0).clamp(0,1).numpy()*255).round().astype(np.uint8))
    # blend 15% of a plain Lanczos upscale back in to keep natural texture
    lz=crop.resize(up.size,Image.LANCZOS)
    up=Image.blend(up,lz,0.15)
    up.save(f"photos/4k/{k}.jpg",quality=92)
    print(k,crop.size,"->",up.size,round(time.time()-t),"s",flush=True)
