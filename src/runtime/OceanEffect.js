export class OceanEffect {
  constructor(runtime,node){
    this.runtime=runtime;this.node=node;this.canvas=document.createElement("canvas");
    this.canvas.className="tq-webgl-ocean";this.canvas.dataset.forNode=node.id;this.canvas.setAttribute("aria-hidden","true");
    runtime.stage.append(this.canvas);this.gl=this.canvas.getContext("webgl",{alpha:true,premultipliedAlpha:false});
    if(this.gl)this.init();this.sync();this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop);
  }
  init(){
    const gl=this.gl,vs=`attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
    const fs=`precision mediump float;varying vec2 v;uniform sampler2D tex;uniform float t;uniform float strength;uniform float speed;uniform int count;uniform vec2 pts[32];
    bool inside(vec2 p){bool c=false;for(int i=0;i<32;i++){if(i>=count)break;int j=i==0?count-1:i-1;vec2 a=pts[i],b=pts[j];if(((a.y>p.y)!=(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y+.00001)+a.x))c=!c;}return c;}
    void main(){vec2 uv=vec2(v.x,1.0-v.y);if(!inside(uv))discard;float tt=t*speed;float w1=sin(uv.y*34.0+uv.x*8.0+tt*1.45);float w2=sin(uv.y*19.0-uv.x*13.0-tt*1.05);float w3=sin((uv.x+uv.y)*27.0+tt*.72);vec2 offset=vec2((w1*.0036+w3*.0019)*strength,(w2*.0024+w3*.0012)*strength);gl_FragColor=texture2D(tex,uv+offset);}`;
    const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s};
    this.program=gl.createProgram();gl.attachShader(this.program,sh(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);gl.useProgram(this.program);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(this.program,"p");gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    this.uploadTexture();
  }
  uploadTexture(){
    const gl=this.gl,item=this.runtime.nodes.get(this.node.id),img=item?.el;if(!gl||!img)return;
    const upload=()=>{try{gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);this.textureReady=true;}catch(e){console.warn("Ocean texture upload failed",e)}};
    if(img.complete&&img.naturalWidth)upload();else img.addEventListener("load",upload,{once:true});
  }
  sync(){
    const n=this.node,c=this.canvas,ox=this.runtime.sceneOffset?.x||0,oy=this.runtime.sceneOffset?.y||0,w=Math.max(1,n.width||1),h=Math.max(1,n.height||1);
    c.style.left=(n.x+ox)+"px";c.style.top=(n.y+oy)+"px";c.style.width=w+"px";c.style.height=h+"px";c.style.zIndex=(n.z??0)+1;
    c.style.transform=`rotate(${n.rotation||0}deg) skew(${n.skewX||0}deg,${n.skewY||0}deg) scale(${n.scaleX||1},${n.scaleY||1})`;
    const d=Math.min(2,devicePixelRatio||1),cw=Math.max(1,Math.round(w*d)),ch=Math.max(1,Math.round(h*d));if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;this.gl?.viewport(0,0,cw,ch);}
  }
  loop(ms){
    if(!this.canvas.isConnected)return;const gl=this.gl,n=this.node,area=n.composition?.area?.points||[];
    if(gl&&this.textureReady&&area.length>=3){gl.useProgram(this.program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(gl.getUniformLocation(this.program,"tex"),0);gl.uniform1f(gl.getUniformLocation(this.program,"t"),ms/1000);gl.uniform1f(gl.getUniformLocation(this.program,"strength"),n.composition?.effects?.ripple?.strength??.65);gl.uniform1f(gl.getUniformLocation(this.program,"speed"),n.composition?.effects?.ripple?.speed??.75);gl.uniform1i(gl.getUniformLocation(this.program,"count"),Math.min(32,area.length));const pts=new Float32Array(64);area.slice(0,32).forEach((p,i)=>{pts[i*2]=p.x;pts[i*2+1]=p.y});gl.uniform2fv(gl.getUniformLocation(this.program,"pts"),pts);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.BLEND);gl.drawArrays(gl.TRIANGLES,0,6);}
    else gl?.clear(gl.COLOR_BUFFER_BIT);this.raf=requestAnimationFrame(this.loop);
  }
  destroy(){cancelAnimationFrame(this.raf);if(this.gl&&this.texture)this.gl.deleteTexture(this.texture);this.canvas.remove();}
}
