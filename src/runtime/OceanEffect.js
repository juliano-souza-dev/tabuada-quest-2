
      void main(){
        vec2 uv=v_uv;
        float mask=texture2D(u_mask,uv).a;
        if(mask<0.02)discard;

        float t=u_time*u_speed;
        float w1=sin(uv.y*34.0+uv.x*8.0+t*1.45);
        float w2=sin(uv.y*19.0-uv.x*13.0-t*1.05);
        float w3=sin((uv.x+uv.y)*27.0+t*.72);
        float waves=w1*.50+w2*.31+w3*.19;

        float movement=u_movement*2.8;
        vec2 offset=vec2(
          (w1*.0036+w3*.0019)*movement,
          (w2*.0024+w3*.0012)*movement
        );

        if(u_ripples==1 && u_ripple_age>=0.0 && u_ripple_age<2.8){
          vec2 delta=uv-u_ripple;
          float dist=length(delta);
          float ring=sin((dist-u_ripple_age*.18)*95.0);
          float decay=exp(-u_ripple_age*1.7)*exp(-dist*2.2);
          vec2 dir=dist>.0001?delta/dist:vec2(0.0);
          offset+=dir*ring*decay*(.010+.020*u_movement);
        }

        vec4 color=texture2D(u_texture,clamp(uv+offset,0.001,0.999));

        float crest=smoothstep(.34,.95,waves*.5+.5);
        float sparkle=pow(max(0.0,sin((uv.x*1.2+uv.y)*92.0+t*2.1)),10.0);
        float light=(crest*.11+sparkle*.18)*u_shine;
        color.rgb+=vec3(.23,.55,.72)*light;

        float foamBand=sin(uv.y*73.0+uv.x*19.0+t*1.9)*.5+.5;
        float foamMask=smoothstep(.84,.98,foamBand)*smoothstep(.38,.92,crest)*u_foam;
        color.rgb=mix(color.rgb,vec3(.91,.98,1.0),foamMask*.34);

        color.a*=smoothstep(0.02,0.92,mask);
        gl_FragColor=color;
      }
    `;

    const compile=(type,source)=>{
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        const message=gl.getShaderInfoLog(shader)||"Falha ao compilar shader";
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    };

    const vertex=compile(gl.VERTEX_SHADER,vertexSource);
    const fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
    this.program=gl.createProgram();
    gl.attachShader(this.program,vertex);
    gl.attachShader(this.program,fragment);
    gl.linkProgram(this.program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){
      throw new Error(gl.getProgramInfoLog(this.program)||"Falha ao linkar programa WebGL");
    }

    this.buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
      -1,-1, 1,-1, -1,1,
      -1, 1, 1,-1,  1,1
    ]),gl.STATIC_DRAW);

    gl.useProgram(this.program);
    const position=gl.getAttribLocation(this.program,"a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);

    this.uniforms={
      texture:gl.getUniformLocation(this.program,"u_texture"),
      mask:gl.getUniformLocation(this.program,"u_mask"),
      time:gl.getUniformLocation(this.program,"u_time"),
      speed:gl.getUniformLocation(this.program,"u_speed"),
      movement:gl.getUniformLocation(this.program,"u_movement"),
      shine:gl.getUniformLocation(this.program,"u_shine"),
      foam:gl.getUniformLocation(this.program,"u_foam"),
      rippleAge:gl.getUniformLocation(this.program,"u_ripple_age"),
      ripple:gl.getUniformLocation(this.program,"u_ripple"),
      ripples:gl.getUniformLocation(this.program,"u_ripples")
    };

    this.texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    this.maskTexture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    this.uploadTexture();
    this.updateMaskTexture(true);
  }

  config(){
    const composition=this.node.composition||{};
    const animation=composition.animation||{};
    const legacy=composition.effects?.ripple||{};
    const legacyShine=Number(composition.appearance?.shine);
    const legacyFoam=Number(composition.appearance?.foam);
    return {
      active:composition.active!==false,
      preset:animation.preset||"adventure",
      speed:Number(animation.speed??Math.round((legacy.speed??.88)*50)),
      movement:Number(animation.movement??Math.round((legacy.strength??1.04)*50)),
      shine:Number(animation.shine??(Number.isFinite(legacyShine)?legacyShine*100:20)),
      foam:Number(animation.foam??(Number.isFinite(legacyFoam)?legacyFoam*100:57)),
      ripples:animation.ripples??composition.ripples??true,
      quality:animation.quality||"balanced"
    };
  }

  uploadTexture(){
    const gl=this.gl;
    const image=this.runtime.nodes.get(this.node.id)?.el;
    if(!gl||!image||image.tagName!=="IMG")return;
    const upload=()=>{
      try{
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        this.textureReady=true;
      }catch(error){
        this.textureReady=false;
        console.warn("[TabuadaQuest] Ocean texture fallback:",error);
      }
    };
    if(image.complete&&image.naturalWidth)upload();
    else image.addEventListener("load",upload,{once:true});
  }

  updateMaskTexture(force=false){
    const gl=this.gl;
    if(!gl||!this.maskTexture)return;
    const points=this.node.composition?.area?.points||[];
    const signature=points.map(point=>Number(point.x).toFixed(5)+","+Number(point.y).toFixed(5)).join(";");
    if(!force&&signature===this.maskSignature)return;
    this.maskSignature=signature;

    const size=512;
    if(!this.maskCanvas){
      this.maskCanvas=document.createElement("canvas");
      this.maskCanvas.width=size;
      this.maskCanvas.height=size;
      this.maskContext=this.maskCanvas.getContext("2d");
    }
    const ctx=this.maskContext;
    ctx.clearRect(0,0,size,size);
    if(points.length>=3){
      ctx.beginPath();
      points.forEach((point,index)=>{
        const x=Math.max(0,Math.min(1,Number(point.x)))*size;
        const y=Math.max(0,Math.min(1,Number(point.y)))*size;
        if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.fillStyle="#fff";
      ctx.fill();
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.maskCanvas);
    gl.activeTexture(gl.TEXTURE0);
    this.maskReady=points.length>=3;
  }

  qualityScale(){
    const quality=this.config().quality;
    if(quality==="economy")return .65;
    if(quality==="high")return Math.min(2,window.devicePixelRatio||1);
    return Math.min(1.25,window.devicePixelRatio||1);
  }

  sync(){
    const node=this.node;
    const canvas=this.canvas;
    const ox=this.runtime.sceneOffset?.x||0;
    const oy=this.runtime.sceneOffset?.y||0;
    const width=Math.max(1,node.width||1);
    const height=Math.max(1,node.height||1);
    canvas.style.left=(node.x+ox)+"px";
    canvas.style.top=(node.y+oy)+"px";
    canvas.style.width=width+"px";
    canvas.style.height=height+"px";
    canvas.style.zIndex=String(node.z??0);
    canvas.style.transform=`rotate(${node.rotation||0}deg) skew(${node.skewX||0}deg,${node.skewY||0}deg) scale(${node.scaleX||1},${node.scaleY||1})`;
    canvas.hidden=this.failed||node.visible===false||!this.config().active;
    this.updateMaskTexture();

    const dpr=this.qualityScale();
    const internalWidth=Math.max(1,Math.round(width*dpr));
    const internalHeight=Math.max(1,Math.round(height*dpr));
    if(canvas.width!==internalWidth||canvas.height!==internalHeight){
      canvas.width=internalWidth;
      canvas.height=internalHeight;
      this.gl?.viewport(0,0,internalWidth,internalHeight);
    }
  }

  pointInWater(x,y){
    const points=this.node.composition?.area?.points||[];
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],b=points[j];
      if(((a.y>y)!=(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y+Number.EPSILON)+a.x))inside=!inside;
    }
    return inside;
  }

  onPointerDown(event){
    if(this.failed||this.runtime.mode!=="play")return;
    const config=this.config();
    if(!config.active||!config.ripples)return;
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=(event.clientX-rect.left)/rect.width;
    const y=(event.clientY-rect.top)/rect.height;
    if(x<0||x>1||y<0||y>1||!this.pointInWater(x,y))return;
    this.ripple={x,y,startedAt:performance.now()/1000};
  }

  loop(ms){
    if(!this.canvas.isConnected)return;
    const gl=this.gl;
    const points=this.node.composition?.area?.points||[];
    const config=this.config();

    if(gl&&!this.failed&&config.active&&this.textureReady&&this.maskReady&&points.length>=3){
      this.canvas.hidden=false;
      gl.viewport(0,0,this.canvas.width,this.canvas.height);
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,this.texture);
      gl.uniform1i(this.uniforms.texture,0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
      gl.uniform1i(this.uniforms.mask,1);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(this.uniforms.time,ms/1000);
      gl.uniform1f(this.uniforms.speed,config.speed/100);
      gl.uniform1f(this.uniforms.movement,config.movement/100);
      gl.uniform1f(this.uniforms.shine,config.shine/100);
      gl.uniform1f(this.uniforms.foam,config.foam/100);
      gl.uniform1i(this.uniforms.ripples,config.ripples?1:0);
      gl.uniform2f(this.uniforms.ripple,this.ripple.x,this.ripple.y);
      gl.uniform1f(this.uniforms.rippleAge,ms/1000-this.ripple.startedAt);

      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }else if(gl){
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if(!config.active)this.canvas.hidden=true;
    }

    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if(!reduced||this.runtime.editorEnabled||!this.textureReady)this.raf=requestAnimationFrame(this.loop);
  }

  destroy(){
    cancelAnimationFrame(this.raf);
    this.runtime.stage.removeEventListener("pointerdown",this.onPointerDown,true);
    if(this.gl){
      if(this.texture)this.gl.deleteTexture(this.texture);
      if(this.maskTexture)this.gl.deleteTexture(this.maskTexture);
      if(this.buffer)this.gl.deleteBuffer(this.buffer);
      if(this.program)this.gl.deleteProgram(this.program);
    }
    this.canvas.remove();
  }
}
