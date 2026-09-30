export const NAVIGATION_DEFAULTS=Object.freeze({
  maxSpeed:250,
  minHeadingSpeed:8,
  rotationSharpness:8.5,
  cameraSharpness:7.7,
  cameraLookAheadDistance:150
});

export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function normalizeDegrees(value=0){
  return ((Number(value||0)+180)%360+360)%360-180;
}

export function shortestAngleDelta(current,target){
  return normalizeDegrees(Number(target||0)-Number(current||0));
}

export function expSmoothingFactor(dt,sharpness){
  const seconds=Math.max(0,Number(dt)||0);
  const rate=Math.max(0,Number(sharpness)||0);
  return 1-Math.exp(-rate*seconds);
}

export function smoothAngle(current,target,dt,sharpness=NAVIGATION_DEFAULTS.rotationSharpness){
  const factor=expSmoothingFactor(dt,sharpness);
  return normalizeDegrees(Number(current||0)+shortestAngleDelta(current,target)*factor);
}

export function velocityHeading(vx,vy,fallback=0,minSpeed=NAVIGATION_DEFAULTS.minHeadingSpeed){
  const x=Number(vx)||0;
  const y=Number(vy)||0;
  if(Math.hypot(x,y)<Math.max(0,Number(minSpeed)||0))return normalizeDegrees(fallback);
  return normalizeDegrees(Math.atan2(y,x)*180/Math.PI+90);
}

export function computeCameraLookAhead(vx,vy,{
  maxSpeed=NAVIGATION_DEFAULTS.maxSpeed,
  maxDistance=NAVIGATION_DEFAULTS.cameraLookAheadDistance
}={}){
  const x=Number(vx)||0;
  const y=Number(vy)||0;
  const speed=Math.hypot(x,y);
  if(speed<=0)return {x:0,y:0,distance:0};

  const speedLimit=Math.max(1,Number(maxSpeed)||1);
  const distanceLimit=Math.max(0,Number(maxDistance)||0);
  const ratio=clamp(speed/speedLimit,0,1);
  const distance=distanceLimit*ratio;
  const inv=1/speed;

  return {x:x*inv*distance,y:y*inv*distance,distance};
}
