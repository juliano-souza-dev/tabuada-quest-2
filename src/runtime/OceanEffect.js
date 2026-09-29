export class OceanEffect {
  constructor(runtime,node){
    this.runtime=runtime;this.node=node;this.canvas=document.createElement("canvas");
    this.canvas.className="tq-webgl-ocean";this.canvas.dataset.forNode=node.id;this.canvas.setAttribute("aria-hidden","true");
    runtime.stage.append(this.canvas);this.gl=this.canvas.getContext("webgl",{alpha:true,premultipliedAlpha:false});
    if(this.gl)this.init();this.sync();this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop);
  }
  init(){
    const gl=this.gl,vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs=`precision mediump float;uniform vec2 r;uniform float t;uniform float strength;uniform int count;uniform vec2 pts[32];
    bool inside(vec2 p){bool c=false;for(int i=0;i<32;i++){if(i>=count)break;int j=i==0?count-1:i-1;vec2 a=pts[i],b=pts[j];if(((a.y>p.y)!=(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y+.00001)+a.x))c=!c;}return c;}
    void main(){vec2 uv=gl_FragCoord.xy/r;if(!inside(uv))discard;float w=sin((uv.x*18.0+uv.y*10.0)+t*2.2)*.5+.5;float a=(.025+w*.10)*strength;gl_FragColor=vec4(.45,.85,1.,a);}`;
    const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s};
    this.program=gl.createProgram();gl.attachShader(this.program,sh(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);gl.useProgram(this.program);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(this.program,"p");gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
  }
  sync(){
    const n=this.node,c=this.canvas,ox=this.runtime.sceneOffset?.x||0,oy=this.runtime.sceneOffset?.y||0,w=Math.max(1,n.width||1),h=Math.max(1,n.height||1);
    c.style.left=(n.x+ox)+"px";c.style.top=(n.y+oy)+"px";c.style.width=w+"px";c.style.height=h+"px";c.style.zIndex=(n.z??0)+1;
    c.style.transform=`rotate(${n.rotation||0}deg) skew(${n.skewX||0}deg,${n.skewY||0}deg) scale(${n.scaleX||1},${n.scaleY||1})`;
    const d=Math.min(2,devicePixelRatio||1);c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d));this.gl?.viewport(0,0,c.width,c.height);
  }
  loop(ms){
    if(!this.canvas.isConnected)return;const gl=this.gl,n=this.node,area=n.composition?.area?.points||[];
    if(gl&&area.length>=3){gl.useProgram(this.program);gl.uniform2f(gl.getUniformLocation(this.program,"r"),this.canvas.width,this.canvas.height);gl.uniform1f(gl.getUniformLocation(this.program,"t"),ms/1000);gl.uniform1f(gl.getUniformLocation(this.program,"strength"),n.composition?.effects?.ripple?.strength??.18);gl.uniform1i(gl.getUniformLocation(this.program,"count"),Math.min(32,area.length));const pts=new Float32Array(64);area.slice(0,32).forEach((p,i)=>{pts[i*2]=p.x;pts[i*2+1]=1-p.y});gl.uniform2fv(gl.getUniformLocation(this.program,"pts"),pts);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);}
    else gl?.clear(gl.COLOR_BUFFER_BIT);this.raf=requestAnimationFrame(this.loop);
  }
  destroy(){cancelAnimationFrame(this.raf);this.canvas.remove();}
}
