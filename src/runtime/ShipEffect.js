export class ShipEffect {
  constructor(runtime,node){
    this.runtime=runtime;
    this.node=node;
    this.raf=0;
    this.wasMoving=false;
    this.loop=this.loop.bind(this);
    this.sync();
    this.raf=requestAnimationFrame(this.loop);
  }

  config(){
    const composition=this.node.composition||{};
    const animation=composition.animation||{};
    return {
      active:composition.active!==false,
      speed:Number(animation.speed??46),
      bob:Number(animation.bob??42),
      roll:Number(animation.roll??34),
      sway:Number(animation.sway??24)
    };
  }

  sync(){
    if(!this.config().active)this.stopMotion();
  }

  stopMotion(){
    if(!this.wasMoving)return;
    this.wasMoving=false;
    this.runtime.clearAnimationTransform(this.node.id);
  }

  loop(ms){
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const config=this.config();
    const canAnimate=config.active &&
      this.node.visible!==false &&
      this.runtime.mode==="play" &&
      (!reduced||this.runtime.editorEnabled);

    if(canAnimate){
      const speed=Math.max(0,config.speed)/100;
      const t=ms/1000*(0.45+speed*1.75);
      const bobAmplitude=Math.max(0,config.bob)/100*8;
      const rollAmplitude=Math.max(0,config.roll)/100*4.5;
      const swayAmplitude=Math.max(0,config.sway)/100*5;

      const y=Math.sin(t*2.15)*bobAmplitude + Math.sin(t*.83+1.7)*bobAmplitude*.22;
      const x=Math.sin(t*1.05+.65)*swayAmplitude;
      const rotation=Math.sin(t*1.62+.35)*rollAmplitude + Math.sin(t*.57)*rollAmplitude*.18;

      this.wasMoving=true;
      this.runtime.setAnimationTransform(this.node.id,{x,y,rotation});
    }else{
      this.stopMotion();
    }

    this.raf=requestAnimationFrame(this.loop);
  }

  destroy(){
    cancelAnimationFrame(this.raf);
    this.runtime.clearAnimationTransform(this.node.id);
  }
}
